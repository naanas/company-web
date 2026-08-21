<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useMarquee } from '../composables/useMarquee'
import { useCardBeamScanner } from '../composables/useCardBeamScanner'
import { usePreloadImages } from '../composables/usePreloadImages'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { useStripeReveal } from '../composables/useStripeReveal'
import erpThumb from '../assets/images/projects/erp.svg'
import mobileThumb from '../assets/images/projects/mobile.svg'
import ecommerceThumb from '../assets/images/projects/ecommerce.svg'
import aiDataThumb from '../assets/images/projects/ai-data.svg'

const sectionRef = useTemplateRef('section')
const trackRef = useTemplateRef('track')
const scannerRef = useTemplateRef('scanner')
const headingRef = useTemplateRef('heading')

useScrollReveal(sectionRef, { selector: '[data-reveal-head]' })
useBlurTextReveal(headingRef)
useMarquee(trackRef, { speed: 70 })
useCardBeamScanner(trackRef, scannerRef)
useStripeReveal(sectionRef)

// Illustrative examples of the kind of systems VELTECH builds — replace
// `image` with real project screenshots once available.
const projects = [
  {
    tag: 'ERP',
    title: 'Manufacturing ERP System',
    description: 'A custom ERP platform for operational efficiency and factory production-line visibility.',
    image: erpThumb,
  },
  {
    tag: 'Mobile',
    title: 'Logistics Mobile App',
    description: 'A real-time shipment tracking app for field teams and distribution fleets.',
    image: mobileThumb,
  },
  {
    tag: 'E-Commerce',
    title: 'B2B E-Commerce Platform',
    description: 'A B2B marketplace with payment integration, inventory, and vendor management.',
    image: ecommerceThumb,
  },
  {
    tag: 'AI & Data',
    title: 'AI Analytics Dashboard',
    description: 'An AI-powered predictive dashboard for faster business decision-making.',
    image: aiDataThumb,
  },
]

usePreloadImages(projects.map((p) => p.image))
</script>

<template>
  <section id="work" ref="section" class="relative overflow-hidden bg-brand-950 py-32">
    <div class="mx-auto max-w-6xl px-6">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p data-reveal-head class="text-eyebrow text-brand-accent">Our Work</p>
          <h2 ref="heading" class="text-display mt-4 max-w-lg text-white">
            Projects We've Built
          </h2>
          <p data-reveal-head class="mt-3 max-w-md text-sm text-slate-500">
            Examples of the kind of product implementations we build for clients across industries.
          </p>
        </div>
        <a data-reveal-head href="#contact" class="group flex items-center gap-2 border-b border-white/30 pb-1 text-sm font-medium text-white/80 transition-colors hover:border-white hover:text-white">
          Discuss Your Project
          <span class="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>

    <!-- Card stream: cards drift continuously through a fixed scanner beam,
         "materializing" out of a code overlay as they cross it. -->
    <div class="relative mt-14 overflow-hidden">
      <div
        ref="scanner"
        class="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-brand-accent/80 shadow-[0_0_40px_10px_rgba(34,211,238,0.5)]"
      />

      <div ref="track" class="flex w-max items-stretch gap-6 px-6 will-change-transform sm:px-[max(1.5rem,calc((100vw-72rem)/2))]">
        <template v-for="copy in 2" :key="copy">
          <article
            v-for="project in projects"
            :key="`${copy}-${project.title}`"
            class="group w-[82vw] shrink-0 select-none sm:w-[380px]"
          >
            <div class="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-brand-900">
              <img :src="project.image" :alt="project.title" class="h-full w-full object-cover" />
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <span class="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-xs uppercase tracking-widest text-white/70">
                {{ project.tag }}
              </span>

              <!-- matrix-style code overlay, cleared by useCardBeamScanner as the card crosses the beam -->
              <pre
                data-code-layer
                data-scanned="false"
                class="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-all bg-black p-3 font-mono text-[10px] leading-tight text-brand-accent/80"
              ></pre>
            </div>

            <h3 class="mt-5 font-heading text-xl font-medium text-white">{{ project.title }}</h3>
            <p class="mt-2 max-w-sm text-sm text-slate-400">{{ project.description }}</p>
          </article>
        </template>
      </div>
    </div>
  </section>
</template>
