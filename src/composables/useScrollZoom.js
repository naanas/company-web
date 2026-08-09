import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins `triggerRef` and runs the exact two-tween GSAP timeline from
 * codepen.io/GreenSock/pen/YzbPYMx: `zoomRef` (their `.image-container img`)
 * scales to 2 and pushes forward in Z, while `bgRef` (their `.section.hero`
 * background) scales to 1.1 at the same time ("<").
 */
export function useScrollZoom(zoomRef, bgRef, triggerRef) {
  let trigger = null

  onMounted(() => {
    if (!zoomRef.value || !triggerRef.value) return

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.value,
        start: 'top top',
        end: '+=150%',
        pin: true,
        scrub: true,
      },
    })

    timeline.to(zoomRef.value, {
      scale: 2,
      z: 350,
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

    trigger = timeline.scrollTrigger
  })

  onBeforeUnmount(() => {
    trigger?.kill()
  })
}
