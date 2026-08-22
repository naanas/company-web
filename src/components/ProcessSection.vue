<script setup>
import { useTemplateRef, ref, watch, onBeforeUnmount } from 'vue'
import { useScrollReveal } from '../composables/useScrollReveal'
import { useBlurTextReveal } from '../composables/useBlurTextReveal'
import { useProcessScene } from '../composables/useProcessScene'
import { setScrollLocked } from '../composables/useLenis'

const sectionRef = useTemplateRef('section')
const headingRef = useTemplateRef('heading')
const stageRef = useTemplateRef('stage')

useScrollReveal(sectionRef, { y: 28, stagger: 0.06, start: 'top 75%' })
useBlurTextReveal(headingRef)

// Desktop mouse/trackpad gets a real Three.js camera (see useProcessScene.js
// for why); everyone else keeps the plain flat grid below plus the
// Teleported zoom overlay further down for focusing a step.
const scene = useProcessScene(stageRef)

function onCardActivate(phase, step, event) {
  if (scene.eligible) {
    // Mouse clicks in 3D mode are resolved by useProcessScene's own click
    // listener against real card rects, not native event targeting — see
    // the comment on onSceneClick there. Only keyboard activation (Enter/
    // Space), where `currentTarget` is reliably the focused card itself,
    // is handled here.
    if (event.type === 'click') return
    scene.toggleFocus(event.currentTarget)
  } else {
    openZoom(phase, step, event)
  }
}

const phases = [
  {
    number: '01',
    title: 'Pre-Production',
    steps: [
      {
        number: '01',
        title: 'Meeting User Experience',
        description: 'A working session to walk through your goals and how your team actually works today.',
      },
      {
        number: '02',
        title: 'Requirement Analysis',
        description: 'Turning that conversation into a concrete list of what the system needs to do.',
      },
      {
        number: '03',
        title: 'Application Specification',
        description: 'A formal spec covering scope, features, and technical requirements.',
      },
      {
        number: '04',
        title: 'Proposal Submission',
        description: 'Timeline and cost laid out in writing, ready for your review.',
      },
      {
        number: '05',
        title: 'Project Agreement',
        description: 'Scope signed off, and the engagement formally begins.',
      },
    ],
  },
  {
    number: '02',
    title: 'Production',
    steps: [
      {
        number: '01',
        title: 'System & Database Architecture Design',
        description: 'The technical foundation — how data and services are structured before any screen is built.',
      },
      {
        number: '02',
        title: 'User Interface Design & Implementation',
        description: 'Wireframes into working screens, built against the agreed architecture.',
      },
      {
        number: '03',
        title: 'System Development & Testing',
        description: 'Features built in sprints, each one tested as it lands.',
      },
      {
        number: '04',
        title: 'System Refinement & Optimization',
        description: 'Tuning performance and polishing rough edges before rollout.',
      },
    ],
  },
  {
    number: '03',
    title: 'Post-Production',
    steps: [
      {
        number: '01',
        title: 'System Deployment & Delivery',
        description: 'The system goes live and is formally handed over.',
      },
      {
        number: '02',
        title: 'User Guide Documentation',
        description: 'A clear, written reference for how to use and maintain what was built.',
      },
      {
        number: '03',
        title: 'User Training & Support Session',
        description: 'Hands-on sessions so your team can run the system with confidence.',
      },
      {
        number: '04',
        title: 'Maintenance & Technical Support',
        description: 'Ongoing fixes, updates, and support after launch.',
      },
    ],
  },
]

const zoomed = ref(null)
let sourceRect = null
let lastTrigger = null

function stepKey(phase, step) {
  return `${phase.number}-${step.number}`
}

function isOpen(phase, step) {
  if (scene.eligible) return scene.focused.value?.dataset.key === stepKey(phase, step)
  return zoomed.value?.key === stepKey(phase, step)
}

function openZoom(phase, step, event) {
  if (isOpen(phase, step)) {
    closeZoom()
    return
  }
  sourceRect = event.currentTarget.getBoundingClientRect()
  lastTrigger = event.currentTarget
  zoomed.value = { phase, step, key: stepKey(phase, step) }
}

function closeZoom() {
  zoomed.value = null
  // `preventScroll` matters here: Lenis owns scroll position via transform,
  // not native scrollTop, so a plain .focus() thinks the (already visible)
  // trigger card is off-screen and fires its own scrollIntoView — which
  // fights Lenis and jumps the page.
  lastTrigger?.focus({ preventScroll: true })
  lastTrigger = null
}

watch(zoomed, (value) => setScrollLocked(Boolean(value)))
onBeforeUnmount(() => setScrollLocked(false))

// Custom FLIP transition, driven by inline styles rather than Vue's
// CSS-class transition system (`:css="false"` below) — the "First" rect
// comes from wherever the clicked/activated card actually sits in the
// curved grid, which is only known at click time, not something a static
// stylesheet transition can express.
function onBeforeEnter(el) {
  const card = el.querySelector('.zoom-card')
  if (!sourceRect || !card) return
  const endRect = card.getBoundingClientRect()
  const dx = sourceRect.left + sourceRect.width / 2 - (endRect.left + endRect.width / 2)
  const dy = sourceRect.top + sourceRect.height / 2 - (endRect.top + endRect.height / 2)
  const sx = Math.max(sourceRect.width / endRect.width, 0.001)
  const sy = Math.max(sourceRect.height / endRect.height, 0.001)
  card.style.transition = 'none'
  card.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
  card.style.opacity = '0.5'
}

// `transitionend` doesn't fire when the "before" and "after" values happen
// to be equal (e.g. a rapid re-open right on the tail of a still-settling
// close). Racing it against a timeout — same belt-and-braces approach as
// `lenisScrollTo`'s `onComplete` guard in useLenis.js — means a missed event
// can never leave the overlay permanently stuck instead of just skipping
// straight to the end state.
function settleOnce(el, done, timeoutMs) {
  let finished = false
  const finish = () => {
    if (finished) return
    finished = true
    done()
  }
  el.addEventListener('transitionend', finish, { once: true })
  setTimeout(finish, timeoutMs)
}

function onEnter(el, done) {
  const card = el.querySelector('.zoom-card')
  requestAnimationFrame(() => {
    el.classList.add('is-visible')
    if (!card) {
      done()
      return
    }
    card.style.transition = 'transform 0.55s cubic-bezier(0.22, 0.8, 0.28, 1), opacity 0.3s ease'
    card.style.transform = 'translate(-50%, -50%)'
    card.style.opacity = '1'
    settleOnce(card, done, 650)
    card.focus()
  })
}

function onLeave(el, done) {
  const card = el.querySelector('.zoom-card')
  el.classList.remove('is-visible')
  if (!card) {
    done()
    return
  }
  card.style.transition = 'transform 0.18s ease, opacity 0.18s ease'
  card.style.transform = 'translate(-50%, -50%) scale(0.92)'
  card.style.opacity = '0'
  settleOnce(card, done, 260)
}
</script>

<template>
  <section id="process" ref="section" class="bg-brand-950 px-6 py-32">
    <div class="mx-auto max-w-6xl">
      <p data-reveal class="text-eyebrow text-brand-accent">Our Process</p>
      <h2 ref="heading" class="text-display mt-4 max-w-2xl text-white">From Brief to Running System</h2>
      <p data-reveal class="mt-4 max-w-md text-sm text-slate-400">
        Thirteen steps, three phases. Select one to bring it forward.
      </p>

      <div
        ref="stage"
        class="stage relative mt-20"
        :class="{ 'is-dimmed': zoomed || scene.focused.value, 'stage--3d': scene.eligible }"
      >
        <div class="stage-field" aria-hidden="true" />
        <div class="scene3d-root" aria-hidden="true" />

        <div class="spatial-grid relative grid gap-x-10 gap-y-16 lg:grid-cols-3">
          <div v-for="(phase, pi) in phases" :key="phase.title" class="phase-col" :data-col="pi">
            <div v-if="!scene.eligible" data-reveal class="flex items-baseline gap-3 pb-6">
              <span class="font-heading text-xs tracking-[0.3em] text-brand-accent">PHASE {{ phase.number }}</span>
              <span class="h-px flex-1 bg-white/10" />
            </div>
            <h3 v-if="!scene.eligible" data-reveal class="font-heading text-2xl font-medium text-white">
              {{ phase.title }}
            </h3>

            <ol class="mt-6 flex flex-col gap-4">
              <li v-for="(step, si) in phase.steps" :key="step.title" data-reveal>
                <div
                  data-card
                  :data-col="pi"
                  :data-row="si"
                  :data-key="stepKey(phase, step)"
                  role="button"
                  tabindex="0"
                  :aria-pressed="isOpen(phase, step)"
                  :aria-label="`${phase.title} — ${step.title}`"
                  class="card relative rounded-2xl border border-white/10 bg-brand-900/60 p-6"
                  :class="{ 'card--active': isOpen(phase, step) }"
                  @click="onCardActivate(phase, step, $event)"
                  @keydown.enter.prevent="onCardActivate(phase, step, $event)"
                  @keydown.space.prevent="onCardActivate(phase, step, $event)"
                >
                  <button
                    v-if="scene.eligible"
                    type="button"
                    class="card-close"
                    aria-label="Close"
                    @click.stop="scene.unfocus()"
                  >
                    ✕
                  </button>
                  <p v-if="scene.eligible" class="card-tag font-heading text-[0.65rem] tracking-[0.25em] text-brand-accent/70">
                    PHASE {{ phase.number }} · {{ phase.title.toUpperCase() }}
                  </p>
                  <span class="font-heading text-xs text-brand-accent/70">{{ step.number }}</span>
                  <h4 class="mt-3 font-heading text-base font-medium text-white">{{ step.title }}</h4>
                  <p class="mt-2 text-sm text-slate-400">{{ step.description }}</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition :css="false" @before-enter="onBeforeEnter" @enter="onEnter" @leave="onLeave">
        <div v-if="zoomed" class="zoom-backdrop" @click.self="closeZoom" @keydown.esc="closeZoom">
          <div class="zoom-card" tabindex="-1">
            <button type="button" class="zoom-close" aria-label="Close" @click="closeZoom">✕</button>
            <p class="font-heading text-xs tracking-[0.3em] text-brand-accent">
              PHASE {{ zoomed.phase.number }} · STEP {{ zoomed.step.number }}
            </p>
            <p class="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{{ zoomed.phase.title }}</p>
            <h4 class="mt-2 font-heading text-2xl font-medium text-white">{{ zoomed.step.title }}</h4>
            <p class="mt-4 text-sm leading-relaxed text-slate-400">{{ zoomed.step.description }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<style scoped>
/* Base mechanics, always on: perspective is harmless without any rotation
   applied to it, and the transition below is what makes both the
   lightweight (mobile/coarse-pointer) focus effect and the full spatial one
   feel eased rather than instant. */
.stage {
  perspective: 1600px;
  perspective-origin: 50% 35%;
}

/* Only the eligible (desktop mouse/trackpad) path needs fixed vertical
   room: its cards are lifted out of document flow into the Three.js scene
   (see useProcessScene.js), so nothing left in normal flow would otherwise
   hold this space open. The plain-grid fallback sizes itself from its own
   (still in-flow) content and doesn't need this. */
.stage.stage--3d {
  min-height: 620px;
}
@media (min-width: 1024px) {
  .stage.stage--3d {
    min-height: 1120px;
  }
}

.stage-field {
  position: absolute;
  inset: -2rem -1rem;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(640px 400px at 50% 15%, rgba(34, 211, 238, 0.08), transparent 70%),
    repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 64px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 64px);
  mask-image: radial-gradient(75% 75% at 50% 30%, black 35%, transparent 85%);
}

/* Where useProcessScene.js mounts the CSS3DRenderer's own DOM — sits above
   .stage-field but the (now-emptied, cards lifted out) .spatial-grid below
   still occupies its grid cell, harmlessly, at zero height. */
.scene3d-root {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.spatial-grid {
  z-index: 1;
}

.card-close {
  position: absolute;
  right: 0.75rem;
  top: 0.75rem;
  z-index: 2;
  display: none;
  height: 1.75rem;
  width: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  background: rgba(6, 6, 7, 0.6);
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.card-close:hover {
  color: #fff;
  border-color: rgba(34, 211, 238, 0.6);
}

.card-tag {
  display: block;
  margin-bottom: 0.5rem;
  opacity: 0.7;
}

[data-card][data-focused='true'] .card-close {
  display: flex;
}

[data-card] {
  transition:
    transform 0.5s cubic-bezier(0.22, 0.8, 0.28, 1),
    opacity 0.3s ease,
    filter 0.3s ease,
    border-color 0.3s ease;
  cursor: pointer;
}

[data-card]:hover {
  border-color: rgba(34, 211, 238, 0.35);
}

[data-card]:focus-visible {
  outline: 2px solid var(--color-brand-accent);
  outline-offset: 3px;
}

[data-card].card--active {
  border-color: var(--color-brand-accent);
}

/* Dims the whole grid while the zoom overlay is open — the active card
   itself stays undimmed as a quiet "this is the one" cue, everything else
   recedes so the Teleported card reads as the sole focus. */
.stage.is-dimmed [data-card]:not(.card--active) {
  opacity: 0.4;
  filter: blur(1px);
}

@media (prefers-reduced-motion: reduce) {
  [data-card] {
    transition: none;
  }
}
</style>

<style>
/* Unscoped: this overlay is Teleported to <body>, outside this component's
   rendered tree, so Vue's scoped data-v- attribute never reaches it. */
.zoom-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: block;
  background: rgba(6, 6, 7, 0);
  backdrop-filter: blur(0px);
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease;
}

.zoom-backdrop.is-visible {
  background: rgba(6, 6, 7, 0.72);
  backdrop-filter: blur(10px);
}

.zoom-card {
  position: fixed;
  top: 50%;
  left: 50%;
  width: min(30rem, 88vw);
  max-height: 80vh;
  overflow-y: auto;
  transform: translate(-50%, -50%);
  border-radius: 1.25rem;
  border: 1px solid rgba(34, 211, 238, 0.35);
  background: #0c0d0f;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.6), 0 0 60px -10px rgba(34, 211, 238, 0.15);
  padding: 2.25rem;
}

.zoom-card:focus {
  outline: none;
}

.zoom-close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: flex;
  height: 2rem;
  width: 2rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.6);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.zoom-close:hover {
  color: #fff;
  border-color: rgba(34, 211, 238, 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .zoom-backdrop,
  .zoom-card {
    transition: none !important;
  }
}
</style>
