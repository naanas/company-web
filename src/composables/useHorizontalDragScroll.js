import { onMounted, onBeforeUnmount } from 'vue'

/**
 * Lets a horizontally-scrollable track (overflow-x: auto, flex row) be
 * navigated with the vertical mouse wheel and by click-dragging — the two
 * interaction patterns people actually use on a "scroll sideways" showcase,
 * since a plain overflow-x container only respects a horizontal trackpad
 * swipe or the scrollbar itself.
 */
export function useHorizontalDragScroll(trackRef) {
  let isDown = false
  let startX = 0
  let startScroll = 0

  function onWheel(e) {
    if (!trackRef.value) return
    // Only hijack when the scroll is more vertical than horizontal, i.e. a
    // normal mouse wheel — leave native horizontal trackpad gestures alone.
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
    if (trackRef.value.scrollWidth <= trackRef.value.clientWidth) return
    e.preventDefault()
    trackRef.value.scrollLeft += e.deltaY
  }

  function onPointerDown(e) {
    if (!trackRef.value) return
    isDown = true
    trackRef.value.classList.add('cursor-grabbing')
    startX = e.clientX
    startScroll = trackRef.value.scrollLeft
  }

  function onPointerMove(e) {
    if (!isDown || !trackRef.value) return
    trackRef.value.scrollLeft = startScroll - (e.clientX - startX)
  }

  function onPointerUp() {
    isDown = false
    trackRef.value?.classList.remove('cursor-grabbing')
  }

  onMounted(() => {
    const el = trackRef.value
    if (!el) return

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  })

  onBeforeUnmount(() => {
    const el = trackRef.value
    el?.removeEventListener('wheel', onWheel)
    el?.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
  })
}
