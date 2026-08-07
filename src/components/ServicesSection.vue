<script setup>
import { useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const sectionRef = useTemplateRef('section')

// Stagger reveal: each card fades/slides in with a short delay after the
// previous one as the section enters the viewport.
useScrollReveal(sectionRef, { stagger: 0.15 })

const services = [
  {
    title: 'Digitalisasi Proses Operasional',
    description:
      'Mengubah pencatatan manual dan alur kerja informal menjadi sistem digital terpusat yang bisa dipantau real-time.',
  },
  {
    title: 'Sistem Monitoring & Reporting',
    description:
      'Dashboard operasional dengan visibilitas penuh atas proses produksi, distribusi, atau maintenance.',
  },
  {
    title: 'Integrasi Sistem Industrial',
    description:
      'Menghubungkan sistem legacy dengan platform digital baru tanpa overhaul total infrastruktur.',
  },
  {
    title: 'Custom SaaS Development',
    description:
      'Pengembangan platform SaaS yang disesuaikan dengan kebutuhan spesifik industri klien.',
  },
]
</script>

<template>
  <section id="services" ref="section" class="bg-brand-900 px-6 py-32">
    <div class="mx-auto max-w-6xl">
      <p data-reveal class="text-sm uppercase tracking-[0.3em] text-brand-accent">Layanan</p>
      <h2 data-reveal class="mt-4 max-w-2xl font-heading text-4xl font-semibold text-white">
        Apa yang kami kerjakan
      </h2>

      <div class="mt-16 grid gap-6 sm:grid-cols-2">
        <div
          v-for="service in services"
          :key="service.title"
          data-reveal
          class="rounded-2xl border border-white/10 bg-brand-950/40 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)]"
        >
          <h3 class="font-heading text-xl font-medium text-white">{{ service.title }}</h3>
          <p class="mt-3 text-slate-400">{{ service.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
