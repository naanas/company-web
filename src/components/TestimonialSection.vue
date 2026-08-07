<script setup>
import { ref, useTemplateRef } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'

const sectionRef = useTemplateRef('section')
useScrollReveal(sectionRef)

// Placeholder testimonials — swap in real client quotes, names, and roles
// once available. Kept obviously generic so nothing here reads as a real
// endorsement until it's replaced.
const testimonials = [
  {
    quote:
      'Tim VELTECH sangat responsif dan memahami kebutuhan bisnis kami. Proses development berjalan transparan dari awal hingga akhir.',
    name: 'Nama Klien',
    role: 'Jabatan · Nama Perusahaan',
  },
  {
    quote:
      'Sistem yang dibangun langsung terasa dampaknya pada efisiensi operasional. Komunikasi dengan tim teknis juga sangat lancar.',
    name: 'Nama Klien',
    role: 'Jabatan · Nama Perusahaan',
  },
  {
    quote:
      'Pendekatan konsultasinya jelas dan tidak asal jual paket — solusi yang diberikan memang sesuai dengan skala bisnis kami.',
    name: 'Nama Klien',
    role: 'Jabatan · Nama Perusahaan',
  },
]

const active = ref(0)
</script>

<template>
  <section id="testimonials" ref="section" class="bg-paper-100 px-6 py-32 text-paper-ink">
    <div class="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[220px_1fr]">
      <ul data-reveal class="hidden flex-col gap-3 border-r border-black/10 pr-8 lg:flex">
        <li v-for="(t, i) in testimonials" :key="i">
          <button
            class="text-left text-sm transition-colors"
            :class="active === i ? 'font-medium text-paper-ink' : 'text-paper-muted hover:text-paper-ink/70'"
            @click="active = i"
          >
            Klien {{ i + 1 }}
          </button>
        </li>
      </ul>

      <div data-reveal class="flex flex-col gap-10">
        <p class="text-display text-paper-ink" style="font-size: clamp(1.5rem, 3vw, 2.25rem)">
          “{{ testimonials[active].quote }}”
        </p>

        <div class="flex items-center gap-4">
          <span class="flex h-12 w-12 items-center justify-center rounded-full bg-paper-ink/10 font-heading text-sm text-paper-ink/60">
            {{ testimonials[active].name.charAt(0) }}
          </span>
          <div>
            <p class="font-medium text-paper-ink">{{ testimonials[active].name }}</p>
            <p class="text-sm text-paper-muted">{{ testimonials[active].role }}</p>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="flex gap-2">
            <button
              v-for="(t, i) in testimonials"
              :key="i"
              class="h-9 w-9 rounded-full border border-black/10 text-sm transition hover:bg-black/5 lg:hidden"
              @click="active = i"
            >
              {{ i + 1 }}
            </button>
          </div>
          <a href="#contact" class="text-eyebrow border-b border-paper-ink/30 pb-1 text-paper-ink transition hover:border-paper-ink">
            Jadi Klien Kami →
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
