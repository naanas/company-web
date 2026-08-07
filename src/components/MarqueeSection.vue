<script setup>
import { useTemplateRef } from 'vue'
import { useMarquee } from '../composables/useMarquee'

const trackRef = useTemplateRef('track')
useMarquee(trackRef, { speed: 60 })

const words = ['INOVASI', 'DAMPAK', 'INSPIRASI', 'INTEGRITAS']
</script>

<template>
  <section class="overflow-hidden border-y border-white/10 bg-brand-950 py-10">
    <div ref="track" class="flex w-max items-center whitespace-nowrap will-change-transform">
      <template v-for="copy in 2" :key="copy">
        <span v-for="(word, i) in words" :key="`${copy}-${i}`" class="flex items-center">
          <span class="text-display px-4 text-white/85 sm:px-6">{{ word }}</span>
          <span class="px-2 text-3xl text-brand-accent sm:px-4">+</span>
        </span>
      </template>
    </div>
  </section>
</template>
