<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const ServiceMonolith = defineAsyncComponent({
  loader: () => import('./3d/ServiceMonolith.vue'),
  delay: 0,
})

const sectionRef = useTemplateRef('section')
const curtainRef = useTemplateRef('curtain')
const progress = ref(0)
let scrollTriggerInstance = null
let curtainTriggerInstance = null

const services = [
  {
    title: 'Konsultasi & Strategi IT',
    description: 'Strategi transformasi digital yang selaras dengan tujuan dan proses bisnis Anda.',
    align: 'items-start text-left justify-self-start self-start',
  },
  {
    title: 'Software Development',
    description: 'Pengembangan software custom, web, dan mobile yang scalable dan reliable.',
    align: 'items-end text-right justify-self-end self-start',
  },
  {
    title: 'Desain Produk & UX',
    description: 'Desain produk yang berpusat pada pengguna, dari riset hingga prototype siap build.',
    align: 'items-start text-left justify-self-start self-end',
  },
  {
    title: 'Cloud & Infrastruktur',
    description: 'Arsitektur cloud, DevOps, dan integrasi sistem yang aman dan efisien.',
    align: 'items-end text-right justify-self-end self-end',
  },
]

const backdropWords = ['KONSULTASI', 'DEVELOPMENT', 'DESAIN', 'INFRASTRUKTUR']

const revealed = computed(() => services.map((_, i) => progress.value > (i + 1) * 0.18))
const stage = computed(() => revealed.value.filter(Boolean).length)

onMounted(() => {
  if (!sectionRef.value) return

  scrollTriggerInstance = ScrollTrigger.create({
    trigger: sectionRef.value,
    start: 'top top',
    end: '+=300%',
    scrub: 1,
    pin: true,
    onUpdate: (self) => {
      progress.value = self.progress
    },
  })

  // One-shot curtain wipe that plays right as the section locks into its
  // pin, independent of the scrubbed 300% stage reveal above — gives the
  // section a distinct "arriving on stage" beat instead of just snapping
  // into its pinned position.
  if (curtainRef.value) {
    const tween = gsap.fromTo(
      curtainRef.value,
      { clipPath: 'inset(0% 0% 0% 0%)' },
      {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 1,
        ease: 'power4.inOut',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top top',
          toggleActions: 'play none none reverse',
        },
      }
    )
    curtainTriggerInstance = tween.scrollTrigger
  }
})

onBeforeUnmount(() => {
  scrollTriggerInstance?.kill()
  curtainTriggerInstance?.kill()
})
</script>

<template>
  <section id="services" ref="section" class="relative flex h-screen items-center justify-center overflow-hidden bg-brand-950">
    <!-- Static backdrop of the four service pillars, always dimly visible -->
    <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 select-none">
      <span
        v-for="word in backdropWords"
        :key="word"
        class="text-display-lg leading-[0.9] text-white/[0.06]"
      >
        {{ word }}
      </span>
    </div>

    <p class="text-eyebrow absolute top-28 text-white/50">Layanan Kami</p>

    <!-- Centerpiece 3D monolith -->
    <div class="pointer-events-none relative z-10 h-[280px] w-[280px] sm:h-[360px] sm:w-[360px]">
      <Suspense>
        <template #default>
          <ServiceMonolith :stage="stage" />
        </template>
        <template #fallback>
          <div class="flex h-full w-full items-center justify-center">
            <div class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand-accent" />
          </div>
        </template>
      </Suspense>
    </div>

    <!-- Cumulative service card reveal, one per corner -->
    <div class="pointer-events-none absolute inset-0 z-20 grid grid-cols-2 grid-rows-2 gap-6 p-6 sm:p-14 lg:p-20">
      <div
        v-for="(service, i) in services"
        :key="service.title"
        class="pointer-events-auto flex max-w-[15rem] flex-col gap-2 transition-all duration-700 ease-out sm:max-w-xs"
        :class="[service.align, revealed[i] ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0']"
      >
        <h3 class="font-heading text-lg font-medium text-white sm:text-xl">{{ service.title }}</h3>
        <p class="text-xs text-slate-400 sm:text-sm">{{ service.description }}</p>
      </div>
    </div>

    <div class="absolute inset-x-0 bottom-8 flex items-center justify-between px-6 text-white/40 sm:px-10">
      <p class="text-xs uppercase tracking-[0.2em]">✦ Disiplin Berbeda. Standar Kualitas yang Sama.</p>
      <a href="#work" class="hidden items-center gap-2 border-b border-white/30 pb-1 text-sm font-medium text-white/70 transition-colors hover:border-white hover:text-white sm:flex">
        Lihat Karya Kami →
      </a>
    </div>

    <!-- Curtain wipe played once as the section pins into place -->
    <div ref="curtain" class="pointer-events-none absolute inset-0 z-30 bg-brand-950" />
  </section>
</template>
