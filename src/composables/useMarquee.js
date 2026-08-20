import { onMounted, onBeforeUnmount } from 'vue'
import { gsap } from 'gsap'

/**
 * Infinite horizontal marquee. Expects `trackRef` to contain the marquee
 * content duplicated twice as siblings (see AboutSection.vue) — the tween
 * simply slides the whole track left by one copy's width, then snaps back
 * to 0, which reads as a seamless loop.
 *
 * The loop distance is one copy's width, so it has to be measured against
 * final layout: building on `onMounted` measured the fallback font, and the
 * webfont swap then left the travel distance short of a full copy — a
 * visible jump at the seam on every repeat. Hence the rebuild on
 * `fonts.ready` and on resize.
 */
export function useMarquee(trackRef, { speed = 40, direction = -1 } = {}) {
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  let tween = null
  let resizeObserver = null
  let onEnter = null
  let onLeave = null

  function build() {
    const track = trackRef.value
    if (!track) return

    // Preserve how far through the loop we already are, so a rebuild
    // (font swap, resize) resumes mid-scroll instead of snapping to the start.
    const wasAt = tween ? tween.progress() : 0
    tween?.kill()
    tween = null

    gsap.set(track, { x: 0 })
    const distance = track.scrollWidth / 2
    if (!distance) return

    tween = gsap.fromTo(
      track,
      { x: direction > 0 ? -distance : 0 },
      {
        x: direction > 0 ? 0 : -distance,
        duration: distance / speed,
        ease: 'none',
        repeat: -1,
      }
    )
    tween.progress(wasAt)

    if (reduceMotionQuery.matches) tween.pause()
  }

  onMounted(() => {
    if (!trackRef.value) return

    build()
    // Re-measure once the real fonts are in — see the note above.
    document.fonts?.ready.then(build)

    resizeObserver = new ResizeObserver(build)
    resizeObserver.observe(trackRef.value)

    onEnter = () => tween?.timeScale(0.25)
    onLeave = () => tween?.timeScale(1)
    trackRef.value.addEventListener('mouseenter', onEnter)
    trackRef.value.addEventListener('mouseleave', onLeave)
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    // gsap.context() used to wrap this, but it only ever reverted the tween —
    // these listeners were never its responsibility and leaked with the node.
    if (onEnter) trackRef.value?.removeEventListener('mouseenter', onEnter)
    if (onLeave) trackRef.value?.removeEventListener('mouseleave', onLeave)
    tween?.kill()
    tween = null
  })
}
