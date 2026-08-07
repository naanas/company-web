<script setup>
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import NeuralNetworkBackground from './NeuralNetworkBackground.vue'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = useTemplateRef('section')
let pinTrigger = null

// The hero is always visible on load, so its entrance plays as a plain
// on-mount timeline rather than a ScrollTrigger reveal — scroll-linked
// triggers here would be racing the initial layout (webfonts swapping in,
// the pinned services section inserting its spacer) for no visual benefit,
// since the section is already on screen either way.
onMounted(() => {
  if (!sectionRef.value) return
  const targets = sectionRef.value.querySelectorAll('[data-reveal]')
  gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 40 },
    { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
  )

  // `pinSpacing: false` is what makes this a reveal instead of a plain pin —
  // no spacer is added to preserve the hero's document-flow height, so once
  // it locks in place the sections behind it keep scrolling normally and
  // slide up over it like a curtain, exactly for the length of its own
  // height (`end: bottom top`) before releasing.
  pinTrigger = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top top',
    end: 'bottom top',
    pin: true,
    pinSpacing: false,
  })
})

onBeforeUnmount(() => {
  pinTrigger?.kill()
})
</script>

<template>
  <section
    id="hero"
    ref="section"
    class="relative flex min-h-screen items-center overflow-hidden bg-brand-950 pt-24"
  >
    <!-- Interactive neural-network backdrop, its nodes seeded into a "V" -->
    <NeuralNetworkBackground class="opacity-70" />
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-950" />

    <!-- Floating "key fact" card, top-right -->
    <div data-reveal class="absolute right-6 top-28 hidden max-w-[220px] flex-col gap-3 text-right sm:right-10 sm:top-32 md:flex">
      <div class="ml-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-brand-accent">
          ✦
        </span>
        <span class="text-left text-[0.7rem] uppercase leading-snug tracking-wider text-white/70">
          X+ Tahun<br />Membangun Arah Digital
        </span>
      </div>
      <p class="text-sm leading-relaxed text-white/50">
        Website, aplikasi, sistem, dan platform yang dibangun untuk kejelasan, skala, dan dampak.
      </p>
    </div>

    <div class="relative z-10 mx-auto w-full max-w-6xl px-6">
      <p data-reveal class="text-eyebrow text-brand-accent">PT Veltera Digital Technologies</p>

      <h1 data-reveal class="text-display-lg mt-4 max-w-3xl text-white">
        Teknologi yang<br />
        <span class="text-white/40">Berarti.</span>
      </h1>

      <p data-reveal class="mt-6 max-w-lg text-base text-slate-400 sm:text-lg">
        VELTECH adalah konsultan IT, digital agency, dan software house yang membangun
        website, aplikasi, dan sistem custom — dirancang untuk kejelasan, dibangun untuk skala.
      </p>

      <div data-reveal class="mt-10 flex flex-wrap items-center gap-6">
        <a
          href="#contact"
          class="rounded-full bg-brand-accent px-7 py-3.5 text-sm font-medium text-brand-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.45)]"
        >
          Mulai Proyek
        </a>
        <a
          href="#services"
          class="group flex items-center gap-2 border-b border-white/30 pb-1 text-sm font-medium text-white/80 transition-colors hover:border-white hover:text-white"
        >
          Lihat Layanan
          <span class="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>

    <!-- Bottom hint row -->
    <div class="absolute inset-x-0 bottom-8 flex items-center justify-between px-6 text-white/40 sm:px-10">
      <a href="#about" aria-label="Scroll ke bawah" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40 hover:text-white">
        ↓
      </a>
      <p class="hidden text-center text-xs uppercase tracking-[0.25em] sm:block">
        Gerakkan kursor ✦ jelajahi ↓
      </p>
      <span class="w-10" />
    </div>
  </section>
</template>
