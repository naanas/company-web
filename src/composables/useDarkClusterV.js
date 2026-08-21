import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from 'gsap'

// `three/webgpu` + its TSL node graph pull in a large chunk (compiler,
// WGSL/GLSL backends, node system) on top of the ~three core already used
// elsewhere on the page — loaded lazily inside `init()` so it lands as its
// own parallel chunk instead of bloating the main bundle every visitor pays
// for, most of whom never scroll past a static hero anyway.
async function loadThree() {
  const [THREE, geometryUtils, sobelModule, bayerModule, TSL] = await Promise.all([
    import('three/webgpu'),
    import('three/addons/utils/BufferGeometryUtils.js'),
    import('three/addons/tsl/display/SobelOperatorNode.js'),
    import('three/addons/tsl/math/Bayer.js'),
    import('three/tsl'),
  ])
  return { THREE, mergeGeometries: geometryUtils.mergeGeometries, sobel: sobelModule.sobel, bayerDither: bayerModule.bayerDither, TSL }
}

// How far each shard is pushed out from its parent face along that face's
// own outward normal — same idea as the Codrops "dark cluster" tutorial
// this is adapted from (github.com/kekkorider/codrops-tutorial-dark-cluster),
// just applied to a V-shaped source mesh instead of an icosahedron.
const FACE_EXTRUSION = 0.32
const ACCENT = [0.133, 0.827, 0.933] // --color-brand-accent (#22d3ee)
const SILVER = [0.82, 0.85, 0.88]
const NEAR_BLACK = [0.02, 0.02, 0.03]

/**
 * Builds a non-indexed, triangle-soup V geometry out of two rotated box
 * bars pivoting from a shared bottom point — swapping in for the
 * tutorial's `IcosahedronGeometry(1, 1)`. `buildShardCluster` below only
 * cares that the geometry is a flat list of triangles (every 9 floats one
 * face), so any triangulated source mesh works here, not just spheres.
 */
function buildVGeometry(THREE, mergeGeometries) {
  const width = 0.5
  const length = 2.7
  const thickness = 0.36
  const angle = THREE.MathUtils.degToRad(24)

  function bar(sign) {
    const geometry = new THREE.BoxGeometry(width, length, thickness, 2, 7, 1)
    geometry.translate(0, length / 2, 0) // pivot at the bar's bottom end
    geometry.rotateZ(sign * angle)
    return geometry
  }

  const merged = mergeGeometries([bar(1), bar(-1)])
  const nonIndexed = merged.toNonIndexed()
  const topY = length * Math.cos(angle)
  nonIndexed.translate(0, -topY / 2, 0) // recenter the V around the origin
  return nonIndexed
}

/**
 * Invisible raycast target (BackSide, no color/depth write) that the
 * cluster material's hover glow is computed against — same split as the
 * source tutorial's Inner/Cluster material pair.
 */
function buildMaterials(THREE, TSL) {
  const { Fn, uniform, vec3, positionWorld, positionLocal, distance, attribute, float, mx_noise_float, time, normalWorld, mix, dot, modelWorldMatrix } = TSL

  const hoverPointWS = uniform(vec3(0, 0, 0))
  const effectStrength = uniform(0)

  const hoverEffect = Fn(([positionWS]) => {
    return distance(positionWS, hoverPointWS).clamp(0, 1).smoothstep(0.8, 0.2).mul(effectStrength)
  })

  const innerMaterial = new THREE.MeshBasicNodeMaterial({
    side: THREE.BackSide,
    colorWrite: false,
    depthWrite: false,
  })
  innerMaterial.colorNode = Fn(() => hoverEffect(positionWorld))()

  const clusterMaterial = new THREE.MeshBasicNodeMaterial()

  const scaleMin = float(0.15)
  const scaleMax = float(0.7)
  const centered = attribute('position', 'vec3')
  const centroid = positionLocal.sub(centered)
  const centroidWS = modelWorldMatrix.mul(centroid)
  const hover = hoverEffect(centroidWS)

  const colorA = vec3(...SILVER)
  const colorB = vec3(...NEAR_BLACK)
  const accent = vec3(...ACCENT)

  // Faces pointing toward the V's own center shade light-to-dark by a
  // fake "facing" term (no real lights in this scene); on hover the lit
  // side blends toward the brand-accent cyan instead of staying silver.
  clusterMaterial.colorNode = Fn(() => {
    const toOrigin = vec3(0, 0, 0).sub(positionWorld).normalize()
    const dotRemapped = dot(normalWorld, toOrigin).remap(-1, 1, 0, 1)
    const colorWithHover = mix(colorA, accent, hover)
    return mix(colorB, colorWithHover, dotRemapped.smoothstep(0.3, 0.95))
  })()

  // Each shard "breathes" in and out along its own extrusion direction,
  // driven by scroll-independent simplex noise over time; hovering nearby
  // pushes shards out further on top of that.
  clusterMaterial.positionNode = Fn(() => {
    const t = time.mul(0.4)
    const noise = mx_noise_float(centroid.yz.add(t))
    noise.remapAssign(-1, 1, scaleMin, scaleMax)
    const scaleByHover = hover.remap(0, 1, 0, 0.4)
    return centroid.add(centered.mul(noise.add(scaleByHover)))
  })()

  return { innerMaterial, clusterMaterial, hoverPointWS, effectStrength }
}

/**
 * For every triangular face of `sourceMesh`, builds an extruded
 * triangular-prism "shard" (8 triangles) and adds it as one instance of a
 * single BatchedMesh — a direct port of the tutorial's `createExtrudedFaces`,
 * generalized to whatever geometry is passed in.
 *
 * The tutorial extrudes each shard along `faceCentroid - mesh.position`
 * (direction from the mesh's origin to the face) rather than the face's own
 * normal — a shortcut that only works because their source mesh is a
 * roughly-spherical icosahedron centered at that same origin, where
 * "away from center" and "face normal" happen to coincide. An elongated,
 * off-center shape like this V doesn't have that property, so this version
 * computes each face's actual normal instead — the fix that turns the
 * shard cluster from a smeared, off-axis mess into a clean V silhouette.
 */
function buildShardCluster(THREE, sourceMesh, clusterMaterial) {
  const { geometry } = sourceMesh
  const positionAttribute = geometry.getAttribute('position')
  const { array } = positionAttribute
  const numVertices = array.length
  const numFaces = numVertices / 9

  const facesMesh = new THREE.BatchedMesh(numFaces, numVertices * 6, numVertices * 6, clusterMaterial)
  facesMesh.name = 'facesMesh'

  const faceCentroid = new THREE.Vector3()
  const faceNormal = new THREE.Vector3()
  const vA = new THREE.Vector3()
  const vB = new THREE.Vector3()
  const vC = new THREE.Vector3()
  const triangle = new THREE.Triangle()
  const instanceMatrix = new THREE.Matrix4()

  for (let i = 0; i < numVertices; i += 9) {
    const x1 = array[i + 0], y1 = array[i + 1], z1 = array[i + 2]
    const x2 = array[i + 3], y2 = array[i + 4], z2 = array[i + 5]
    const x3 = array[i + 6], y3 = array[i + 7], z3 = array[i + 8]

    faceCentroid.set(x1 + x2 + x3, y1 + y2 + y3, z1 + z2 + z3).divideScalar(3)
    vA.set(x1, y1, z1)
    vB.set(x2, y2, z2)
    vC.set(x3, y3, z3)
    triangle.set(vA, vB, vC)
    triangle.getNormal(faceNormal)

    const ex = faceNormal.x * FACE_EXTRUSION
    const ey = faceNormal.y * FACE_EXTRUSION
    const ez = faceNormal.z * FACE_EXTRUSION

    const x4 = x1 + ex, y4 = y1 + ey, z4 = z1 + ez
    const x5 = x2 + ex, y5 = y2 + ey, z5 = z2 + ez
    const x6 = x3 + ex, y6 = y3 + ey, z6 = z3 + ez

    const instanceGeometry = new THREE.BufferGeometry()
    const attributeArray = new Float32Array([
      x1, y1, z1, x3, y3, z3, x2, y2, z2,
      x1, y1, z1, x2, y2, z2, x4, y4, z4,
      x2, y2, z2, x5, y5, z5, x4, y4, z4,
      x2, y2, z2, x3, y3, z3, x5, y5, z5,
      x3, y3, z3, x6, y6, z6, x5, y5, z5,
      x3, y3, z3, x1, y1, z1, x6, y6, z6,
      x1, y1, z1, x4, y4, z4, x6, y6, z6,
      x4, y4, z4, x5, y5, z5, x6, y6, z6,
    ])
    instanceGeometry.setAttribute('position', new THREE.Float32BufferAttribute(attributeArray, 3))
    instanceGeometry.translate(-faceCentroid.x, -faceCentroid.y, -faceCentroid.z)

    const geometryId = facesMesh.addGeometry(instanceGeometry)
    const instanceId = facesMesh.addInstance(geometryId)
    instanceMatrix.makeTranslation(faceCentroid.x, faceCentroid.y, faceCentroid.z)
    facesMesh.setMatrixAt(instanceId, instanceMatrix)
  }

  facesMesh.geometry.computeVertexNormals()
  return facesMesh
}

/**
 * Mounts a spinning, noise-breathing cluster of shards arranged into a V
 * (echoing the site's own V mark) into `canvasRef`, sized to `containerRef`.
 * Adapted from tympanus.net/codrops "dark cluster" tutorial — WebGPU/TSL
 * node materials, no `three-start` scaffolding or matcap asset, brand-accent
 * hover color instead. Silently no-ops (canvas stays hidden) if WebGPU/TSL
 * initialization fails, so the hero's video background is always a safe
 * fallback rather than a broken canvas.
 */
export function useDarkClusterV(canvasRef, containerRef) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let THREE = null
  let renderer = null
  let camera = null
  let innerMesh = null
  let hoverPointWS = null
  let effectStrength = null
  let renderPipeline = null
  let raycaster = null
  let ndc = null
  let clock = null
  let raf = null
  let resizeObserver = null
  let intersectionObserver = null
  let isVisible = true
  let disposed = false

  function onPointerMove(event) {
    if (!containerRef.value || !innerMesh || !camera) return
    const rect = containerRef.value.getBoundingClientRect()
    ndc.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)

    raycaster.setFromCamera(ndc, camera)
    const hit = raycaster.intersectObject(innerMesh, false)
    const isHover = hit.length > 0

    gsap.to(effectStrength, {
      value: isHover ? 1 : 0,
      duration: isHover ? 0.5 : 0.2,
      ease: 'power2.out',
      overwrite: true,
    })

    if (isHover) {
      gsap.to(hoverPointWS.value, {
        x: hit[0].point.x,
        y: hit[0].point.y,
        z: hit[0].point.z,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true,
      })
    }
  }

  function resize() {
    if (!containerRef.value || !renderer || !camera) return
    const { clientWidth: w, clientHeight: h } = containerRef.value
    if (!w || !h) return
    // The Sobel + Bayer post-process pass costs scale with pixel count, so
    // narrow (likely weaker-GPU) viewports get a tighter cap than desktop.
    const dprCap = window.innerWidth < 640 ? 1.5 : 2
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }

  function animate() {
    if (disposed) return
    raf = requestAnimationFrame(animate)
    if (!isVisible || !renderPipeline) return

    const dt = clock.getDelta()
    if (!reduceMotion && innerMesh) {
      innerMesh.rotation.y += dt * 0.25
    }

    renderPipeline.render()
  }

  async function init() {
    if (!canvasRef.value || !containerRef.value) return
    if (!navigator.gpu) return // no WebGPU, no WebGL/TSL fallback attempt — keep the video-only hero

    const loaded = await loadThree()
    THREE = loaded.THREE
    const { mergeGeometries, sobel, bayerDither, TSL } = loaded

    if (disposed || !canvasRef.value) return

    raycaster = new THREE.Raycaster()
    ndc = new THREE.Vector2()

    const scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 3.8

    // Opaque, matching --color-brand-950 exactly — simpler and more robust
    // than fighting the post-processing pipeline for alpha compositing, and
    // this canvas is the hero's sole background layer now anyway, so there's
    // nothing beneath it that needs to show through.
    //
    // `antialias: false` — the Sobel edge-detect + Bayer dithering pass below
    // already breaks every edge into a stylized dithered pattern, so MSAA'd
    // smooth edges get dithered right back into jagged ones; it was paying
    // for a smoothing step the final look throws away. Dropping it cuts both
    // pipeline-compile time (part of the hero's on-load stutter) and
    // per-frame render cost, with no visible difference in the dithered
    // output.
    renderer = new THREE.WebGPURenderer({ canvas: canvasRef.value, antialias: false })
    renderer.setClearColor(0x060607, 1)
    await renderer.init()

    const vGeometry = buildVGeometry(THREE, mergeGeometries)
    const materials = buildMaterials(THREE, TSL)
    hoverPointWS = materials.hoverPointWS
    effectStrength = materials.effectStrength

    innerMesh = new THREE.Mesh(vGeometry, materials.innerMaterial)
    scene.add(innerMesh)
    innerMesh.add(buildShardCluster(THREE, innerMesh, materials.clusterMaterial))

    // Sobel edge-detect on scene depth + Bayer dithering on the result —
    // the graphic, dithered-outline look the tutorial is named after.
    const { Fn, pass } = TSL
    const scenePass = pass(scene, camera)
    const scenePassColor = scenePass.getTextureNode()
    const scenePassDepth = scenePass.getTextureNode('depth')
    const sobelPass = Fn(() => sobel(scenePassDepth).step(0.01))()

    renderPipeline = new THREE.RenderPipeline(renderer)
    renderPipeline.outputNode = Fn(() => {
      const result = scenePassColor.add(sobelPass)
      result.assign(bayerDither(result))
      return result
    })()

    resize()
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(containerRef.value)

    if (!reduceMotion) {
      containerRef.value.addEventListener('pointermove', onPointerMove)
    }

    // Pause the render loop while the hero is scrolled out of view instead
    // of paying for a continuous WebGPU render every frame regardless.
    intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
    })
    intersectionObserver.observe(containerRef.value)

    clock = new THREE.Clock()
    animate()
  }

  onMounted(() => {
    init().catch(() => {
      if (canvasRef.value) canvasRef.value.style.display = 'none'
    })
  })

  onBeforeUnmount(() => {
    disposed = true
    if (raf) cancelAnimationFrame(raf)
    resizeObserver?.disconnect()
    intersectionObserver?.disconnect()
    containerRef.value?.removeEventListener('pointermove', onPointerMove)
    renderPipeline?.dispose()
    renderer?.dispose()
  })
}
