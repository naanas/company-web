import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins `triggerRef` and runs the exact two-tween GSAP timeline from
 * codepen.io/GreenSock/pen/YzbPYMx: `zoomRef` (their `.image-container img`)
 * scales to 2 and pushes forward in Z, while `bgRef` (their `.section.hero`
 * background) scales to 1.1 at the same time ("<").
 *
 * Branches via `gsap.matchMedia()` rather than one shared config: the full
 * scale:2/z:350 push and a 150%-viewport pin read as dramatic depth on
 * desktop, but on mobile that same long pin plus a hard perspective push is
 * mostly jank (weaker GPUs, address-bar resize jitter) for a cue smaller
 * screens don't read as clearly anyway.
 */
export function useScrollZoom(zoomRef, bgRef, triggerRef) {
  let matchMedia = null

  onMounted(() => {
    if (!zoomRef.value || !triggerRef.value) return

    matchMedia = gsap.matchMedia()
    matchMedia.add({ isMobile: '(max-width: 767px)' }, (context) => {
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
        scale: isMobile ? 1.35 : 2,
        z: isMobile ? 0 : 350,
        transformOrigin: 'center center',
        ease: 'power1.inOut',
      })

      if (bgRef.value) {
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
