import { onBeforeUnmount, onMounted } from 'vue'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

let lenis = null
let refCount = 0
let tickerFn = null
let programmaticDepth = 0
let programmaticTimer = null

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

    // Kept in a module-scoped handle so it can actually be removed again —
    // an anonymous callback here would stay on gsap.ticker forever, driving
    // (and holding a reference to) a Lenis instance that's already destroyed,
    // and would stack a second copy on every remount.
    tickerFn = (time) => {
      lenis?.raf(time * 1000)
    }
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)
  })

  onBeforeUnmount(() => {
    refCount -= 1
    if (refCount <= 0 && lenis) {
      if (tickerFn) gsap.ticker.remove(tickerFn)
      tickerFn = null
      clearTimeout(programmaticTimer)
      programmaticDepth = 0
      lenis.destroy()
      lenis = null
    }
  })
}

/** Scrolls to a target (selector, element, or Y offset) using the shared Lenis instance. */
export function lenisScrollTo(target, options = {}) {
  if (!lenis) return

  const { duration = 1.2, onComplete, ...rest } = options

  programmaticDepth += 1
  const release = () => {
    programmaticDepth = Math.max(0, programmaticDepth - 1)
  }

  // Belt and braces: Lenis skips `onComplete` when the user interrupts the
  // animation with their own wheel/touch input, which would otherwise leave
  // the flag stuck on and permanently suppress anything gated on it.
  clearTimeout(programmaticTimer)
  programmaticTimer = setTimeout(() => {
    programmaticDepth = 0
  }, duration * 1000 + 250)

  lenis.scrollTo(target, {
    ...rest,
    duration,
    onComplete: (instance) => {
      release()
      onComplete?.(instance)
    },
  })
}

/**
 * True while a `lenisScrollTo` animation is running. Lets scroll-direction
 * reactions (e.g. the navbar auto-hide) ignore movement the page caused
 * itself rather than treating it as the user scrolling away.
 */
export function isProgrammaticScroll() {
  return programmaticDepth > 0
}

/**
 * Suspends/resumes the shared Lenis instance — for modal-style overlays
 * (e.g. the Our Process zoom card) where the page underneath must stop
 * scrolling. Plain CSS `overflow: hidden` on body doesn't work here since
 * Lenis drives scroll via its own transform, not native scrolling.
 */
export function setScrollLocked(locked) {
  if (!lenis) return
  if (locked) lenis.stop()
  else lenis.start()
}
