import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Fade + slide-up reveal for elements inside `targetRef` as they enter the viewport.
 * Pass a template ref (section/container element) and optionally a CSS selector
 * for the children to animate individually (defaults to direct `[data-reveal]` children).
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

/**
 * Simple vertical parallax: moves `targetRef` at a fraction of scroll speed.
 * `speed` < 1 moves slower than scroll (background feel), > 1 moves faster.
 */
export function useParallax(targetRef, { speed = 0.3, start = 'top bottom', end = 'bottom top' } = {}) {
  let scrollTriggerInstance = null

  onMounted(() => {
    if (!targetRef.value) return

    const tween = gsap.fromTo(
      targetRef.value,
      { y: 0 },
      {
        y: () => window.innerHeight * speed * -1,
        ease: 'none',
        scrollTrigger: {
          trigger: targetRef.value,
          start,
          end,
          scrub: true,
        },
      }
    )

    scrollTriggerInstance = tween.scrollTrigger
  })

  onBeforeUnmount(() => {
    scrollTriggerInstance?.kill()
  })
}
