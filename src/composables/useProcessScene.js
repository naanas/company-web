import { onBeforeUnmount, onMounted, ref } from 'vue'
import { whenIdle } from './useIdle'
import { lenisScrollTo } from './useLenis'

const mqFine = window.matchMedia('(pointer: fine)')
const mqWide = window.matchMedia('(min-width: 1024px)')
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)')

const FOV = 45
const FOCUS_ZOOM = 0.42 // fraction of resting camera distance to dolly in to on focus
const PARALLAX_X = 55
const PARALLAX_Y = 32
const COL_Z = [-150, 55, -150] // outer columns recede, center comes forward
// No column rotation on purpose — an earlier version leaned the outer
// columns inward with rotateY, which compressed their *vertical* spacing
// enough (perspective skew on a tilted, off-center plane) that non-adjacent
// rows' rects started overlapping, making click resolution ambiguous. Pure
// Z-axis recession still reads as a curved/bowed grid without that.
const ROW_Z = [0, 10, 16, 10, -8] // per-row arch bump, indexed 0..4 — kept small since
// it changes a card's *apparent* size via perspective foreshortening, and too much
// variance was making neighbouring rows visually overlap
const ROW_CENTER = 2
const ROW_PITCH = 232
const LAMBDA_XY = 8
const LAMBDA_Z = 5.5

function damp(a, b, lambda, dt) {
  return b + (a - b) * Math.exp(-lambda * dt)
}

async function loadThree() {
  const [THREE, CSS3D] = await Promise.all([import('three'), import('three/addons/renderers/CSS3DRenderer.js')])
  return { THREE, CSS3DRenderer: CSS3D.CSS3DRenderer, CSS3DObject: CSS3D.CSS3DObject }
}

/**
 * Real Three.js camera driving the Our Process grid — cards are wrapped as
 * CSS3DObjects (three.js's addon for positioning genuine DOM elements with
 * a true 3D camera matrix) rather than WebGL meshes with baked-texture
 * text, so step copy stays crisp, selectable, and screen-reader accessible
 * (the way shoe-finder's own product name/price is a plain DOM overlay,
 * not part of the WebGL scene — only the product photo is).
 *
 * A pointer-driven parallax offsets the camera at rest, damped exponentially
 * frame-to-frame (chase-the-target, not tween-to-endpoint — matches the
 * source article's approach), and freezes the instant the pointer is over a
 * card so it isn't still drifting under the cursor at the moment of a click.
 * Clicking a card dollies the camera in on it instead of moving/teleporting
 * the element, so "zoom" is a literal camera move.
 *
 * Card selection itself doesn't trust the native click target at all — see
 * onSceneClick's comment for why Chromium's hit-testing through this
 * transform stack can't be relied on, and how clicks are resolved instead.
 *
 * Desktop mouse/trackpad only (`pointer: fine`, `min-width: 1024px`, motion
 * allowed) — touch and reduced-motion get the plain flat grid + Teleported
 * zoom overlay ProcessSection already renders for everyone by default.
 */
export function useProcessScene(stageRef) {
  const eligible = mqFine.matches && mqWide.matches && !mqReduce.matches
  const focused = ref(null)

  if (!eligible) {
    return { eligible, focused, toggleFocus() {}, unfocus() {} }
  }

  let THREE = null
  let renderer = null
  let camera = null
  let scene = null
  let cameraLayer = null // CSS3DRenderer's innermost DOM layer — see bringToFront()
  let raf = null
  let resizeObserver = null
  let intersectionObserver = null
  let visible = true
  let disposed = false
  let pointerActive = false
  let lastTime = 0

  const objects = new Map() // element -> CSS3DObject
  const restPos = new Map() // element -> { x, y, z }
  const target = { x: 0, y: 0, z: 900 }

  function layoutObjects() {
    if (!stageRef.value) return
    const rect = stageRef.value.getBoundingClientRect()
    const w = rect.width
    if (!w) return

    // Positions are derived from the stage's own current width rather than
    // measured from each card's live rect: once a card is lifted into the
    // CSS3D scene it no longer participates in document flow, so its flow
    // rect would just read back whatever fixed size we last set it to —
    // not a value resize could usefully react to.
    const colWidth = Math.min(380, Math.max(260, w * 0.27))
    const colGap = Math.max(28, w * 0.045)
    const totalWidth = colWidth * 3 + colGap * 2
    const startX = -totalWidth / 2 + colWidth / 2

    objects.forEach((obj, el) => {
      const col = Number(el.dataset.col)
      const row = Number(el.dataset.row)
      el.style.width = `${colWidth}px`
      const x = startX + col * (colWidth + colGap)
      const y = (ROW_CENTER - row) * ROW_PITCH
      const z = (COL_Z[col] ?? 0) + (ROW_Z[row] ?? 0)
      obj.position.set(x, y, z)
      restPos.set(el, { x, y, z })
    })

    if (focused.value) {
      const pos = restPos.get(focused.value)
      if (pos) {
        target.x = pos.x
        target.y = pos.y
      }
    }
  }

  function resize() {
    if (!stageRef.value || !renderer || !camera) return
    const rect = stageRef.value.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    if (!w || !h) return
    camera.aspect = w / h
    const vFovRad = THREE.MathUtils.degToRad(FOV)
    const restZ = h / 2 / Math.tan(vFovRad / 2)
    camera.near = 1
    camera.far = restZ * 6
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    if (!focused.value) target.z = restZ
    layoutObjects()
  }

  function onPointerMove(event) {
    if (!stageRef.value || focused.value) return
    pointerActive = true
    // Freeze the parallax the instant the pointer is actually over a card:
    // without this, the camera keeps chasing the cursor right up to the
    // click, so the card is still drifting under the pointer when the click
    // lands — a moving target that made clicks land on the wrong box. Only
    // updating the target while hovering open stage background means
    // whatever card is under the cursor holds still the moment it matters.
    if (event.target.closest('[data-card]')) return
    const rect = stageRef.value.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    target.x = px * PARALLAX_X
    target.y = -py * PARALLAX_Y
  }

  function onPointerLeave() {
    pointerActive = false
    if (!focused.value) {
      target.x = 0
      target.y = 0
    }
  }

  // CSS3DRenderer only ever *adds* an object's element the first time it's
  // rendered (`if (element.parentNode !== cameraElement) appendChild(...)`)
  // — it never re-sorts already-mounted siblings. All 13 cards share that
  // one flat layer, so paint order (and, critically, which one wins a
  // pointer hit where two overlap) is fixed at whatever order they were
  // first added in. Re-appending the focused card moves it to the end of
  // that layer — the one DOM operation that actually changes stacking
  // order after the fact — so the enlarged, camera-nearest card always
  // wins hit-testing over its (now visually smaller, further) neighbours.
  function bringToFront(el) {
    cameraLayer?.appendChild(el)
  }

  function toggleFocus(el) {
    if (focused.value === el) {
      unfocus()
      return
    }
    if (focused.value) focused.value.dataset.focused = 'false'
    focused.value = el
    el.dataset.focused = 'true'
    bringToFront(el)
    const pos = restPos.get(el)
    if (pos) {
      target.x = pos.x
      target.y = pos.y
    }
    const rect = stageRef.value.getBoundingClientRect()
    const vFovRad = THREE.MathUtils.degToRad(FOV)
    const restZ = rect.height / 2 / Math.tan(vFovRad / 2)
    target.z = restZ * FOCUS_ZOOM

    // Centers the card in the *viewport*, not just within the stage's own
    // (often taller-than-the-screen) coordinate space — without this, a
    // card near the top or bottom of the stage dollies to a point that's
    // still off-screen if the section itself isn't fully in view yet.
    const cardRect = el.getBoundingClientRect()
    const targetScrollY =
      window.scrollY + cardRect.top + cardRect.height / 2 - window.innerHeight / 2
    lenisScrollTo(targetScrollY, { duration: 0.9 })
  }

  function unfocus() {
    if (focused.value) focused.value.dataset.focused = 'false'
    focused.value = null
    if (!pointerActive) {
      target.x = 0
      target.y = 0
    }
    const rect = stageRef.value.getBoundingClientRect()
    const vFovRad = THREE.MathUtils.degToRad(FOV)
    target.z = rect.height / 2 / Math.tan(vFovRad / 2)
  }

  // Chromium's native hit-testing (elementFromPoint, and therefore which
  // element a real click's `target` resolves to) is unreliable through
  // CSS3DRenderer's transform stack — it can disagree with what's actually
  // painted (and with getBoundingClientRect, which *does* stay accurate)
  // for elements a `perspective()` transform-function away from the
  // camera, occasionally resolving a click to the wrong card entirely, not
  // just a neighbour. Rather than trust event.target, this resolves the
  // click geometrically against every card's own (trustworthy) rect.
  function onSceneClick(event) {
    const { clientX: cx, clientY: cy } = event
    let matched = null
    let matchedZ = -Infinity
    objects.forEach((_obj, el) => {
      const r = el.getBoundingClientRect()
      if (cx < r.left || cx > r.right || cy < r.top || cy > r.bottom) return
      const z = restPos.get(el)?.z ?? 0
      if (!matched || z > matchedZ) {
        matched = el
        matchedZ = z
      }
    })
    if (matched) toggleFocus(matched)
    else unfocus()
  }

  function onKeydown(event) {
    if (event.key === 'Escape') unfocus()
  }

  function animate(time) {
    if (disposed) return
    raf = requestAnimationFrame(animate)
    if (!visible) return
    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.1) : 0
    lastTime = time
    camera.position.x = damp(camera.position.x, target.x, LAMBDA_XY, dt)
    camera.position.y = damp(camera.position.y, target.y, LAMBDA_XY, dt)
    camera.position.z = damp(camera.position.z, target.z, LAMBDA_Z, dt)
    renderer.render(scene, camera)
  }

  async function init() {
    if (!stageRef.value) return
    const sceneRoot = stageRef.value.querySelector('.scene3d-root')
    const cards = [...stageRef.value.querySelectorAll('[data-card]')]
    if (!sceneRoot || !cards.length) return

    const loaded = await loadThree()
    if (disposed || !stageRef.value) return
    THREE = loaded.THREE
    const { CSS3DRenderer, CSS3DObject } = loaded

    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(FOV, 1, 1, 6000)
    renderer = new CSS3DRenderer()
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    sceneRoot.appendChild(renderer.domElement)
    // CSS3DRenderer's own DOM: domElement > viewElement > cameraElement.
    // cameraElement is where every CSS3DObject's element actually lands —
    // see bringToFront() above for why this reference matters.
    cameraLayer = renderer.domElement.firstElementChild?.firstElementChild ?? null

    // Cards are added furthest-Z first, nearest-Z last: CSS3DRenderer mounts
    // every card as a flat sibling (real 3D compositing for painting, but
    // hit-testing where two overlap falls back to plain DOM/paint order,
    // last-added wins) — so without this, a receded outer-column card added
    // *after* the enlarged center column in markup order could still steal
    // clicks meant for the card visually in front of it.
    const orderedCards = [...cards].sort((a, b) => {
      const za = (COL_Z[Number(a.dataset.col)] ?? 0) + (ROW_Z[Number(a.dataset.row)] ?? 0)
      const zb = (COL_Z[Number(b.dataset.col)] ?? 0) + (ROW_Z[Number(b.dataset.row)] ?? 0)
      return za - zb
    })
    orderedCards.forEach((el) => {
      const obj = new CSS3DObject(el)
      objects.set(el, obj)
      scene.add(obj)
    })

    resize()
    camera.position.set(target.x, target.y, target.z)

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(stageRef.value)

    stageRef.value.addEventListener('pointermove', onPointerMove)
    stageRef.value.addEventListener('pointerleave', onPointerLeave)
    sceneRoot.addEventListener('click', onSceneClick)
    stageRef.value.addEventListener('keydown', onKeydown)

    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    intersectionObserver.observe(stageRef.value)

    raf = requestAnimationFrame(animate)
  }

  onMounted(() => {
    // Deferred like every other below-the-fold section's setup — see
    // useIdle.js — and doubly so here since it also pulls in the `three`
    // core chunk, which nothing above the fold needs.
    whenIdle(() => {
      init()
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    if (raf) cancelAnimationFrame(raf)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    stageRef.value?.removeEventListener('pointermove', onPointerMove)
    stageRef.value?.removeEventListener('pointerleave', onPointerLeave)
    stageRef.value?.removeEventListener('keydown', onKeydown)
    stageRef.value?.querySelector('.scene3d-root')?.removeEventListener('click', onSceneClick)
    objects.forEach((_obj, el) => {
      el.style.transform = ''
      el.style.width = ''
    })
  })

  return { eligible, focused, toggleFocus, unfocus }
}
