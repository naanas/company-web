import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { whenIdle } from './useIdle'

gsap.registerPlugin(ScrollTrigger)

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

/**
 * Fade + slide-up reveal for elements inside `targetRef` as they enter the viewport.
 * Pass a template ref (section/container element) and optionally a CSS selector
 * for the children to animate individually (defaults to direct `[data-reveal]` children).
 *
 * Under `prefers-reduced-motion` the targets are set straight to their final
 * state. That is not just politeness: every `[data-reveal]` element starts at
 * `autoAlpha: 0`, so skipping the animation without this would leave most of
 * the page's copy permanently invisible.
 */
export function useScrollReveal(targetRef, options = {}) {
  const {
    selector = '[data-reveal]',
    x = 0,
    y = 40,
    duration = 0.9,
    stagger = 0.12,
    start = 'top 80%',
    // Reveal once and stay put. The default replays in reverse when the
    // section leaves upward, which reads as content flickering back out on
    // a long page the visitor is scanning up and down.
    once = false,
  } = options

  let triggers = []
  let alive = true

  onMounted(() => {
    if (!targetRef.value) return

    const root = targetRef.value
    const els = root.querySelectorAll(selector)
    const targets = els.length ? els : [root]

    if (reduceMotionQuery.matches) {
      gsap.set(targets, { autoAlpha: 1, x: 0, y: 0 })
      return
    }

    // Hide synchronously, here in the mount pass — NOT inside whenIdle below.
    //
    // The whole reveal used to be deferred, but the hidden "from" state only
    // landed when the tween was finally built, ~1.2s later. Until then the
    // content sat on screen fully rendered, and the deferred setup then
    // snapped it to invisible and faded it back in. Measured on /pricing:
    // opacity 1 at 64ms, 0.16 at 1289ms, back to 1 at 1924ms — a second of
    // readable content, yanked away and replayed.
    //
    // A gsap.set is cheap and synchronous, so paying for it at mount costs
    // nothing the hero would notice, while the expensive part (building
    // ScrollTriggers) still waits for idle.
    gsap.set(targets, { autoAlpha: 0, x, y })

    const motion = { autoAlpha: 1, x: 0, y: 0, duration, stagger, ease: 'power3.out' }

    // Anything already on screen at mount plays straight away, with no
    // ScrollTrigger at all — it is past its own start point and can never
    // scroll into view again, so a trigger would only be a wrapper around
    // "run now". Waiting for idle here meant a page whose first screen is
    // all reveals (/pricing has no 3D hero to wait on) sat blank for the
    // full 1.2s floor before anything faded in — trading the old flash for
    // dead air. Off-screen sections still defer; nobody is looking at them.
    const rect = root.getBoundingClientRect()
    const startsVisible = rect.top < window.innerHeight * 0.85 && rect.bottom > 0

    if (startsVisible) {
      gsap.to(targets, { ...motion, delay: 0.15 })
      return
    }

    whenIdle(() => {
      if (!alive || !targetRef.value) return

      const anim = gsap.to(targets, {
        ...motion,
        scrollTrigger: {
          trigger: root,
          start,
          toggleActions: once ? 'play none none none' : 'play none none reverse',
          once,
        },
      })

      if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
    })
  })

  onBeforeUnmount(() => {
    alive = false
    triggers.forEach((t) => t.kill())
    triggers = []
  })
}
