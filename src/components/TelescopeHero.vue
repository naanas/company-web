<script setup>
import { useTemplateRef } from 'vue'
import { useTelescopeZoom } from '../composables/useTelescopeZoom'

const props = defineProps({
  service: { type: Object, required: true },
})

const sectionRef = useTemplateRef('section')
useTelescopeZoom(sectionRef)

// Fixed screen-space positions for up to four floating markers — kept as
// plain CSS classes (marker-0..3) rather than inline per-item math so the
// mobile media query below can reposition/hide them without fighting
// inline styles.
const markers = props.service.highlights.slice(0, 4)
</script>

<template>
  <section id="service-hero" ref="section" class="tz relative flex h-screen items-center justify-center overflow-hidden bg-brand-950">
    <div class="tz-field" aria-hidden="true" />

    <div class="tz-rings" aria-hidden="true">
      <span class="tz-ring tz-ring-6" />
      <span class="tz-ring tz-ring-5" />
      <span class="tz-ring tz-ring-4" />
      <span class="tz-ring tz-ring-3" />
      <span class="tz-ring tz-ring-2" />
      <span class="tz-ring tz-ring-1" />
      <span class="tz-core">+</span>
    </div>

    <div class="tz-markers" aria-hidden="true">
      <span
        v-for="(item, i) in markers"
        :key="item.label"
        class="tz-marker"
        :class="`tz-marker-${i}`"
      >
        {{ item.label }}
      </span>
    </div>

    <div class="tz-content relative z-10 flex flex-col items-center px-6 text-center">
      <p class="text-eyebrow text-brand-accent">Our Services</p>
      <h1 class="tz-title mt-4">
        <span class="tz-title-left">{{ service.titleParts[0] }}</span>
        <span class="tz-title-right">{{ service.titleParts[1] }}</span>
      </h1>
    </div>

    <div class="tz-hint absolute bottom-8 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-white/40">
      Scroll to explore
    </div>
  </section>
</template>

<style scoped>
.tz {
  --progress: 0;
}

.tz-field {
  position: absolute;
  inset: -2rem;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(640px 400px at 50% 45%, rgba(34, 211, 238, 0.08), transparent 70%),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 64px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 64px);
  mask-image: radial-gradient(70% 70% at 50% 45%, black 30%, transparent 85%);
}

/* Scaling the whole group by --progress (0→1) is what makes six
   differently-sized, concentric rings read as a single lens closing in from
   a pinpoint rather than six shapes independently growing — same mechanic
   as telescope-zoom's `.section__media { transform: scale(var(--progress)) }`. */
.tz-rings {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: scale(var(--progress));
  will-change: transform;
}

.tz-ring {
  position: absolute;
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(34, 211, 238, 0.5);
}

.tz-ring-1 {
  width: 22vmin;
  border-color: rgba(34, 211, 238, 0.55);
}
.tz-ring-2 {
  width: 38vmin;
  border-color: rgba(34, 211, 238, 0.42);
}
.tz-ring-3 {
  width: 56vmin;
  border-color: rgba(34, 211, 238, 0.32);
}
.tz-ring-4 {
  width: 76vmin;
  border-color: rgba(34, 211, 238, 0.22);
}
.tz-ring-5 {
  width: 98vmin;
  border-color: rgba(34, 211, 238, 0.14);
}
.tz-ring-6 {
  width: 124vmin;
  border-color: rgba(34, 211, 238, 0.08);
}

.tz-core {
  position: relative;
  z-index: 2;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  color: var(--color-brand-accent);
  opacity: var(--progress);
}

/* Highlight labels drift toward the viewer through the lens as it opens,
   then fade before they'd otherwise overlap the settled title — the
   feature list the page is about to spell out, glimpsed once on the way in. */
.tz-markers {
  position: absolute;
  inset: 0;
  z-index: 2;
  perspective: 70vh;
  pointer-events: none;
}

.tz-marker {
  position: absolute;
  border-radius: 9999px;
  border: 1px solid rgba(34, 211, 238, 0.3);
  padding: 0.35rem 0.9rem;
  font-family: var(--font-sans);
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(226, 245, 250, 0.8);
  background: rgba(6, 6, 7, 0.4);
  white-space: nowrap;
  transform: translateZ(calc(var(--progress) * 55vh));
  opacity: calc(1 - var(--progress) * 1.6);
}

.tz-marker-0 {
  top: 20%;
  left: 10%;
}
.tz-marker-1 {
  top: 24%;
  right: 8%;
}
.tz-marker-2 {
  bottom: 22%;
  left: 14%;
}
.tz-marker-3 {
  bottom: 18%;
  right: 12%;
}

@media (max-width: 640px) {
  .tz-marker-1,
  .tz-marker-3 {
    display: none;
  }
  .tz-marker-0 {
    top: 16%;
    left: 6%;
  }
  .tz-marker-2 {
    bottom: 16%;
    right: 6%;
    left: auto;
  }
}

.tz-title {
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 0.95;
  letter-spacing: -0.01em;
  font-size: clamp(2.5rem, 8vw, 6.5rem);
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.6ch;
  color: #fff;
}

.tz-title-left {
  transform: translate3d(calc(var(--progress) * -28vw), 0, 0);
}

.tz-title-right {
  transform: translate3d(calc(var(--progress) * 28vw), 0, 0);
  color: var(--color-brand-accent);
}

@media (max-width: 768px) {
  .tz-title {
    font-size: clamp(2.25rem, 11vw, 3.5rem);
  }
  .tz-title-left {
    transform: translate3d(calc(var(--progress) * -18vw), 0, 0);
  }
  .tz-title-right {
    transform: translate3d(calc(var(--progress) * 18vw), 0, 0);
  }
}

.tz-hint {
  z-index: 3;
  opacity: calc(1 - var(--progress) * 4);
}

@media (prefers-reduced-motion: reduce) {
  .tz-hint {
    display: none;
  }
}
</style>
