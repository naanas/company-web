<script setup>
import { computed, onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMarquee } from '../composables/useMarquee'
import { useStripeReveal } from '../composables/useStripeReveal'
import { whenIdle } from '../composables/useIdle'

gsap.registerPlugin(ScrollTrigger)

const sectionRef = useTemplateRef('section')
const eyebrowRef = useTemplateRef('eyebrow')
const wordsRef = useTemplateRef('words')
const missionRef = useTemplateRef('mission')
const trackRef = useTemplateRef('track')

useMarquee(trackRef, { speed: 60 })
useStripeReveal(sectionRef)

// Long on purpose: this is the section's centerpiece and it's revealed word by
// word on scroll, so it needs enough words to be worth scrubbing through — a
// short line resolves before the reader has really started scrolling.
//
// What it must NOT do is go back to restating "a two-person IT consulting and
// software house", which the paragraph directly below already says in its own
// words. The added length goes into what VELTECH actually builds instead.
//
// Rendered at display size, so every word costs roughly half a line on a
// phone. If this grows much past 30 words, re-check it at 390px before
// shipping — see the type-scale note in style.css.
const missionText =
  "We build custom systems for operations that can't afford to break: the ERP, dashboards, and integrations your day actually runs on, shaped around how your team already works."

const words = computed(() => missionText.split(' '))
const marqueeWords = ['INNOVATION', 'IMPACT', 'INSPIRATION', 'INTEGRITY']

let scrollTrigger = null
let alive = true

// The intro line, the word-by-word mission scrub, and the mission/link block
// all read off one shared scroll-linked timeline instead of separate
// ScrollTriggers with their own start/end math — keeps all three locked to
// the same scroll position across this section's sticky range rather than
// risking drift between independently-tuned triggers.
//
// Deferred to idle time — this section is below the fold at mount, so
// there's no rush, and building it eagerly just meant competing with the
// hero's own entrance animation (and its WebGPU init) for the main thread.
onMounted(() => {
  whenIdle(() => {
    if (!alive || !sectionRef.value || !eyebrowRef.value || !wordsRef.value || !missionRef.value) return

    const wordEls = wordsRef.value.querySelectorAll('[data-word]')

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.value,
        start: 'top 85%',
        end: 'bottom 60%',
        scrub: 0.5,
      },
    })

    timeline
      .fromTo(eyebrowRef.value, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'power3.out' }, 0)
      .fromTo(missionRef.value, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, ease: 'power3.out' }, 0.05)
      .fromTo(wordEls, { opacity: 0.15 }, { opacity: 1, stagger: 0.5, ease: 'none' }, 0.15)

    scrollTrigger = timeline.scrollTrigger
  })
})

onBeforeUnmount(() => {
  alive = false
  scrollTrigger?.kill()
})
</script>

<template>
  <!-- `overflow-x-clip` rather than `overflow-hidden`: `hidden` makes this
       section a scroll container, which silently cancels the `lg:sticky`
       on the block below (sticky resolves against its nearest scrollport,
       and this one never scrolls). `clip` still crops horizontally for the
       marquee without creating that scrollport. -->
  <section id="about" ref="section" class="relative min-h-[130vh] overflow-x-clip bg-paper-100">
    <!-- `pt-28` clears the fixed navbar. At `pt-16` (64px) the eyebrow sat
         under the nav pill, which is ~76px tall including its own top offset —
         on mobile its first line was hidden behind the bar entirely. The
         sticky offset matches for the same reason. -->
    <div class="mx-auto flex max-w-6xl flex-col gap-16 px-6 pt-28 pb-16 lg:sticky lg:top-28">
      <div ref="eyebrow" class="text-eyebrow max-w-xs text-paper-muted">
        Small Team, Direct Line to the Build.<br />
        No Account Managers Between You and the Code.
      </div>

      <p ref="words" class="text-statement max-w-4xl text-paper-ink">
        <span v-for="(word, i) in words" :key="i" data-word class="mr-3 inline-block">{{ word }}</span>
      </p>

      <div ref="mission" class="ml-auto flex max-w-sm flex-col items-start gap-6 text-right sm:text-left">
        <p class="text-paper-muted">
          We're a two-person software house: one of us listens to what you need, the other
          builds it. No relay race between departments — just a system that does what you
          actually asked for.
        </p>
        <a href="#work" class="group flex items-center gap-2 border-b border-paper-ink/30 pb-1 text-sm font-medium text-paper-ink/80 transition-colors hover:border-paper-ink hover:text-paper-ink">
          More About Us
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
