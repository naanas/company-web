<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'

const sectionRef = useTemplateRef('section')
const headingRef = useTemplateRef('heading')

// Horizontal sequential reveal: each step slides in from the left, one
// after another, instead of the default fade-up used elsewhere.
useScrollReveal(sectionRef, { x: -60, y: 0, stagger: 0.15, start: 'top 75%' })
useBlurTextReveal(headingRef)

const steps = [
  {
    number: '01',
    title: 'Discovery',
    description: 'Understanding your business processes, pain points, and digitalization goals.',
  },
  {
    number: '02',
    title: 'Design',
    description: 'Designing the right solution architecture and system workflows.',
  },
  {
    number: '03',
    title: 'Development',
    description: "Building the platform to your business's specific needs.",
  },
  {
    number: '04',
    title: 'Deployment',
    description: 'Phased rollout to production with minimal disruption.',
  },
  {
    number: '05',
    title: 'Support',
    description: 'Ongoing support and iterative development after launch.',
  },
]
</script>

<template>
  <section id="process" ref="section" class="bg-brand-950 px-6 py-32">
    <div class="mx-auto max-w-6xl">
      <p data-reveal class="text-eyebrow text-brand-accent">Our Process</p>
      <h2 ref="heading" class="text-display mt-4 max-w-2xl text-white">
        How We Work
      </h2>

      <div class="relative mt-20">
        <div class="absolute left-0 right-0 top-6 hidden h-px bg-white/10 lg:block" />

        <ol class="grid gap-10 lg:grid-cols-5 lg:gap-6">
          <li v-for="step in steps" :key="step.number" data-reveal class="relative">
            <div
              class="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-brand-accent/40 bg-brand-950 font-heading text-sm text-brand-accent"
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
