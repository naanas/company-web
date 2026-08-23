<script setup>
import { computed, useTemplateRef } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import TelescopeHero from '../components/TelescopeHero.vue'
import ContactSection from '../components/ContactSection.vue'
import PricingTable from '../components/PricingTable.vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { services, getServiceBySlug } from '../data/services'
import { getPricingForService } from '../data/pricing'

const route = useRoute()
const router = useRouter()

const service = computed(() => getServiceBySlug(route.params.slug))

// An unknown slug (bad link, typo) sends the visitor home rather than
// showing an empty page — there's nothing useful to render without a
// matching service.
if (!service.value) {
  router.replace({ name: 'home' })
}

const otherServices = computed(() => services.filter((s) => s.slug !== route.params.slug))

// Tiers for this service only — the full cross-service comparison lives on
// /pricing, which this section links out to.
const tiers = computed(() => getPricingForService(route.params.slug))

const overviewRef = useTemplateRef('overview')
const headingRef = useTemplateRef('heading')

// One reveal for this whole section. There used to be a second one scoped to
// the pricing block, but that block sits inside this section — so its
// contents were being animated twice over, and PricingTable's own reveal
// made three. The pricing heading and link carry plain `data-reveal` and are
// covered here; the tier cards are PricingTable's own business.
useScrollReveal(overviewRef, { y: 28, stagger: 0.08 })
useBlurTextReveal(headingRef)
</script>

<template>
  <main v-if="service">
    <TelescopeHero :key="service.slug" :service="service" />

    <section ref="overview" class="bg-brand-950 px-6 py-32">
      <div class="mx-auto max-w-6xl">
        <p data-reveal class="text-eyebrow text-brand-accent">What's Included</p>
        <h2 ref="heading" class="text-display mt-4 max-w-2xl text-white">
          {{ service.title }}
        </h2>
        <p data-reveal class="mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
          {{ service.overview }}
        </p>

        <div class="mt-20 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2">
          <div
            v-for="item in service.highlights"
            :key="item.label"
            data-reveal
            class="flex flex-col gap-4 bg-brand-950 p-8 sm:p-10"
          >
            <span class="text-2xl text-brand-accent">+</span>
            <h3 class="font-heading text-xl font-medium text-white">{{ item.label }}</h3>
            <p class="text-sm text-slate-400">{{ item.detail }}</p>
          </div>
        </div>

        <!-- Pricing for this service, sitting between what's included and
             the CTA: a visitor who has just read the scope is exactly the
             one asking what it costs. Renders nothing at all for a service
             with no tiers defined yet, rather than an empty table. -->
        <div v-if="tiers.length" class="mt-24 border-t border-white/10 pt-16">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p data-reveal class="text-eyebrow text-brand-accent">Pricing</p>
              <h2 data-reveal class="font-heading mt-4 max-w-xl text-2xl font-medium text-white sm:text-3xl">
                What {{ service.title }} costs
              </h2>
            </div>
            <RouterLink
              data-reveal
              :to="{ name: 'pricing', hash: `#pricing-${service.slug}` }"
              class="group flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              Compare all services
              <span class="transition-transform group-hover:translate-x-1">→</span>
            </RouterLink>
          </div>

          <div class="mt-10">
            <PricingTable :tiers="tiers" />
          </div>
        </div>

        <div data-reveal class="mt-16 flex flex-wrap items-center gap-4 border-t border-white/10 pt-10">
          <a
            href="/#contact"
            class="group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-brand-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)]"
          >
            Start a Project
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <RouterLink
            :to="{ name: 'home' }"
            class="text-sm text-white/60 transition-colors hover:text-white"
          >
            ← Back to all services
          </RouterLink>
        </div>

        <div data-reveal class="mt-24">
          <p class="text-eyebrow text-white/40">Other Services</p>
          <ul class="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            <li v-for="other in otherServices" :key="other.slug">
              <RouterLink
                :to="{ name: 'service', params: { slug: other.slug } }"
                class="group flex h-full flex-col justify-between gap-6 bg-brand-950 p-6 transition-colors hover:bg-brand-900"
              >
                <span class="font-heading text-base font-medium text-white">{{ other.title }}</span>
                <span class="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-accent">
                  View
                  <span class="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <ContactSection />
  </main>
</template>
