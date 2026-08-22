<script setup>
/**
 * One service's pricing tiers. Shared by the /pricing page (rendered once
 * per service) and by each /services/:slug page (rendered for that service
 * alone), so the two can never drift into showing different numbers for the
 * same thing.
 */
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { PRICES_ARE_PLACEHOLDER, includedEverywhere } from '../data/pricing'

defineProps({
  tiers: { type: Array, required: true },
  // The shared "included with every engagement" list is worth stating once
  // per page, not once per service — /pricing turns it off for all but the
  // first table and prints it on its own further down.
  showIncluded: { type: Boolean, default: true },
})

const rootRef = useTemplateRef('root')
useScrollReveal(rootRef, { y: 28, stagger: 0.08 })
</script>

<template>
  <div ref="root">
    <!-- Visible for as long as data/pricing.js says the figures are stand-ins.
         Keeping this in the UI (rather than only in a code comment) is what
         stops placeholder numbers from quietly reading as real quotes. -->
    <p
      v-if="PRICES_ARE_PLACEHOLDER"
      data-reveal
      class="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-brand-accent/30 bg-brand-accent/5 px-5 py-4 text-sm text-brand-accent"
    >
      <span class="font-medium">Indicative only.</span>
      <span class="text-brand-accent/80">
        These figures are placeholders while we finalise published rates — ask us for a quote scoped to your project.
      </span>
    </p>

    <div class="grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 lg:grid-cols-3">
      <div
        v-for="tier in tiers"
        :key="tier.name"
        data-reveal
        class="flex flex-col gap-6 p-8 sm:p-10"
        :class="tier.featured ? 'bg-brand-900' : 'bg-brand-950'"
      >
        <div class="flex items-start justify-between gap-4">
          <h3 class="font-heading text-xl font-medium text-white">{{ tier.name }}</h3>
          <span
            v-if="tier.featured"
            class="shrink-0 rounded-full border border-brand-accent/40 px-3 py-1 text-[0.65rem] uppercase tracking-widest text-brand-accent"
          >
            Most chosen
          </span>
        </div>

        <div>
          <!-- `whitespace-nowrap` keeps the currency prefix on the same line
               as the figure — three tiers to a row leaves each card narrow
               enough that "Rp" was otherwise orphaned above its own number. -->
          <p class="font-heading whitespace-nowrap text-2xl font-semibold text-white sm:text-3xl">{{ tier.price }}</p>
          <p class="mt-1 text-xs uppercase tracking-widest text-white/40">{{ tier.unit }}</p>
        </div>

        <p class="text-sm leading-relaxed text-slate-400">{{ tier.blurb }}</p>

        <ul class="flex flex-col gap-3 border-t border-white/10 pt-6">
          <li v-for="item in tier.includes" :key="item" class="flex gap-3 text-sm text-slate-300">
            <span aria-hidden="true" class="text-brand-accent">+</span>
            <span>{{ item }}</span>
          </li>
        </ul>

        <a
          href="/#contact"
          class="group mt-auto flex items-center gap-2 border-b pb-1 text-sm font-medium transition-colors"
          :class="
            tier.featured
              ? 'border-brand-accent/60 text-brand-accent hover:border-brand-accent'
              : 'border-white/30 text-white/80 hover:border-white hover:text-white'
          "
        >
          Request a quote
          <span class="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>

    <div v-if="showIncluded" data-reveal class="mt-10 border-t border-white/10 pt-8">
      <p class="text-eyebrow text-white/40">Included With Every Engagement</p>
      <ul class="mt-5 grid gap-3 sm:grid-cols-2">
        <li v-for="item in includedEverywhere" :key="item" class="flex gap-3 text-sm text-slate-400">
          <span aria-hidden="true" class="text-brand-accent">+</span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
