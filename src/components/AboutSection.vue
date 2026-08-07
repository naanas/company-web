<script setup>
import { computed, useTemplateRef } from 'vue'
import { useWordsScrub } from '../composables/useWordsScrub'
import { useScrollReveal } from '../composables/useScrollReveal'

const sectionRef = useTemplateRef('section')
const wordsRef = useTemplateRef('words')

useWordsScrub(sectionRef, wordsRef)
useScrollReveal(sectionRef, { selector: '[data-reveal]', start: 'top 85%' })

const missionText =
  'VELTECH adalah konsultan IT dan software house independen yang membangun sistem serta produk digital bermakna melalui strategi, rekayasa perangkat lunak, dan desain.'

const words = computed(() => missionText.split(' '))
</script>

<template>
  <section id="about" ref="section" class="relative min-h-[130vh] bg-paper-100 px-6 py-32">
    <div class="mx-auto flex max-w-6xl flex-col gap-16 lg:sticky lg:top-32">
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
  </section>
</template>
