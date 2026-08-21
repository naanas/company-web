const requestIdle =
  window.requestIdleCallback ?? ((cb) => setTimeout(() => cb({ timeRemaining: () => 0 }), 200))

// The hero's WebGPU init/first-render and its entrance tween don't run as
// one continuous block — they're interleaved with awaited network/GPU
// steps, which leaves small idle gaps *inside* that ~1.3s window. A plain
// requestIdleCallback happily fires into one of those gaps, so the
// "deferred" work ends up right back in the middle of the busy period it
// was meant to avoid. Pairing it with a floor delay means we only run once
// the browser is BOTH idle and past that window, whichever finishes last.
const MIN_DELAY_MS = 1200

/**
 * Defers `fn` until the browser is idle AND at least `MIN_DELAY_MS` has
 * passed. Every below-the-fold section's GSAP/ScrollTrigger/SplitText setup
 * used to run synchronously during Vue's initial mount pass — all of it
 * landing in the same window as the hero's own entrance animation and
 * WebGPU init, which is what made the hero stutter on load. None of that
 * setup needs to be ready before the user actually scrolls near it, so
 * pushing it past that window frees the main thread for the hero instead.
 */
export function whenIdle(fn) {
  let idleReady = false
  let timeReady = false
  let done = false

  function maybeRun() {
    if (done || !idleReady || !timeReady) return
    done = true
    fn()
  }

  requestIdle(() => {
    idleReady = true
    maybeRun()
  })
  setTimeout(() => {
    timeReady = true
    maybeRun()
  }, MIN_DELAY_MS)
}
