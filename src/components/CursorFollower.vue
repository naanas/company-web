<script setup>
/**
 * Custom two-part cursor: a small dot that tracks the pointer exactly, and
 * a lagging ring that eases toward it. Skipped entirely on touch/coarse-
 * pointer devices, where there is no cursor to follow.
 */
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { gsap } from 'gsap'

// Read synchronously during setup (this app never renders on the server)
// rather than in onMounted — the dot/ring refs below only exist once
// `v-if="isActive"` renders true, and that render happens on the same
// pass as this initial value, not a tick later like a post-mount write would.
const isActive = ref(window.matchMedia('(pointer: fine)').matches)

const dotRef = useTemplateRef('dot')
const ringRef = useTemplateRef('ring')
let setDotX, setDotY, setRingX, setRingY

function onMove(e) {
  setDotX(e.clientX)
  setDotY(e.clientY)
  setRingX(e.clientX)
  setRingY(e.clientY)
}

onMounted(() => {
  if (!isActive.value) return

  setDotX = gsap.quickTo(dotRef.value, 'x', { duration: 0.15, ease: 'power3.out' })
  setDotY = gsap.quickTo(dotRef.value, 'y', { duration: 0.15, ease: 'power3.out' })
  setRingX = gsap.quickTo(ringRef.value, 'x', { duration: 0.45, ease: 'power3.out' })
  setRingY = gsap.quickTo(ringRef.value, 'y', { duration: 0.45, ease: 'power3.out' })

  window.addEventListener('pointermove', onMove)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onMove)
})
</script>

<template>
  <div v-if="isActive" class="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
    <div ref="dot" class="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-accent" />
    <div ref="ring" class="absolute left-0 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-accent/70 opacity-60" />
  </div>
</template>
