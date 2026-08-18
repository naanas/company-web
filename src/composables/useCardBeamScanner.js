import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from 'gsap'

const CODE_CHARS =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/"\'`~?'

function randomCode(length) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += CODE_CHARS[(Math.random() * CODE_CHARS.length) | 0]
  }
  return out
}

// Roughly how many monospace glyphs (at the layer's own font-size) it takes
// to cover its full box, so `break-all` wrapping fills every row edge to
// edge instead of leaving blank space below/right of a too-short string.
function charsToFill(layer) {
  const fontSize = parseFloat(getComputedStyle(layer).fontSize) || 10
  const charW = fontSize * 0.62
  const lineH = fontSize * 1.25
  const cols = Math.ceil(layer.clientWidth / charW)
  const rows = Math.ceil(layer.clientHeight / lineH)
  return cols * rows
}

/**
 * Drives the "beam scan" reveal on the Our Work card stream: a scanner
 * beam stays fixed at the horizontal center of `trackRef`'s container while
 * cards drift through it (via useMarquee). Each card carries a matrix-style
 * code overlay (`[data-code-layer]`) that clips away left-to-right as it
 * crosses the beam, "materializing" the real card face underneath —
 * reimplemented with clip-path rather than a canvas particle sim (as in
 * codepen.io/blacklead-studio/pen/xbwaqxE) to fit this page's GSAP-based
 * animation stack.
 */
export function useCardBeamScanner(trackRef, scannerRef) {
  let ticker = null
  let glitchInterval = null

  onMounted(() => {
    if (!trackRef.value || !scannerRef.value) return

    const codeLayers = trackRef.value.querySelectorAll('[data-code-layer]')
    codeLayers.forEach((el) => {
      el.textContent = randomCode(charsToFill(el))
    })

    glitchInterval = setInterval(() => {
      codeLayers.forEach((el) => {
        if (el.dataset.scanned === 'true') return
        el.textContent = randomCode(charsToFill(el))
      })
    }, 150)

    ticker = () => {
      const scannerRect = scannerRef.value.getBoundingClientRect()
      const scannerX = scannerRect.left + scannerRect.width / 2

      codeLayers.forEach((layer) => {
        const rect = layer.getBoundingClientRect()
        // Clip edge = rect.left + fraction * rect.width, so tying fraction to
        // the card's own width keeps that edge locked exactly to scannerX —
        // the visible reveal boundary always matches the beam line itself.
        const fraction = Math.min(1, Math.max(0, (scannerX - rect.left) / rect.width))
        layer.style.clipPath = `inset(0 0 0 ${fraction * 100}%)`
        layer.dataset.scanned = fraction >= 1 ? 'true' : 'false'
      })
    }
    gsap.ticker.add(ticker)
  })

  onBeforeUnmount(() => {
    if (ticker) gsap.ticker.remove(ticker)
    if (glitchInterval) clearInterval(glitchInterval)
  })
}
