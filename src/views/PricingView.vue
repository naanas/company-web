<script setup>
import { useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'
import PricingTable from '../components/PricingTable.vue'
import ContactSection from '../components/ContactSection.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { services } from '../data/services'
import { getPricingForService, includedEverywhere, pricingFactors } from '../data/pricing'

const headerRef = useTemplateRef('header')
const headingRef = useTemplateRef('heading')
const factorsRef = useTemplateRef('factors')
const includedRef = useTemplateRef('included')

useScrollReveal(headerRef, { y: 28, stagger: 0.08 })
useScrollReveal(factorsRef, { y: 28, stagger: 0.08 })
useScrollReveal(includedRef, { y: 28, stagger: 0.08 })
useBlurTextReveal(headingRef)

// Only list services that actually have tiers defined, so adding a fifth
// service to services.js doesn't render an empty pricing block here before
// its numbers exist.
const priced = services
  .map((service) => ({ service, tiers: getPricingForService(service.slug) }))
  .filter((entry) => entry.tiers.length > 0)
</script>

<template>
  <main>
    <!-- Plain header rather than TelescopeHero: that hero is keyed to a
         single service's identity, and this page spans all four. -->
    <section ref="header" class="bg-brand-950 px-6 pb-16 pt-40 sm:pt-48">
      <div class="mx-auto max-w-6xl">
        <p data-reveal class="text-eyebrow text-brand-accent">Pricing</p>
        <h1 ref="heading" class="text-display mt-4 max-w-3xl text-white">
          What It Costs to Work With Us
        </h1>
        <p data-reveal class="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
          Every engagement is scoped and quoted in writing before work starts. The tiers below
          are the shapes we most often work in — use them to place your project, then talk to us
          for a figure that matches your actual scope.
        </p>
      </div>
    </section>

    <!-- One table per service, each anchored so the pricing block on a
         service page can deep-link straight to its own section. -->
    <section
      v-for="({ service, tiers }, index) in priced"
      :key="service.slug"
      :id="`pricing-${service.slug}`"
      class="scroll-mt-28 bg-brand-950 px-6 pb-24"
      :class="index === 0 ? 'pt-8' : 'pt-16'"
    >
      <div class="mx-auto max-w-6xl">
        <div class="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-10">
          <div>
            <h2 class="font-heading text-2xl font-medium text-white sm:text-3xl">{{ service.title }}</h2>
            <p class="mt-2 max-w-xl text-sm text-slate-400">{{ service.summary }}</p>
          </div>
          <RouterLink
            :to="{ name: 'service', params: { slug: service.slug } }"
            class="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            What's included
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </RouterLink>
        </div>

        <div class="mt-10">
          <!-- The shared "included with every engagement" list is printed once
               for the whole page, further down — not under all four tables. -->
          <PricingTable :tiers="tiers" :show-included="false" />
        </div>
      </div>
    </section>

    <section ref="included" class="bg-brand-950 px-6 pb-24">
      <div class="mx-auto max-w-6xl border-t border-white/10 pt-16">
        <p data-reveal class="text-eyebrow text-brand-accent">Included With Every Engagement</p>
        <ul class="mt-8 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
          <li
            v-for="item in includedEverywhere"
            :key="item"
            data-reveal
            class="flex gap-4 bg-brand-950 p-8"
          >
            <span aria-hidden="true" class="text-2xl leading-none text-brand-accent">+</span>
            <span class="text-sm leading-relaxed text-slate-300">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <section ref="factors" class="bg-brand-950 px-6 pb-32">
      <div class="mx-auto max-w-6xl border-t border-white/10 pt-16">
        <p data-reveal class="text-eyebrow text-brand-accent">What Moves the Number</p>
        <h2 data-reveal class="font-heading mt-4 max-w-2xl text-2xl font-medium text-white sm:text-3xl">
          Why two projects in the same tier can be quoted differently
        </h2>

        <dl class="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
          <div v-for="factor in pricingFactors" :key="factor.label" data-reveal class="flex flex-col gap-3 bg-brand-950 p-8 sm:p-10">
            <dt class="font-heading text-lg font-medium text-white">{{ factor.label }}</dt>
            <dd class="text-sm leading-relaxed text-slate-400">{{ factor.detail }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <ContactSection />
  </main>
</template>
