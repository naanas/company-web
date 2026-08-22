<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { useStripeReveal } from '../composables/useStripeReveal'
import { services } from '../data/services'

const sectionRef = useTemplateRef('section')
const headingRef = useTemplateRef('heading')

useScrollReveal(sectionRef, { stagger: 0.1 })
useBlurTextReveal(headingRef)
useStripeReveal(sectionRef)
</script>

<template>
  <section id="services" ref="section" class="bg-brand-950 px-6 py-32">
    <div class="mx-auto max-w-6xl">
      <p data-reveal class="text-eyebrow text-brand-accent">Our Services</p>
      <h2 ref="heading" class="text-display mt-4 max-w-2xl text-white">
        What We Build
      </h2>

      <div class="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
        <RouterLink
          v-for="service in services"
          :key="service.slug"
          :to="{ name: 'service', params: { slug: service.slug } }"
          data-reveal
          class="group flex flex-col gap-4 bg-brand-950 p-8 transition-colors hover:bg-brand-900 sm:p-10"
        >
          <span class="text-2xl text-brand-accent">+</span>
          <h3 class="font-heading text-xl font-medium text-white">{{ service.title }}</h3>
          <p class="text-sm text-slate-400">{{ service.summary }}</p>
          <span
            class="mt-2 flex items-center gap-2 text-xs uppercase tracking-widest text-brand-accent opacity-0 transition-opacity group-hover:opacity-100"
          >
            Learn more
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
