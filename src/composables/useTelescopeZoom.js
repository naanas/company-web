import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

/**
 * Pins `targetRef` for one viewport of scroll and drives a single
 * `--progress` (0→1, power1.inOut eased) custom property on it for the
 * duration. Every visual beat — ring scale, title split, marker flight —
 * is expressed in the component's own scoped CSS as `calc(var(--progress) * ...)`,
 * the same trick as github.com/joffreysp/telescope-zoom: one scrubbed
 * variable driving pure-CSS transforms, rather than GSAP tweening each
 * layer individually.
 *
 * This is deliberately plain DOM + CSS transforms, not a canvas — the hero's
 * own dark-cluster scene tried pinning + scrubbing a scaled WebGPU canvas
 * (see HeroSection.vue) and it stuttered badly, because compositing a
 * scaled canvas every scroll frame is expensive. Transform-only DOM layers
 * are cheap enough for the browser to composite on the GPU without
 * re-rasterizing, so the same pin+scrub approach is safe here.
 */
export function useTelescopeZoom(targetRef) {
  let trigger = null

  onMounted(() => {
    if (!targetRef.value) return
    const el = targetRef.value

    if (reduceMotionQuery.matches) {
      el.style.setProperty('--progress', 1)
      return
    }

    el.style.setProperty('--progress', 0)

    trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: '+=100%',
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const eased = gsap.parseEase('power1.inOut')(self.progress)
        el.style.setProperty('--progress', eased)
      },
    })
  })

  onBeforeUnmount(() => {
    trigger?.kill()
    trigger = null
  })
}
