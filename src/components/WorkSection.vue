<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useHorizontalDragScroll } from '../composables/useHorizontalDragScroll'

const sectionRef = useTemplateRef('section')
const trackRef = useTemplateRef('track')

useScrollReveal(sectionRef, { selector: '[data-reveal-head]' })
useHorizontalDragScroll(trackRef)

// Illustrative examples of the kind of systems VELTECH builds — replace
// with real case studies (name, description, link, screenshot) once available.
const projects = [
  {
    tag: 'ERP',
    title: 'Sistem ERP Manufaktur',
    description: 'Platform ERP custom untuk efisiensi operasional dan visibilitas lini produksi pabrik.',
    gradient: 'from-cyan-500/20 via-brand-900 to-brand-950',
  },
  {
    tag: 'Mobile',
    title: 'Aplikasi Mobile Logistik',
    description: 'Aplikasi tracking pengiriman real-time untuk tim lapangan dan armada distribusi.',
    gradient: 'from-blue-500/20 via-brand-900 to-brand-950',
  },
  {
    tag: 'E-Commerce',
    title: 'Platform E-Commerce B2B',
    description: 'Marketplace B2B dengan integrasi pembayaran, inventori, dan manajemen vendor.',
    gradient: 'from-indigo-500/20 via-brand-900 to-brand-950',
  },
  {
    tag: 'AI & Data',
    title: 'Dashboard Analitik AI',
    description: 'Dashboard prediktif berbasis AI untuk pengambilan keputusan bisnis yang lebih cepat.',
    gradient: 'from-teal-500/20 via-brand-900 to-brand-950',
  },
]
</script>

<template>
  <section id="work" ref="section" class="bg-brand-950 py-32">
    <div class="mx-auto max-w-6xl px-6">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p data-reveal-head class="text-eyebrow text-brand-accent">Karya Kami</p>
          <h2 data-reveal-head class="text-display mt-4 max-w-lg text-white">
            Proyek yang Kami Bangun
          </h2>
          <p data-reveal-head class="mt-3 max-w-md text-sm text-slate-500">
            Contoh implementasi produk yang biasa kami kerjakan untuk klien di berbagai industri.
          </p>
        </div>
        <a data-reveal-head href="#contact" class="group flex items-center gap-2 border-b border-white/30 pb-1 text-sm font-medium text-white/80 transition-colors hover:border-white hover:text-white">
          Diskusikan Proyek Anda
          <span class="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>

    <div ref="track" class="mt-14 flex cursor-grab gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-[max(1.5rem,calc((100vw-72rem)/2))]">
      <article
        v-for="project in projects"
        :key="project.title"
        class="group w-[82vw] shrink-0 select-none sm:w-[420px]"
      >
        <div
          class="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br"
          :class="project.gradient"
        >
          <span class="text-display text-white/10">{{ project.tag }}</span>
          <span class="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs uppercase tracking-widest text-white/70">
            {{ project.tag }}
          </span>
        </div>
        <h3 class="mt-5 font-heading text-xl font-medium text-white">{{ project.title }}</h3>
        <p class="mt-2 max-w-sm text-sm text-slate-400">{{ project.description }}</p>
      </article>
    </div>
  </section>
</template>
