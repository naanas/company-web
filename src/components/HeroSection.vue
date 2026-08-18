<script setup>
import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { useInteractiveLineField } from '../composables/useInteractiveLineField'
import { useScrollZoom } from '../composables/useScrollZoom'

const sectionRef = useTemplateRef('section')
const lineCanvasRef = useTemplateRef('lineCanvas')
const bgVideoRef = useTemplateRef('bgVideo')
const zoomImageRef = useTemplateRef('zoomImage')

// Passive "touch the lines" cursor-bend effect stays active in the
// background — only the hold-to-blast hotspot (and its label) was removed.
useInteractiveLineField(lineCanvasRef, sectionRef)

// Same two elements/two tweens as codepen.io/GreenSock/pen/YzbPYMx: the
// `.image-container img` role (scale 2 + z 350, the dramatic zoom) is
// `zoomImage` (BGHTML.png — its window is now cut out transparent in the
// source file), and the `.section.hero` background role (scale 1.1) is
// `bgVideo`, sitting behind it at the same position/size so the animation
// shows straight through the window. The two roles scale at different
// rates/timing on purpose — that mismatch is what reads as perspective:
// the foreground frame zooms in hard while the video behind it drifts at
// its own slower pace, the same depth cue the reference gets from photo
// vs. mountain background. See useScrollZoom.js.
useScrollZoom(zoomImageRef, bgVideoRef, sectionRef)

// Rotating headline word, swapped on a timer with a glitch transition (see
// the `word-glitch` keyframes below) — echoes the obscured/blurred word in
// the reference layout, but as an actual cycling word rather than a static
// blur, with a glitchy cut between words instead of a plain crossfade.
const words = ['purpose', 'depth', 'something', 'impact', 'intention']
const wordIndex = ref(0)
let wordInterval = null
let stopBgVideo = null

// Chrome pauses silent, video-only background media as a power-saving
// measure ("video-only background media was paused to save power") — it
// can hit an autoplaying, audio-less loop like this one even while the tab
// is genuinely in view. Resuming on 'pause' (only while the page is
// actually visible, so it doesn't fight a deliberate background-tab pause)
// makes the loop self-heal instead of freezing on one frame.
function keepPlaying(videoRef) {
  const video = videoRef.value
  if (!video) return
  const resume = () => {
    if (document.visibilityState === 'visible') video.play().catch(() => {})
  }
  resume()
  video.addEventListener('pause', resume)
  return () => video.removeEventListener('pause', resume)
}

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

  // The `autoplay` attribute alone is unreliable — some browsers/embed
  // contexts silently never start loading the video without an explicit
  // play() call, leaving it stuck paused at frame 0 indefinitely. Calling
  // it directly is the robust way to kick off autoplay; `muted` is what
  // makes browsers allow it without a user gesture.
  stopBgVideo = keepPlaying(bgVideoRef)
})

onBeforeUnmount(() => {
  clearInterval(wordInterval)
  stopBgVideo?.()
})
</script>

<template>
  <section
    id="hero"
    ref="section"
    class="relative flex min-h-screen items-start overflow-hidden bg-brand-950 pt-36 sm:pt-40"
  >
    <!-- `.content .section.hero` from the reference — background layer,
         normal flow, gets the timeline's scale:1.1 tween. Same box/sizing as
         the photo layer below so it lines up behind the window. -->
    <div class="absolute inset-0 z-[1] overflow-hidden">
      <video
        ref="bgVideo"
        class="pointer-events-none h-full w-full object-cover object-center"
        :src="'/videos/veltechlogo.mp4'"
        autoplay
        muted
        loop
        playsinline
      />
    </div>

    <!-- `.image-container > img` from the reference — its own absolute box
         with `perspective: 500px`, gets the timeline's scale:2 + z:350
         tween (the dramatic zoom). BGHTML.png's window is cut out
         transparent, so bgVideo shows straight through it. -->
    <div class="absolute inset-x-0 top-0 z-[2] h-full overflow-hidden [perspective:500px]">
      <img
        ref="zoomImage"
        class="pointer-events-none h-full w-full object-cover object-center"
        :src="'/images/BGHTML.png'"
        alt=""
      />
    </div>

    <!-- Touchable line field: bends away from the cursor (see useInteractiveLineField.js) -->
    <canvas ref="lineCanvas" class="pointer-events-none absolute inset-0 z-[3]" />

    <div class="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-r from-brand-950 via-brand-950/60 to-transparent" />
    <div class="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-transparent via-transparent to-brand-950" />

    <!-- Ambient brand-color glow, tinting the darkened edges left by the
         gradients above instead of leaving them flat black. -->
    <div class="pointer-events-none absolute -top-32 -right-32 z-[4] h-[34rem] w-[34rem] rounded-full bg-brand-accent/10 blur-[140px]" />
    <div class="pointer-events-none absolute -bottom-40 -left-24 z-[4] h-[28rem] w-[28rem] rounded-full bg-brand-accent-2/10 blur-[140px]" />

    <!-- Faint blueprint grid texture for depth in the negative space. -->
    <div
      class="pointer-events-none absolute inset-0 z-[4] opacity-[0.05] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]"
    />

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
    <p data-reveal class="absolute bottom-24 right-6 hidden max-w-xs text-right text-sm leading-relaxed text-white/50 sm:right-10 sm:bottom-28 md:block">
      VELTECH is an IT consulting firm, digital agency, and software house building
      websites, applications, and custom systems — designed for clarity, built to scale.
    </p>

    <!-- Scroll hint, bottom-left -->
    <a
      href="#about"
      aria-label="Scroll down"
      class="absolute bottom-8 left-6 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/40 transition hover:border-white/40 hover:text-white sm:left-10"
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
