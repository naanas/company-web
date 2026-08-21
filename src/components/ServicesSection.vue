<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { useStripeReveal } from '../composables/useStripeReveal'

const sectionRef = useTemplateRef('section')
const headingRef = useTemplateRef('heading')

useScrollReveal(sectionRef, { stagger: 0.1 })
useBlurTextReveal(headingRef)
useStripeReveal(sectionRef)

const services = [
  {
    title: 'IT Consulting',
    description: 'Advising on the systems and architecture behind your operations, before any code gets written.',
  },
  {
    title: 'Custom Systems & ERP',
    description: 'Manufacturing, logistics, and business-process systems built around how your team actually works.',
  },
  {
    title: 'Web & Mobile Development',
    description: 'Websites and applications built for clarity, then engineered to hold up under real traffic.',
  },
  {
    title: 'AI & Data',
    description: 'Dashboards and predictive tools that turn operational data into decisions.',
  },
]
</script>

<template>
  <section id="services" ref="section" class="bg-brand-950 px-6 py-32">
    <div class="mx-auto max-w-6xl">
      <p data-reveal class="text-eyebrow text-brand-accent">Our Services</p>
      <h2 ref="heading" class="text-display mt-4 max-w-2xl text-white">
        What We Build
      </h2>

      <div class="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
        <div
          v-for="service in services"
          :key="service.title"
          data-reveal
          class="flex flex-col gap-4 bg-brand-950 p-8 sm:p-10"
        >
          <span class="text-2xl text-brand-accent">+</span>
          <h3 class="font-heading text-xl font-medium text-white">{{ service.title }}</h3>
          <p class="text-sm text-slate-400">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
