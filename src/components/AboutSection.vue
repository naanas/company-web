<script setup>
import { computed, useTemplateRef } from 'vue'
import { useWordsScrub } from '../composables/useWordsScrub'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useMarquee } from '../composables/useMarquee'

const sectionRef = useTemplateRef('section')
const wordsRef = useTemplateRef('words')
const trackRef = useTemplateRef('track')

useWordsScrub(sectionRef, wordsRef)
useScrollReveal(sectionRef, { selector: '[data-reveal]', start: 'top 85%' })
useMarquee(trackRef, { speed: 60 })

const missionText =
  'VELTECH adalah konsultan IT dan software house independen yang membangun sistem serta produk digital bermakna melalui strategi, rekayasa perangkat lunak, dan desain.'

const words = computed(() => missionText.split(' '))
const marqueeWords = ['INOVASI', 'DAMPAK', 'INSPIRASI', 'INTEGRITAS']
</script>

<template>
  <section id="about" ref="section" class="relative min-h-[130vh] overflow-hidden bg-paper-100">
    <div class="mx-auto flex max-w-6xl flex-col gap-16 px-6 pt-32 pb-16 lg:sticky lg:top-32">
      <div data-reveal class="text-eyebrow max-w-xs text-paper-muted">
        Kami Merancang untuk Ketahanan Jangka Panjang.<br />
        Kejelasan Lebih Dulu, Kualitas Selalu, Dibangun untuk Skala.
      </div>

      <p ref="words" class="text-display max-w-5xl text-paper-ink">
        <span v-for="(word, i) in words" :key="i" data-word class="mr-3 inline-block">{{ word }}</span>
      </p>

      <div data-reveal class="ml-auto flex max-w-sm flex-col items-start gap-6 text-right sm:text-left">
        <p class="text-paper-muted">
          Misi kami adalah membuat teknologi terasa manusiawi — merancang produk digital yang
          intuitif, purposeful, dan bermakna bagi penggunanya.
        </p>
        <a href="#services" class="group flex items-center gap-2 border-b border-paper-ink/30 pb-1 text-sm font-medium text-paper-ink/80 transition-colors hover:border-paper-ink hover:text-paper-ink">
          Selengkapnya Tentang Kami
          <span class="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </div>

    <!-- Scrolling word banner, folded into this section rather than living
         as its own scroll-snap stop between Hero and About. -->
    <div class="relative overflow-hidden border-y border-white/10 bg-brand-950 py-10">
      <div ref="track" class="flex w-max items-center whitespace-nowrap will-change-transform">
        <template v-for="copy in 2" :key="copy">
          <span v-for="(word, i) in marqueeWords" :key="`${copy}-${i}`" class="flex items-center">
            <span class="text-display px-4 text-white/85 sm:px-6">{{ word }}</span>
            <span class="px-2 text-3xl text-brand-accent sm:px-4">+</span>
          </span>
        </template>
      </div>
    </div>
  </section>
</template>
