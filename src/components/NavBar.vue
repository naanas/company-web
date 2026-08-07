<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const links = [
  { label: 'Tentang', href: '#about' },
  { label: 'Layanan', href: '#services' },
  { label: 'Karya', href: '#work' },
  { label: 'Proses', href: '#process' },
  { label: 'Kontak', href: '#contact' },
]
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
    <nav
      class="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-brand-950/60 px-4 py-2.5 backdrop-blur-md sm:px-6"
    >
      <a href="#hero" class="flex items-center gap-2 font-heading text-base font-semibold tracking-wide text-white">
        <span class="flex h-6 w-6 items-center justify-center rounded-full border border-brand-accent/50 text-[0.65rem] text-brand-accent">
          V
        </span>
        VELTECH<span class="text-brand-accent">®</span>
      </a>

      <ul class="hidden items-center gap-8 md:flex">
        <li v-for="link in links" :key="link.href">
          <a :href="link.href" class="text-sm text-white/70 transition hover:text-white">
            {{ link.label }}
          </a>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <a
          href="#contact"
          class="hidden rounded-full bg-white px-5 py-2 text-sm font-medium text-brand-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] sm:inline-block"
        >
          Mari Bicara
        </a>

        <button
          class="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white md:hidden"
          aria-label="Toggle menu"
          @click="isOpen = !isOpen"
        >
          <span class="text-lg leading-none">{{ isOpen ? '✕' : '☰' }}</span>
        </button>
      </div>
    </nav>

    <ul
      v-if="isOpen"
      class="mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl border border-white/10 bg-brand-950/90 px-6 py-4 backdrop-blur-md md:hidden"
    >
      <li v-for="link in links" :key="link.href">
        <a
          :href="link.href"
          class="block py-2 text-sm text-white/70 transition hover:text-white"
          @click="isOpen = false"
        >
          {{ link.label }}
        </a>
      </li>
    </ul>
  </header>
</template>
