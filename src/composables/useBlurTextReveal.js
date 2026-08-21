import { onBeforeUnmount, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { whenIdle } from './useIdle'

gsap.registerPlugin(ScrollTrigger, SplitText)

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

/**
 * Splits `targetRef`'s text into words (or lines/chars) and reveals them
 * with a blur-to-focus + fade, scrubbed once on scroll-in. Centralizes the
 * split/animate/cleanup/reduced-motion/will-change dance so headings don't
 * each reimplement it — see AboutSection's word-by-word scrub for the
 * separate scroll-scrubbed variant this doesn't replace.
 */
export function useBlurTextReveal(targetRef, options = {}) {
  const { type = 'words', start = 'top 85%', duration = 1, stagger = 0.05, y = 24, blur = 12 } = options

  let split = null
  let anim = null
  let trigger = null
  let alive = true

  function build() {
    if (!alive || !targetRef.value) return

    split = new SplitText(targetRef.value, { type })
    const targets = split[type] ?? split.words

    if (reduceMotionQuery.matches) {
      gsap.set(targets, { autoAlpha: 1, y: 0, filter: 'none' })
      return
    }

    anim = gsap.fromTo(
      targets,
      { autoAlpha: 0, y, filter: `blur(${blur}px)` },
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: targetRef.value,
          start,
          toggleActions: 'play none none reverse',
        },
        onStart: () => gsap.set(targetRef.value, { willChange: 'filter, opacity, transform' }),
        onComplete: () => gsap.set(targetRef.value, { willChange: 'auto' }),
        onReverseComplete: () => gsap.set(targetRef.value, { willChange: 'auto' }),
      }
    )

    trigger = anim.scrollTrigger
  }

  function cleanup() {
    trigger?.kill()
    anim?.kill()
    split?.revert()
    trigger = null
    anim = null
    split = null
  }

  onMounted(() => {
    // Wait for webfonts so SplitText measures final line/word metrics
    // instead of the fallback font's layout, then defer the actual
    // split/animate work to idle time — this section is below the fold at
    // mount, so there's no rush, and doing it eagerly just means competing
    // with the hero's own entrance animation for the main thread.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => whenIdle(build))
    } else {
      whenIdle(build)
    }
  })

  onBeforeUnmount(() => {
    alive = false
    cleanup()
  })
}
