<script setup>
import { reactive, ref, useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { useInteractiveLineField } from '../composables/useInteractiveLineField'

const sectionRef = useTemplateRef('section')
const headingRef = useTemplateRef('heading')
const lineFieldContainerRef = useTemplateRef('lineFieldContainer')
const lineFieldCanvasRef = useTemplateRef('lineFieldCanvas')
useScrollReveal(sectionRef)
useBlurTextReveal(headingRef, { start: 'top 90%' })

// Circuit-trace field behind the contact content — bends toward the cursor
// on its own, and streams a signal pulse for as long as "Hold to Signal" is
// held. A playful nod to "reaching out" that fits an IT/software brief.
const { startPulse, stopPulse } = useInteractiveLineField(lineFieldCanvasRef, lineFieldContainerRef)

const form = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
})

const isSubmitting = ref(false)
const submitted = ref(false)

// Placeholder handler — wire this up to your actual backend/email service
// (e.g. an API route, Formspree, or a serverless function) later.
async function handleSubmit() {
  isSubmitting.value = true
  console.log('Contact form submitted:', { ...form })

  await new Promise((resolve) => setTimeout(resolve, 600))

  isSubmitting.value = false
  submitted.value = true
  Object.assign(form, { name: '', company: '', email: '', phone: '', message: '' })
}

// Placeholder business contact — replace with real details.
const contact = {
  email: 'hello@veltech.co.id',
  phone: '+62 8XX-XXXX-XXXX',
}

const socials = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Dribbble', href: '#' },
]
</script>

<template>
  <section id="contact" ref="section" class="relative overflow-hidden bg-brand-950 px-6 pb-10 pt-32">
    <div
      class="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-accent/10 blur-[120px]"
    />

    <div ref="lineFieldContainer" class="pointer-events-none absolute inset-0 z-0">
      <canvas ref="lineFieldCanvas" class="h-full w-full" />
    </div>

    <div class="relative z-10 mx-auto max-w-6xl">
      <div class="flex flex-col gap-10 border-b border-white/10 pb-16 lg:flex-row lg:items-end lg:justify-between">
        <h2 ref="heading" class="text-display-lg max-w-2xl text-white">
          Ready to Build<br />Something Meaningful?
        </h2>
        <div class="flex flex-col items-start gap-4 lg:items-end">
          <a
            data-reveal
            href="#contact-form"
            class="group flex items-center gap-2 border-b border-white/30 pb-1 text-sm font-medium uppercase tracking-widest text-white/80 transition-colors hover:border-white hover:text-white"
          >
            Start a Collaboration
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <button
            type="button"
            class="group flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/30 transition hover:text-brand-accent"
            aria-label="Hold to send a signal through the trace field"
            @pointerdown="startPulse"
            @pointerup="stopPulse"
            @pointerleave="stopPulse"
            @pointercancel="stopPulse"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-brand-accent/60 transition group-hover:bg-brand-accent group-hover:shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
            Hold to Signal
          </button>
        </div>
      </div>

      <div class="grid gap-16 py-16 lg:grid-cols-[1fr_1fr]">
        <form id="contact-form" data-reveal class="grid max-w-xl gap-4" @submit.prevent="handleSubmit">
          <input
            v-model="form.name"
            type="text"
            name="name"
            placeholder="Name"
            required
            class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
          />
          <input
            v-model="form.company"
            type="text"
            name="company"
            placeholder="Company"
            class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
          />
          <input
            v-model="form.email"
            type="email"
            name="email"
            placeholder="Email"
            required
            class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
          />
          <input
            v-model="form.phone"
            type="tel"
            name="phone"
            placeholder="Phone Number"
            class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
          />
          <textarea
            v-model="form.message"
            name="message"
            rows="4"
            placeholder="Tell us about your project"
            class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
          />

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-fit rounded-full bg-brand-accent px-6 py-3 text-sm font-medium text-brand-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {{ isSubmitting ? 'Sending…' : 'Send Message' }}
          </button>

          <p v-if="submitted" class="text-sm text-brand-accent">
            Thank you! Your message has been sent, our team will be in touch shortly.
          </p>
        </form>

        <div data-reveal class="flex flex-col gap-10 lg:items-end lg:text-right">
          <div>
            <p class="text-eyebrow text-white/40">Business Contact</p>
            <a :href="`mailto:${contact.email}`" class="mt-3 block text-lg text-white transition hover:text-brand-accent">
              {{ contact.email }}
            </a>
            <a :href="`tel:${contact.phone.replace(/\\s|-/g, '')}`" class="mt-1 block text-lg text-white transition hover:text-brand-accent">
              {{ contact.phone }}
            </a>
          </div>

          <div>
            <p class="text-eyebrow text-white/40">Social</p>
            <div class="mt-3 flex flex-col gap-1 lg:items-end">
              <a
                v-for="social in socials"
                :key="social.label"
                :href="social.href"
                class="text-white/70 transition hover:text-white"
              >
                {{ social.label }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <footer class="flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ new Date().getFullYear() }} PT Veltera Digital Technologies (VELTECH). All rights reserved.</p>
        <p>IT Consulting · Digital Agency · Software House</p>
      </footer>
    </div>
  </section>
</template>
