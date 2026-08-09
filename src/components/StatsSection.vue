<script setup>
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReveal } from '../composables/useScrollReveal'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = useTemplateRef('section')
useScrollReveal(sectionRef, { stagger: 0.12 })

let pinTrigger = null

// `pinSpacing: false` pins this section in place while WorkSection keeps
// scrolling normally and slides up over it like a curtain. Duration is
// pinned to a full viewport height rather than the section's own (variable)
// content height, so the transition reads consistently regardless of
// stat/partner count.
onMounted(() => {
  if (!sectionRef.value) return
  pinTrigger = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top top',
    end: '+=100%',
    pin: true,
    pinSpacing: false,
  })
})

onBeforeUnmount(() => {
  pinTrigger?.kill()
})

// Placeholder figures — swap for real numbers, then wire each value up to
// `useCountUp(elRef, { value })` for the same animated count-up trionn uses.
const stats = [
  { label: 'Tahun Pengalaman', value: 'XX+' },
  { label: 'Proyek Selesai', value: 'XX+', caption: 'XX% klien kami memesan layanan untuk proyek kedua.' },
  { label: 'Anggota Tim', value: 'XX+' },
]

const partners = ['Mitra Satu', 'Mitra Dua', 'Mitra Tiga', 'Mitra Empat', 'Mitra Lima']
</script>

<template>
  <section id="stats" ref="section" class="relative bg-paper-100 px-6 py-32 text-paper-ink">
    <div class="mx-auto max-w-6xl">
      <div class="text-center">
        <p data-reveal class="text-eyebrow text-paper-muted">Fakta Singkat</p>
        <h2 data-reveal class="text-display mt-4 text-paper-ink">Fakta Singkat</h2>
        <p data-reveal class="mx-auto mt-4 max-w-md text-paper-muted">
          Gambaran singkat pengalaman dan dampak kami sejauh ini.
        </p>
      </div>

      <div class="mt-16 grid gap-6 sm:grid-cols-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          data-reveal
          class="flex flex-col justify-between rounded-3xl border border-black/5 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]"
        >
          <p class="text-eyebrow text-paper-muted">{{ stat.label }}</p>
          <p class="text-display mt-8 text-paper-ink">{{ stat.value }}</p>
          <p v-if="stat.caption" class="mt-4 text-sm text-paper-muted">{{ stat.caption }}</p>
        </div>
      </div>

      <div data-reveal class="mt-20 border-t border-black/10 pt-10 text-center">
        <p class="text-eyebrow mb-8 text-paper-muted">Mitra Bisnis Kami</p>
        <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          <span
            v-for="partner in partners"
            :key="partner"
            class="font-heading text-lg font-semibold text-paper-ink/40 grayscale transition hover:text-paper-ink/70"
          >
            {{ partner }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
