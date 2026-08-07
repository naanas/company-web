<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const isOpen = ref(false)
const activeHref = ref('#hero')
const headerRef = useTemplateRef('header')

const links = [
  { label: 'Tentang', href: '#about' },
  { label: 'Layanan', href: '#services' },
  { label: 'Karya', href: '#work' },
  { label: 'Proses', href: '#process' },
  { label: 'Kontak', href: '#contact' },
]

let sectionTriggers = []
let hideTrigger = null

onMounted(() => {
  if (!headerRef.value) return

  gsap.fromTo(headerRef.value, { y: -100, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', delay: 0.1 })

  // Slide the bar off-screen while scrolling down past the hero, bring it
  // back on any upward scroll — the usual "get out of the way while
  // reading, reappear when the user wants to navigate" nav pattern.
  hideTrigger = ScrollTrigger.create({
    start: 'top -120',
    end: 99999,
    onUpdate: (self) => {
      const goingDown = self.direction === 1
      gsap.to(headerRef.value, {
        y: goingDown ? -120 : 0,
        autoAlpha: goingDown ? 0 : 1,
        duration: 0.4,
        ease: 'power2.out',
        overwrite: true,
      })
    },
  })

  // Track which section is currently in view to highlight its nav link —
  // '#hero' included so the logo/home state is correct before scrolling.
  ;['#hero', ...links.map((l) => l.href)].forEach((href) => {
    const el = document.querySelector(href)
    if (!el) return
    sectionTriggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) activeHref.value = href
        },
      })
    )
  })
})

onBeforeUnmount(() => {
  hideTrigger?.kill()
  sectionTriggers.forEach((t) => t.kill())
  sectionTriggers = []
})
</script>

<template>
  <header ref="header" class="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
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
          <a
            :href="link.href"
            class="text-sm transition-colors"
            :class="activeHref === link.href ? 'text-white' : 'text-white/70 hover:text-white'"
          >
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
          class="block py-2 text-sm transition-colors"
          :class="activeHref === link.href ? 'text-white' : 'text-white/70 hover:text-white'"
          @click="isOpen = false"
        >
          {{ link.label }}
        </a>
      </li>
    </ul>
  </header>
</template>
