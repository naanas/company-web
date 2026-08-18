<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { useScrollZoom } from '../composables/useScrollZoom'
import { useDarkClusterV } from '../composables/useDarkClusterV'

const sectionRef = useTemplateRef('section')
const clusterContainerRef = useTemplateRef('clusterContainer')
const clusterCanvasRef = useTemplateRef('clusterCanvas')

// Spinning, noise-breathing shard cluster arranged into a V — the hero's
// sole centerpiece now that the background video is gone. Adapted from
// tympanus.net/codrops "dark cluster" (WebGPU/TSL). See useDarkClusterV.js.
useDarkClusterV(clusterCanvasRef, clusterContainerRef)

// Scroll-driven zoom, retargeted from the old background video onto the
// cluster's canvas container (a plain CSS scale — the WebGPU scene itself
// isn't scroll-aware). See useScrollZoom.js.
useScrollZoom(clusterContainerRef, null, sectionRef)

// Rotating headline word, swapped on a timer with a glitch transition (see
// the `word-glitch` keyframes below) — echoes the obscured/blurred word in
// the reference layout, but as an actual cycling word rather than a static
// blur, with a glitchy cut between words instead of a plain crossfade.
const words = ['purpose', 'depth', 'something', 'impact', 'intention']
const wordIndex = ref(0)
let wordInterval = null

// The hero is always visible on load, so its entrance plays as a plain
// on-mount timeline rather than a ScrollTrigger reveal — scroll-linked
// triggers here would be racing the initial layout (webfonts swapping in,
// the pinned services section inserting its spacer) for no visual benefit,
// since the section is already on screen either way.
onMounted(() => {
  if (!sectionRef.value) return
  const targets = sectionRef.value.querySelectorAll('[data-reveal]')
  gsap.fromTo(
    targets,
    { autoAlpha: 0, y: 40 },
    { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.2 }
  )

  wordInterval = setInterval(() => {
    wordIndex.value = (wordIndex.value + 1) % words.length
  }, 2600)
})

onBeforeUnmount(() => {
  clearInterval(wordInterval)
})
</script>

<template>
  <section
    id="hero"
    ref="section"
    class="relative flex min-h-screen items-start overflow-hidden bg-brand-950 pt-36 sm:pt-40"
  >
    <!-- Ambient brand-color glow behind the cluster, standing in for the
         removed background video so the section isn't flat black. -->
    <div class="pointer-events-none absolute -top-32 -right-32 z-[1] h-[34rem] w-[34rem] rounded-full bg-brand-accent/10 blur-[140px]" />
    <div class="pointer-events-none absolute -bottom-40 -left-24 z-[1] h-[28rem] w-[28rem] rounded-full bg-brand-accent-2/10 blur-[140px]" />

    <!-- Darkens only the text column on the left for legibility; fades out
         well before the cluster's territory so the V itself stays clear. -->
    <div class="pointer-events-none absolute inset-0 z-[3] [background:linear-gradient(to_right,var(--color-brand-950)_0%,var(--color-brand-950)_32%,transparent_58%)]" />
    <div class="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-transparent via-transparent to-brand-950" />

    <!-- Dark-cluster V: a spinning cluster of shards forming a V — the
         hero's centerpiece, replacing the old background video. Hidden on
         mobile — a continuous WebGPU render loop isn't worth it on small
         screens/weaker GPUs for what's a purely decorative object there. -->
    <div
      ref="clusterContainer"
      class="absolute top-24 bottom-0 right-[-6%] z-[2] hidden w-[68vw] max-w-[880px] sm:block sm:top-28"
    >
      <canvas ref="clusterCanvas" class="h-full w-full" />
    </div>

    <div class="relative z-10 w-full px-6 sm:px-10">
      <p data-reveal class="text-eyebrow text-brand-accent">PT Veltera Digital Technologies</p>

      <h1
        data-reveal
        class="mt-4 max-w-xl font-heading text-[clamp(2.25rem,5.5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.01em] text-white"
      >
        Designed to<br />
        mean
        <Transition name="word-glitch" mode="out-in">
          <span :key="words[wordIndex]" class="inline-block text-white/40 blur-sm select-none">{{ words[wordIndex] }}</span>
        </Transition>
      </h1>

      <a
        data-reveal
        href="#contact"
        class="group mt-8 inline-flex items-center gap-2 border-b border-white/30 pb-1 text-sm uppercase tracking-[0.15em] text-white/80 transition-colors hover:border-brand-accent hover:text-white"
      >
        Start a Project
        <span class="transition-transform group-hover:translate-x-1">→</span>
      </a>
    </div>

    <!-- Company blurb, bottom-right -->
    <p data-reveal class="absolute bottom-24 right-6 z-10 hidden max-w-xs text-right text-sm leading-relaxed text-white/50 sm:right-10 sm:bottom-28 md:block">
      VELTECH is an IT consulting firm, digital agency, and software house building
      websites, applications, and custom systems — designed for clarity, built to scale.
    </p>

    <!-- Scroll hint, bottom-left -->
    <a
      href="#about"
      aria-label="Scroll down"
      class="absolute bottom-8 left-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/40 transition hover:border-white/40 hover:text-white sm:left-10"
    >
      ↓
    </a>
  </section>
</template>

<style scoped>
.word-glitch-enter-active {
  animation: word-glitch-in 0.4s steps(2, end);
}
.word-glitch-leave-active {
  animation: word-glitch-out 0.28s steps(2, end);
}

@keyframes word-glitch-in {
  0% {
    opacity: 0;
    filter: blur(2px);
    transform: translate(8px, 0);
    clip-path: inset(0 0 55% 0);
    text-shadow:
      -3px 0 #ff2965,
      3px 0 #22d3ee;
  }
  20% {
    opacity: 1;
    transform: translate(-6px, 0);
    clip-path: inset(45% 0 8% 0);
  }
  40% {
    transform: translate(5px, 0);
    clip-path: inset(8% 0 50% 0);
    text-shadow:
      2px 0 #ff2965,
      -2px 0 #22d3ee;
  }
  60% {
    transform: translate(-4px, 0);
    clip-path: inset(60% 0 4% 0);
  }
  80% {
    transform: translate(2px, 0);
    clip-path: inset(0 0 0 0);
    text-shadow:
      -1px 0 #ff2965,
      1px 0 #22d3ee;
  }
  100% {
    opacity: 1;
    transform: translate(0, 0);
    filter: blur(4px);
    clip-path: inset(0 0 0 0);
    text-shadow: none;
  }
}

@keyframes word-glitch-out {
  0% {
    opacity: 1;
    transform: translate(0, 0);
    clip-path: inset(0 0 0 0);
    text-shadow: none;
  }
  35% {
    transform: translate(-5px, 0);
    clip-path: inset(20% 0 30% 0);
    text-shadow:
      -3px 0 #ff2965,
      3px 0 #22d3ee;
  }
  65% {
    transform: translate(6px, 0);
    clip-path: inset(55% 0 5% 0);
  }
  100% {
    opacity: 0;
    transform: translate(0, 0);
    filter: blur(6px);
    clip-path: inset(0 0 70% 0);
  }
}
</style>
