import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STRIPE_COUNT = 8

/**
 * Stripe-wipe section transition: the entering section's own background
 * color is held behind a row of horizontal stripes, which peel away
 * top-to-bottom in a staggered timeline (GPU-accelerated yPercent, not
 * scale) scrubbed to scroll as the section settles into place — reads as
 * a blind opening rather than a hard cut between a dark and light section.
 * Finishes well before `start`d content reveals (~top 80-85%) so it never
 * fights with a heading's own reveal animation.
 */
export function useStripeReveal(targetRef) {
  let wrap = null
  let stripes = null
  let trigger = null

  onMounted(() => {
    if (!targetRef.value) return
    const section = targetRef.value

    if (getComputedStyle(section).position === 'static') {
      section.style.position = 'relative'
    }

    const bg = getComputedStyle(section).backgroundColor

    wrap = document.createElement('div')
    wrap.setAttribute('aria-hidden', 'true')
    wrap.style.cssText = 'position:absolute;inset:0;z-index:20;pointer-events:none;overflow:hidden;'

    stripes = Array.from({ length: STRIPE_COUNT }, (_, i) => {
      const stripe = document.createElement('div')
      stripe.style.cssText = `position:absolute;left:0;right:0;top:${(i / STRIPE_COUNT) * 100}%;height:${100 / STRIPE_COUNT}%;background:${bg};will-change:transform;`
      wrap.appendChild(stripe)
      return stripe
    })

    section.prepend(wrap)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'top 85%',
        scrub: true,
      },
    })
    tl.fromTo(stripes, { yPercent: 0 }, { yPercent: -100, stagger: 0.05, ease: 'none' })

    trigger = tl.scrollTrigger
  })

  onBeforeUnmount(() => {
    trigger?.kill()
    stripes?.forEach((s) => s.remove())
    wrap?.remove()
    stripes = null
    wrap = null
  })
}
