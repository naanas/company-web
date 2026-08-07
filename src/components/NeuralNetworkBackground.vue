<script setup>
/**
 * Full-bleed interactive particle network for the hero background. Most
 * nodes are seeded along two strokes forming a "V" (echoing the VELTECH
 * mark) with a sparse scatter of ambient nodes across the rest of the
 * canvas so the V reads as the dense core of one continuous network
 * rather than an isolated logo. Nodes idle-drift, spring back to their
 * seeded position, and get pushed away from the pointer; edges are drawn
 * between any two nodes closer than `LINK_DIST`, plus a brighter set from
 * the pointer itself to nearby nodes so the cursor reads as part of the
 * graph. Skips the physics loop (renders one static frame) under
 * `prefers-reduced-motion`.
 *
 * On top of the 2D particle sim, the canvas element itself gets a real
 * CSS 3D tilt (perspective + rotateX/rotateY, the classic GSAP
 * "quickTo-driven pointer tilt" technique) so hovering left/right rotates
 * the whole plane like it's a physical card, and a scroll-scrubbed scale
 * anchored at the V's apex so scrolling through the hero dollies in
 * toward the tip and back out.
 */
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const wrapperRef = useTemplateRef('wrapper')
const canvasRef = useTemplateRef('canvas')

const V_NODE_COUNT = 110
const AMBIENT_NODE_COUNT = 45
const LINK_DIST = 118
const MOUSE_RADIUS = 150
const MOUSE_LINK_DIST = 190

// Apex sits at 86% down the section — kept in sync with the CSS
// `transform-origin` below so the scroll-zoom dollies toward the same
// point the nodes actually converge on.
const APEX_Y_FRACTION = 0.86
const TILT_MAX = 16 // degrees
const ZOOM_MAX = 1.35

let ctx = null
let width = 0
let height = 0
let dpr = 1
let nodes = []
let rafId = null
let resizeObserver = null
let clock = 0
const pointer = { x: -9999, y: -9999, active: false }
let reducedMotion = false
let zoomTriggerInstance = null

// Tweened as plain numbers, not as the canvas element's own CSS transform —
// gsap.quickTo driving rotateX/rotateY/scale directly on a DOM element
// fights ScrollTrigger's own transform bookkeeping on that same element
// (surfaces as a silent "not eligible for reset" warning and the rotation
// never actually applying). Tweening a plain object and writing the
// combined `transform` string ourselves in the render loop sidesteps that
// entirely.
const camera = { tiltX: 0, tiltY: 0, zoom: 1 }
let setTiltX, setTiltY, setZoom

function seedNodes() {
  nodes = []

  // Two arms of a V, each sampled as a jittered line of nodes — jitter is
  // perpendicular-ish (both axes, but small) so the arm reads as a loose
  // organic stroke rather than a perfectly straight row of dots.
  const apex = { x: width * 0.5, y: height * APEX_Y_FRACTION }
  const topLeft = { x: width * 0.28, y: height * 0.14 }
  const topRight = { x: width * 0.72, y: height * 0.14 }

  const seedArm = (from, to, count) => {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const bx = from.x + (to.x - from.x) * t
      const by = from.y + (to.y - from.y) * t
      nodes.push(makeNode(bx + (Math.random() - 0.5) * 22, by + (Math.random() - 0.5) * 22, true))
    }
  }

  seedArm(topLeft, apex, V_NODE_COUNT / 2)
  seedArm(apex, topRight, V_NODE_COUNT / 2)

  for (let i = 0; i < AMBIENT_NODE_COUNT; i++) {
    nodes.push(makeNode(Math.random() * width, Math.random() * height, false))
  }
}

function makeNode(bx, by, isCore) {
  return {
    bx,
    by,
    x: bx,
    y: by,
    vx: 0,
    vy: 0,
    phase: Math.random() * Math.PI * 2,
    freq: 0.4 + Math.random() * 0.4,
    r: isCore ? 1.6 + Math.random() * 1.4 : 1 + Math.random(),
    isCore,
  }
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.parentElement.getBoundingClientRect()
  width = rect.width
  height = rect.height
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  seedNodes()
  ScrollTrigger.refresh()
  if (reducedMotion) drawFrame()
}

function step(node) {
  if (!reducedMotion) {
    const idleX = Math.sin(clock * node.freq + node.phase) * 5
    const idleY = Math.cos(clock * node.freq * 1.3 + node.phase) * 5
    const targetX = node.bx + idleX
    const targetY = node.by + idleY

    const dx = node.x - pointer.x
    const dy = node.y - pointer.y
    const distSq = dx * dx + dy * dy
    if (pointer.active && distSq < MOUSE_RADIUS * MOUSE_RADIUS) {
      const dist = Math.sqrt(distSq) || 1
      const force = (1 - dist / MOUSE_RADIUS) * 2.2
      node.vx += (dx / dist) * force
      node.vy += (dy / dist) * force
    }

    node.vx += (targetX - node.x) * 0.02
    node.vy += (targetY - node.y) * 0.02
    node.vx *= 0.86
    node.vy *= 0.86
    node.x += node.vx
    node.y += node.vy
  }
}

function drawFrame() {
  ctx.clearRect(0, 0, width, height)

  // Edges first so node dots sit on top.
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist >= LINK_DIST) continue
      const alpha = (1 - dist / LINK_DIST) * (a.isCore && b.isCore ? 0.5 : 0.22)
      ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }

    if (pointer.active) {
      const dx = a.x - pointer.x
      const dy = a.y - pointer.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < MOUSE_LINK_DIST) {
        ctx.strokeStyle = `rgba(148, 226, 245, ${(1 - dist / MOUSE_LINK_DIST) * 0.65})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(pointer.x, pointer.y)
        ctx.stroke()
      }
    }
  }

  for (const node of nodes) {
    ctx.fillStyle = node.isCore ? 'rgba(148, 226, 245, 0.9)' : 'rgba(148, 226, 245, 0.45)'
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function applyCameraTransform() {
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.style.transform = `rotateX(${camera.tiltX}deg) rotateY(${camera.tiltY}deg) scale(${camera.zoom})`
}

function tick() {
  clock += 0.016
  for (const node of nodes) step(node)
  drawFrame()
  applyCameraTransform()
  console.log('[debug] tick', clock, reducedMotion, camera.tiltX)
  rafId = requestAnimationFrame(tick)
}

function onPointerMove(e) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  pointer.x = e.clientX - rect.left
  pointer.y = e.clientY - rect.top
  pointer.active = true

  if (!reducedMotion) {
    const nx = (pointer.x / rect.width) * 2 - 1
    const ny = (pointer.y / rect.height) * 2 - 1
    setTiltY?.(nx * TILT_MAX)
    setTiltX?.(-ny * TILT_MAX * 0.35)
  }
}

function onPointerLeave() {
  pointer.active = false
  if (!reducedMotion) {
    gsap.to(camera, { tiltX: 0, tiltY: 0, duration: 1, ease: 'elastic.out(1, 0.5)' })
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  ctx = canvas.getContext('2d')
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.parentElement)

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)

  if (!reducedMotion) {
    setTiltX = gsap.quickTo(camera, 'tiltX', { duration: 0.6, ease: 'power3.out' })
    setTiltY = gsap.quickTo(camera, 'tiltY', { duration: 0.6, ease: 'power3.out' })
    setZoom = gsap.quickTo(camera, 'zoom', { duration: 0.3, ease: 'none' })

    // Dollies toward the V's apex as the hero scrolls out, then eases back
    // to the original framing — a triangle-shaped progress curve (0 -> 1
    // -> 0) mapped straight to scale, anchored at the apex via
    // `transform-origin` so it reads as pushing into that point.
    zoomTriggerInstance = ScrollTrigger.create({
      trigger: wrapperRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.4,
      onUpdate: (self) => {
        const zoomProgress = 1 - Math.abs(self.progress * 2 - 1)
        setZoom(1 + zoomProgress * (ZOOM_MAX - 1))
      },
    })

    rafId = requestAnimationFrame(tick)
  }
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  zoomTriggerInstance?.kill()
  const canvas = canvasRef.value
  canvas?.removeEventListener('pointermove', onPointerMove)
  canvas?.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<template>
  <div ref="wrapper" class="absolute inset-0 h-full w-full [perspective:1400px]">
    <canvas
      ref="canvas"
      class="absolute inset-0 h-full w-full"
      style="transform-origin: 50% 86%"
    />
  </div>
</template>
