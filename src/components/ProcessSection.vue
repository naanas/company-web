<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const sectionRef = useTemplateRef('section')

// Horizontal sequential reveal: each step slides in from the left, one
// after another, instead of the default fade-up used elsewhere.
useScrollReveal(sectionRef, { x: -60, y: 0, stagger: 0.15, start: 'top 75%' })

const steps = [
  {
    number: '01',
    title: 'Discovery',
    description: 'Memahami proses bisnis, pain points, dan tujuan digitalisasi Anda.',
  },
  {
    number: '02',
    title: 'Design',
    description: 'Merancang arsitektur solusi dan alur kerja sistem yang sesuai.',
  },
  {
    number: '03',
    title: 'Development',
    description: 'Membangun platform SaaS sesuai kebutuhan spesifik industri Anda.',
  },
  {
    number: '04',
    title: 'Deployment',
    description: 'Implementasi bertahap ke lingkungan produksi dengan minim disrupsi.',
  },
  {
    number: '05',
    title: 'Support',
    description: 'Pendampingan berkelanjutan dan pengembangan iteratif pasca-peluncuran.',
  },
]
</script>

<template>
  <section id="process" ref="section" class="bg-brand-900 px-6 py-32">
    <div class="mx-auto max-w-6xl">
      <p data-reveal class="text-sm uppercase tracking-[0.3em] text-brand-accent">Proses Kerja</p>
      <h2 data-reveal class="mt-4 max-w-2xl font-heading text-4xl font-semibold text-white">
        Bagaimana kami bekerja
      </h2>

      <div class="relative mt-20">
        <div class="absolute left-0 right-0 top-6 hidden h-px bg-white/10 lg:block" />

        <ol class="grid gap-10 lg:grid-cols-5 lg:gap-6">
          <li v-for="step in steps" :key="step.number" data-reveal class="relative">
            <div
              class="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-brand-accent/40 bg-brand-900 font-heading text-sm text-brand-accent"
            >
              {{ step.number }}
            </div>
            <h3 class="mt-5 font-heading text-lg font-medium text-white">{{ step.title }}</h3>
            <p class="mt-2 text-sm text-slate-400">{{ step.description }}</p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
