import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
  } = options

  let triggers = []

  onMounted(() => {
    if (!targetRef.value) return

    const root = targetRef.value
    const els = root.querySelectorAll(selector)
    const targets = els.length ? els : [root]

    if (reduceMotionQuery.matches) {
      gsap.set(targets, { autoAlpha: 1, x: 0, y: 0 })
      return
    }

    const anim = gsap.fromTo(
      targets,
      { autoAlpha: 0, x, y },
      {
        autoAlpha: 1,
        x: 0,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: root,
          start,
          toggleActions: 'play none none reverse',
        },
      }
    )

    if (anim.scrollTrigger) triggers.push(anim.scrollTrigger)
  })

  onBeforeUnmount(() => {
    triggers.forEach((t) => t.kill())
    triggers = []
  })
}
