<script setup>
import { reactive, ref, useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const sectionRef = useTemplateRef('section')
useScrollReveal(sectionRef)

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
</script>

<template>
  <section id="contact" ref="section" class="mx-auto max-w-6xl px-6 py-32">
    <p data-reveal class="text-sm uppercase tracking-[0.3em] text-brand-accent">Kontak</p>
    <h2 data-reveal class="mt-4 max-w-2xl font-heading text-4xl font-semibold text-white">
      Siap Mendigitalkan Proses Bisnis Anda?
    </h2>
    <p data-reveal class="mt-6 max-w-xl text-slate-400">
      Hubungi tim VELTECH untuk konsultasi awal tanpa biaya. Kami akan merespons dalam
      1x24 jam kerja.
    </p>

    <form data-reveal class="mt-12 grid max-w-xl gap-4" @submit.prevent="handleSubmit">
      <input
        v-model="form.name"
        type="text"
        name="name"
        placeholder="Nama"
        required
        class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
      />
      <input
        v-model="form.company"
        type="text"
        name="company"
        placeholder="Perusahaan"
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
        placeholder="Nomor Telepon"
        class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
      />
      <textarea
        v-model="form.message"
        name="message"
        rows="4"
        placeholder="Ceritakan tentang proyek Anda"
        class="rounded-lg border border-white/15 bg-transparent px-4 py-3 text-white placeholder-white/40 outline-none transition-colors focus:border-brand-accent"
      />

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-fit rounded-full bg-brand-accent px-6 py-3 text-sm font-medium text-brand-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ isSubmitting ? 'Mengirim…' : 'Kirim Pesan' }}
      </button>

      <p v-if="submitted" class="text-sm text-brand-accent">
        Terima kasih! Pesan Anda telah terkirim, tim kami akan segera menghubungi Anda.
      </p>
    </form>

    <footer class="mt-24 border-t border-white/10 pt-8 text-sm text-white/40">
      © {{ new Date().getFullYear() }} PT Veltera Digital Technologies (VELTECH). All rights reserved.
    </footer>
  </section>
</template>
