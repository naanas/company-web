import { onBeforeUnmount, onMounted } from 'vue'

const LINE_COUNT = 7
const TOUCH_RADIUS = 150
const TOUCH_MAX_FORCE = 6
const BLAST_RADIUS = 260
const BLAST_MAX_FORCE = 16
const SPRING_K = 0.12
const DAMPING = 0.85
const MAX_PARTICLES = 160

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function nearestPointOnSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const lenSq = dx * dx + dy * dy || 1
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq))
  return { x: x1 + dx * t, y: y1 + dy * t }
}

/**
 * A field of thin background lines that bend away from the cursor (damped
 * spring, snapping back on release) and can be "detonated" via startBlast —
 * a sustained radial push at the current pointer position that kicks nearby
 * lines harder and spawns a burst of fading particles for as long as it's
 * held. Pure Canvas 2D with its own rAF loop, independent of GSAP/Lenis.
 */
export function useInteractiveLineField(canvasRef, containerRef) {
  let ctx = null
  let raf = null
  let width = 0
  let height = 0
  let lines = []
  let particles = []
  let resizeObserver = null
  const pointer = { x: -9999, y: -9999, active: false }
  let blasting = false

  function buildLines() {
    lines = Array.from({ length: LINE_COUNT }, () => ({
      x1: rand(-0.15, 1.15) * width,
      y1: rand(-0.15, 1.15) * height,
      x2: rand(-0.15, 1.15) * width,
      y2: rand(-0.15, 1.15) * height,
      offset: 0,
      velocity: 0,
    }))
  }

  function resize() {
    if (!canvasRef.value || !containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    width = rect.width
    height = rect.height
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvasRef.value.width = width * dpr
    canvasRef.value.height = height * dpr
    canvasRef.value.style.width = `${width}px`
    canvasRef.value.style.height = `${height}px`
    ctx = canvasRef.value.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    buildLines()
  }

  function onPointerMove(e) {
    if (!containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    pointer.x = e.clientX - rect.left
    pointer.y = e.clientY - rect.top
    pointer.active = true
  }

  function onWindowBlur() {
    pointer.active = false
  }

  function spawnParticle(x, y) {
    if (particles.length >= MAX_PARTICLES) particles.shift()
    const angle = rand(0, Math.PI * 2)
    const speed = rand(1.2, 5)
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.012, 0.03),
      size: rand(1, 3),
    })
  }

  function startBlast() {
    blasting = true
  }

  function stopBlast() {
    blasting = false
  }

  function applyForce(line, originX, originY, radius, maxForce) {
    const dx = line.x2 - line.x1
    const dy = line.y2 - line.y1
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    const near = nearestPointOnSegment(originX, originY, line.x1, line.y1, line.x2, line.y2)
    const dist = Math.hypot(originX - near.x, originY - near.y)
    if (dist >= radius) return 0
    const side = (originX - near.x) * nx + (originY - near.y) * ny
    return -Math.sign(side || 1) * (1 - dist / radius) * maxForce
  }

  function step() {
    if (!ctx) {
      raf = requestAnimationFrame(step)
      return
    }

    if (blasting && pointer.active) {
      spawnParticle(pointer.x, pointer.y)
      spawnParticle(pointer.x, pointer.y)
    }

    ctx.clearRect(0, 0, width, height)

    lines.forEach((line) => {
      const dx = line.x2 - line.x1
      const dy = line.y2 - line.y1
      const len = Math.hypot(dx, dy) || 1
      const nx = -dy / len
      const ny = dx / len
      const midX = (line.x1 + line.x2) / 2
      const midY = (line.y1 + line.y2) / 2

      let force = 0
      if (pointer.active) {
        force += applyForce(line, pointer.x, pointer.y, TOUCH_RADIUS, TOUCH_MAX_FORCE)
        if (blasting) force += applyForce(line, pointer.x, pointer.y, BLAST_RADIUS, BLAST_MAX_FORCE)
      }

      line.velocity += force - line.offset * SPRING_K
      line.velocity *= DAMPING
      line.offset += line.velocity

      const glow = Math.min(1, Math.abs(line.offset) / 40)
      ctx.beginPath()
      ctx.moveTo(line.x1, line.y1)
      ctx.quadraticCurveTo(midX + nx * line.offset, midY + ny * line.offset, line.x2, line.y2)
      ctx.strokeStyle = `rgba(${Math.round(148 + glow * 107)}, ${Math.round(197 + glow * 42)}, ${Math.round(212 + glow * 43)}, ${0.14 + glow * 0.45})`
      ctx.lineWidth = 1 + glow * 1.2
      ctx.stroke()
    })

    if (particles.length) {
      ctx.globalCompositeOperation = 'lighter'
      particles = particles.filter((p) => p.life > 0)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.97
        p.vy *= 0.97
        p.life -= p.decay
        ctx.beginPath()
        ctx.fillStyle = `rgba(34, 211, 238, ${Math.max(0, p.life)})`
        ctx.arc(p.x, p.y, p.size * Math.max(0.2, p.life), 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalCompositeOperation = 'source-over'
    }

    raf = requestAnimationFrame(step)
  }

  onMounted(() => {
    if (!canvasRef.value || !containerRef.value) return
    resize()
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(containerRef.value)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('blur', onWindowBlur)
    raf = requestAnimationFrame(step)
  })

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
    resizeObserver?.disconnect()
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('blur', onWindowBlur)
  })

  return { startBlast, stopBlast }
}
