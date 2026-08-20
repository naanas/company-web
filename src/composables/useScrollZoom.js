import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins `triggerRef` and scales `zoomRef` up while scrolling through it — a
 * slow scroll-driven zoom (optionally paired with a second `bgRef` layer
 * scaling at a different rate for a parallax feel, if one is passed).
 *
 * Branches via `gsap.matchMedia()` rather than one shared config: a full
 * 150%-viewport pin with a strong zoom reads as dramatic depth on desktop,
 * but on mobile that same long pin is mostly jank (weaker GPUs, address-bar
 * resize jitter) for a cue smaller screens don't read as clearly anyway.
 *
 * Both breakpoints are declared even though only `isMobile` is read: GSAP
 * only invokes the callback when at least one query in the object matches
 * (see `anyMatch` in gsap-core's `_onMediaChange`). With `isMobile` alone,
 * every viewport ≥768px matched nothing, so the callback never ran and
 * desktop silently got no pin and no zoom at all.
 */
export function useScrollZoom(zoomRef, bgRef, triggerRef) {
  let matchMedia = null

  onMounted(() => {
    if (!zoomRef.value || !triggerRef.value) return

    matchMedia = gsap.matchMedia()
    matchMedia.add({ isMobile: '(max-width: 767px)', isDesktop: '(min-width: 768px)' }, (context) => {
      const { isMobile } = context.conditions

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.value,
          start: 'top top',
          end: isMobile ? '+=70%' : '+=150%',
          pin: true,
          scrub: true,
        },
      })

      timeline.to(zoomRef.value, {
        scale: isMobile ? 1.08 : 1.18,
        transformOrigin: 'center center',
        ease: 'power1.inOut',
      })

      if (bgRef?.value) {
        timeline.to(
          bgRef.value,
          {
            scale: 1.1,
            transformOrigin: 'center center',
            ease: 'power1.inOut',
          },
          '<'
        )
      }
    })
  })

  onBeforeUnmount(() => {
    matchMedia?.revert()
  })
}
