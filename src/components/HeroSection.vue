<script setup>
import { defineAsyncComponent, useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

// Lazy-loaded: Three.js/TresJS and its dependencies only load once this
// component mounts, keeping them out of the initial bundle.
const HeroScene = defineAsyncComponent({
  loader: () => import('./3d/HeroScene.vue'),
  delay: 0,
})

const sectionRef = useTemplateRef('section')
useScrollReveal(sectionRef, { start: 'top 95%', duration: 1.1 })
</script>

<template>
  <section
    id="hero"
    ref="section"
    class="relative flex min-h-screen items-center overflow-hidden bg-brand-950 pt-24"
  >
    <!-- Faint drifting line grid, standing in for the reference site's
         particle/line canvas without the cost of a full particle system -->
    <div
      class="pointer-events-none absolute inset-0 opacity-[0.15]"
      style="background-image: linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px); background-size: 64px 64px;"
    />
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-950" />

    <!-- Interactive 3D crystal, centered-right like the reference hero object -->
    <div class="pointer-events-auto absolute right-[5%] top-1/2 h-[380px] w-[380px] -translate-y-1/2 sm:h-[460px] sm:w-[460px] lg:h-[560px] lg:w-[560px]">
      <Suspense>
        <template #default>
          <HeroScene />
        </template>
        <template #fallback>
          <div class="flex h-full w-full items-center justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-accent" />
          </div>
        </template>
      </Suspense>
    </div>

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
        Tarik untuk memutar ✦ jelajahi ↓
      </p>
      <span class="w-10" />
    </div>
  </section>
</template>
