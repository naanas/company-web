<script setup>
import { reactive, ref, useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { useStripeReveal } from '../composables/useStripeReveal'

const sectionRef = useTemplateRef('section')
const headingRef = useTemplateRef('heading')
useScrollReveal(sectionRef)
useBlurTextReveal(headingRef, { start: 'top 90%' })
useStripeReveal(sectionRef)

const form = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
})

const handedOff = ref(false)

// Placeholder business contact — replace with real details.
const contact = {
  email: 'hello@veltech.co.id',
  phone: '+62 857-4964-8941',
}

// There is no backend behind this form. It previously pretended otherwise:
// it logged the submission to the console, waited 600ms, then told the
// visitor "your message has been sent" — so every enquiry was silently lost
// while the sender believed it had arrived. On a page whose pricing tiers
// all funnel here with "Request a quote", that is the worst possible place
// to lose a lead.
//
// Until a real endpoint exists this hands the message to the visitor's own
// mail client instead, which actually delivers it and leaves them holding a
// copy in their sent folder. The wording below is careful never to claim
// more than that: nothing here can confirm delivery, only that the draft was
// opened.
//
// To move to a real backend later, replace the body of this function with
// the POST and switch the confirmation copy back to a delivery claim — at
// that point the claim will be true.
function handleSubmit() {
  // Optional fields drop out; the blank line separating the details block
  // from the message body is added after filtering, since an empty string
  // is falsy and would be dropped along with them.
  const details = [
    `Name: ${form.name}`,
    form.company && `Company: ${form.company}`,
    `Email: ${form.email}`,
    form.phone && `Phone: ${form.phone}`,
  ].filter(Boolean)

  const subject = `Project enquiry — ${form.name}${form.company ? ` (${form.company})` : ''}`
  const body = `${details.join('\n')}\n\n${form.message}`

  window.location.href =
    `mailto:${contact.email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`

  handedOff.value = true
}

// `href: null` renders nothing at all. The three entries below were pointing
// at "#", which does not open a profile — it scrolls the visitor back to the
// top of the page, which reads as the site breaking. Give each one a real
// URL to bring it back; the whole block hides while none have one.
const socials = [
  { label: 'LinkedIn', href: null },
  { label: 'Instagram', href: null },
  { label: 'Dribbble', href: null },
]

const visibleSocials = socials.filter((s) => s.href)
</script>

<template>
  <section id="contact" ref="section" class="relative overflow-hidden bg-brand-950 px-6 pb-10 pt-32">
    <div
      class="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-accent/10 blur-[120px]"
    />

    <div class="relative z-10 mx-auto max-w-6xl">
      <!-- Side by side only from `xl`. At `lg` the heading and the link had to
           share about 976px, which is not enough for both once the heading is
           at display size — they collided. Below that they stack, where no
           collision is possible. -->
      <div class="flex flex-col gap-10 border-b border-white/10 pb-16 xl:flex-row xl:items-end xl:justify-between">
        <h2 ref="heading" class="text-display-lg max-w-4xl text-white">
          Ready to Build<br />Something Meaningful?
        </h2>
        <div class="flex flex-col items-start gap-4 xl:items-end">
          <a
            data-reveal
            href="#contact-form"
            class="group flex items-center gap-2 border-b border-white/30 pb-1 text-sm font-medium uppercase tracking-widest text-white/80 transition-colors hover:border-white hover:text-white"
          >
            Start a Collaboration
            <span class="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <!-- The "Hold to Signal" button went with the trace field: holding
               it drove the pulse through those lines and did nothing else, so
               without them it was a control with no effect. -->
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
            class="w-fit rounded-full bg-brand-accent px-6 py-3 text-sm font-medium text-brand-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.45)]"
          >
            Compose Message
          </button>

          <!-- Says what actually happened — the draft was opened — and never
               that it was delivered, which this form has no way to know. -->
          <p v-if="handedOff" class="text-sm leading-relaxed text-brand-accent">
            Your email app should have opened with this message ready to send. If nothing
            happened, email us directly at
            <a :href="`mailto:${contact.email}`" class="underline underline-offset-4">{{ contact.email }}</a
            >.
          </p>
          <p v-else class="text-xs leading-relaxed text-white/40">
            This opens a draft in your own email app, so you keep a copy of what you sent.
          </p>
        </form>

        <div data-reveal class="flex flex-col gap-10 lg:items-end lg:text-right">
          <div>
            <p class="text-eyebrow text-white/40">Business Contact</p>
            <a :href="`mailto:${contact.email}`" class="mt-3 block text-lg text-white transition hover:text-brand-accent">
              {{ contact.email }}
            </a>
            <a :href="`tel:${contact.phone.replace(/\s|-/g, '')}`" class="mt-1 block text-lg text-white transition hover:text-brand-accent">
              {{ contact.phone }}
            </a>
          </div>

          <div v-if="visibleSocials.length">
            <p class="text-eyebrow text-white/40">Social</p>
            <div class="mt-3 flex flex-col gap-1 lg:items-end">
              <a
                v-for="social in visibleSocials"
                :key="social.label"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
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
