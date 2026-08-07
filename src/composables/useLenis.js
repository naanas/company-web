import { onBeforeUnmount, onMounted } from 'vue'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
let refCount = 0

/**
 * Boots a single shared Lenis instance and hands its scroll tick to GSAP's
 * own ticker, so ScrollTrigger reads scroll position on the same frame
 * Lenis renders it (rather than the native `scroll` event, which lags a
 * frame behind and produces visible jitter on scrubbed animations).
 * `lagSmoothing(0)` stops gsap.ticker from compensating for tab-switch
 * frame drops — that compensation fights Lenis's own easing and causes
 * a visible jump right after the tab regains focus.
 */
export function useLenis() {
  onMounted(() => {
    refCount += 1
    if (lenis) return

    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    })

    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)
  })

  onBeforeUnmount(() => {
    refCount -= 1
    if (refCount <= 0 && lenis) {
      lenis.destroy()
      lenis = null
    }
  })
}

/** Scrolls to a target (selector, element, or Y offset) using the shared Lenis instance. */
export function lenisScrollTo(target, options = {}) {
  lenis?.scrollTo(target, options)
}
