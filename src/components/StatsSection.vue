<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { useCountUp } from '../composables/useCountUp'

const sectionRef = useTemplateRef('section')
const headingRef = useTemplateRef('heading')
useScrollReveal(sectionRef, { stagger: 0.12 })
useBlurTextReveal(headingRef)

// This section used to pin itself with `pinSpacing: false` so WorkSection
// would slide up over it like a curtain. It's a plain scrolling section
// now: holding the page still for a full viewport made the scroll feel
// jammed, and with `pinSpacing: false` the partner row at the bottom was
// getting covered before it had a chance to be read. The reveal and
// heading animations below still run on scroll — they just don't take the
// scroll position hostage to do it.

const foundedValueRef = useTemplateRef('foundedValue')
const projectsValueRef = useTemplateRef('projectsValue')
const teamValueRef = useTemplateRef('teamValue')

useCountUp(foundedValueRef, { value: 2026, duration: 1.8 })
useCountUp(projectsValueRef, { value: 2, duration: 1 })
useCountUp(teamValueRef, { value: 2, duration: 1 })

// Real figures as of Aug 2026 — small numbers on purpose, since VELTECH is
// a month-old venture. Each value counts up on scroll via useCountUp above;
// refName picks which ref the animated <p> below binds to.
const stats = [
  { label: 'Founded', value: '2026', refName: 'foundedValue', caption: 'Est. July 2026 — early, already delivering for Pertamina Lubricants.' },
  { label: 'Projects Completed', value: '2', refName: 'projectsValue', caption: 'Our first client, DSP Plumpang (Pertamina Lubricants), returned for a second project.' },
  { label: 'Team Members', value: '2', refName: 'teamValue', caption: 'Sales & full-stack development.' },
]

const clients = ['DSP Plumpang · Pertamina Lubricants']
</script>

<template>
  <section id="stats" ref="section" class="relative bg-paper-100 px-6 py-32 text-paper-ink">
    <div class="mx-auto max-w-6xl">
      <div class="text-center">
        <p data-reveal class="text-eyebrow text-paper-muted">Quick Facts</p>
        <h2 ref="heading" class="text-display mt-4 text-paper-ink">Quick Facts</h2>
        <p data-reveal class="mx-auto mt-4 max-w-md text-paper-muted">
          A brief look at our experience and impact so far.
        </p>
      </div>

      <div class="mt-16 grid gap-6 sm:grid-cols-3">
        <div
          v-for="stat in stats"
          :key="stat.label"
          data-reveal
          class="flex flex-col justify-between rounded-3xl border border-black/5 bg-white p-8 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]"
        >
          <p class="text-eyebrow text-paper-muted">{{ stat.label }}</p>
          <p :ref="stat.refName" class="text-display mt-8 text-paper-ink">0</p>
          <p v-if="stat.caption" class="mt-4 text-sm text-paper-muted">{{ stat.caption }}</p>
        </div>
      </div>

      <div data-reveal class="mt-20 border-t border-black/10 pt-10 text-center">
        <p class="text-eyebrow mb-8 text-paper-muted">Trusted By</p>
        <div class="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          <span
            v-for="client in clients"
            :key="client"
            class="font-heading text-lg font-semibold text-paper-ink/70 transition hover:text-paper-ink"
          >
            {{ client }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
