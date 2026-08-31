<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { isProgrammaticScroll } from '../composables/useLenis'
import { whenIdle } from '../composables/useIdle'
import { services } from '../data/services'

gsap.registerPlugin(ScrollTrigger)

const route = useRoute()

const isOpen = ref(false)
const activeHref = ref('#hero')
const headerRef = useTemplateRef('header')
const servicesDropdownRef = useTemplateRef('servicesDropdown')
const servicesPanelRef = useTemplateRef('servicesPanel')

const servicesOpen = ref(false)
const mobileServicesOpen = ref(false)
const serviceItemRefs = ref([])

function setServiceItemRef(el, index) {
  if (el) serviceItemRefs.value[index] = el
}

// Plain same-page anchors. These only resolve to something when the home
// page's sections actually exist in the DOM, so on any other route they
// fall back to a real navigation back to "/" plus the hash — see pageHref().
const links = [
  { label: 'About', hash: '#about' },
  { label: 'Our Clients', hash: '#work' },
  { label: 'Process', hash: '#process' },
  { label: 'Contact', hash: '#contact' },
]

const trackedHashes = ['#hero', '#about', '#services', '#work', '#process', '#contact']

function pageHref(hash) {
  return route.path === '/' ? hash : `/${hash}`
}

const isServicesActive = () => route.path.startsWith('/services') || activeHref.value === '#services'

let sectionTriggers = []
let matchMedia = null
let isHidden = false
let dropdownTl = null

// Single owner of the shown/hidden state, so the scroll direction and the
// pointer-near-top rescue below can't fight each other into a half-faded bar.
function setHidden(hidden) {
  if (!headerRef.value || hidden === isHidden) return
  isHidden = hidden

  gsap.to(headerRef.value, {
    y: hidden ? -120 : 0,
    autoAlpha: hidden ? 0 : 1,
    duration: 0.4,
    ease: 'power2.out',
    overwrite: true,
  })
}

const TOP_ZONE = 90

function onPointerNearTop(event) {
  if (event.clientY <= TOP_ZONE) setHidden(false)
}

function teardownSectionTracking() {
  sectionTriggers.forEach((t) => t.kill())
  sectionTriggers = []
}

// Only meaningful on the home page — a service detail page has none of
// these section ids, so querySelector just skips them.
function setupSectionTracking() {
  teardownSectionTracking()
  trackedHashes.forEach((hash) => {
    const el = document.querySelector(hash)
    if (!el) return
    sectionTriggers.push(
      ScrollTrigger.create({
        trigger: el,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => {
          if (self.isActive) activeHref.value = hash
        },
      })
    )
  })
}

onMounted(() => {
  if (!headerRef.value) return

  gsap.fromTo(headerRef.value, { y: -100, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'power3.out', delay: 0.1 })

  // The ScrollTrigger setup below doesn't need to be ready before the user
  // actually scrolls, so it's deferred to idle time — doing it eagerly here
  // meant it competed with the hero's own entrance animation (and its
  // WebGPU init) for the main thread right as the page loads. See
  // useIdle.js.
  whenIdle(() => {
    if (!headerRef.value) return

    // Slide the bar off-screen while scrolling down past the hero, bring it
    // back on any upward scroll — the usual "get out of the way while
    // reading, reappear when the user wants to navigate" nav pattern.
    //
    // Only acts on an actual change of direction: `onUpdate` fires every
    // scroll frame, so tweening unconditionally spawned (and `overwrite`-killed)
    // a fresh tween dozens of times per second for no visual difference.
    // Programmatic scrolls are ignored outright — clicking a nav link scrolls
    // down, which used to hide the very bar the user just reached for. Same
    // for while the mobile menu is open, since hiding the header takes the
    // open menu with it.
    //
    // Desktop only. `autoAlpha` puts the header at `visibility: hidden`, so a
    // hidden bar is not merely invisible, it is unclickable — and below `md`
    // the hamburger inside it is the ONLY way to navigate. Auto-hiding there
    // stranded anyone who had scrolled down: no menu button, no links, and no
    // way back except scrolling up first, which reads as the nav being broken.
    //
    // Both breakpoints are declared even though only one branch does work:
    // gsap.matchMedia runs its callback only when at least one query matches,
    // so a lone `(min-width: 768px)` would silently do nothing on mobile.
    matchMedia = gsap.matchMedia()
    matchMedia.add({ isDesktop: '(min-width: 768px)', isMobile: '(max-width: 767px)' }, (context) => {
      if (!context.conditions.isDesktop) {
        setHidden(false)
        return
      }

      ScrollTrigger.create({
        start: 'top -120',
        end: 99999,
        onUpdate: (self) => {
          if (isProgrammaticScroll() || isOpen.value) return
          setHidden(self.direction === 1)
        },
      })

      // Reaching for the nav is intent enough to bring it back. Without this
      // the only way to recover a hidden bar is to scroll up, which is a
      // strange thing to have to do when the pointer is already up there.
      window.addEventListener('pointermove', onPointerNearTop)
      return () => window.removeEventListener('pointermove', onPointerNearTop)
    })

    if (route.path === '/') setupSectionTracking()
  })
})

// NavBar itself never unmounts (it sits beside <router-view>, not inside
// it), so it has to react to route changes itself rather than relying on
// mount/unmount — leaving stale ScrollTrigger instances pointing at a home
// section that's just been torn out from under a route change to a service
// page would otherwise pile up silently on every visit back to "/".
watch(
  () => route.path,
  (path) => {
    closeServices({ immediate: true })
    mobileServicesOpen.value = false
    isOpen.value = false
    if (path === '/') {
      activeHref.value = '#hero'
      // The new HomeView's sections mount in the same tick as this watcher
      // fires; nextTick just waits for that render to actually land in the
      // DOM before querying for it.
      nextTick(setupSectionTracking)
    } else {
      activeHref.value = ''
      teardownSectionTracking()
    }
  }
)

// Closing on a bare `mouseleave` made the panel twitchy: the pointer only has
// to clip a corner on its way down to the items — or cross the seam between
// the button and the panel — for the menu to snap shut and have to be
// reopened. A short grace period absorbs those, and re-entering cancels it,
// so the panel closes when the user actually leaves rather than whenever the
// cursor briefly strays.
const SERVICES_CLOSE_DELAY = 140
let servicesCloseTimer = null

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animateDropdownIn() {
  const panel = servicesPanelRef.value
  if (!panel) return

  dropdownTl?.kill()

  const items = serviceItemRefs.value.filter(Boolean)

  gsap.set(panel, {
    autoAlpha: 0,
    y: -12,
    scaleY: 0.96,
    transformOrigin: 'top center',
  })
  gsap.set(items, {
    autoAlpha: 0,
    y: 10,
    filter: 'blur(4px)',
  })

  dropdownTl = gsap
    .timeline()
    .to(panel, {
      autoAlpha: 1,
      y: 0,
      scaleY: 1,
      duration: 0.35,
      ease: 'power3.out',
    })
    .to(
      items,
      {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.3,
        stagger: 0.05,
        ease: 'power2.out',
      },
      '-=0.2'
    )
}

function animateDropdownOut(onComplete) {
  const panel = servicesPanelRef.value
  if (!panel) {
    onComplete?.()
    return
  }

  const items = serviceItemRefs.value.filter(Boolean)

  dropdownTl?.kill()
  dropdownTl = gsap
    .timeline({ onComplete })
    .to(items, {
      autoAlpha: 0,
      y: -6,
      duration: 0.12,
      stagger: 0.02,
      ease: 'power2.in',
    })
    .to(
      panel,
      {
        autoAlpha: 0,
        y: -8,
        scaleY: 0.98,
        duration: 0.15,
        ease: 'power2.in',
      },
      '-=0.08'
    )
}

function openServices() {
  clearTimeout(servicesCloseTimer)
  if (!servicesOpen.value) {
    servicesOpen.value = true
    if (!prefersReducedMotion()) {
      nextTick(animateDropdownIn)
    }
  } else {
    dropdownTl?.kill()
    if (!prefersReducedMotion()) {
      animateDropdownIn()
    }
  }
}

function closeServices({ immediate = false } = {}) {
  clearTimeout(servicesCloseTimer)
  if (immediate || prefersReducedMotion()) {
    dropdownTl?.kill()
    servicesOpen.value = false
    return
  }
  if (!servicesOpen.value) return
  servicesCloseTimer = setTimeout(() => {
    animateDropdownOut(() => {
      servicesOpen.value = false
    })
  }, SERVICES_CLOSE_DELAY)
}

function toggleServices() {
  if (servicesOpen.value) closeServices({ immediate: true })
  else openServices()
}

function onDocumentClick(event) {
  if (!servicesDropdownRef.value?.contains(event.target)) closeServices({ immediate: true })
}

function onDocumentKeydown(event) {
  if (event.key === 'Escape') closeServices({ immediate: true })
}

document.addEventListener('click', onDocumentClick)
document.addEventListener('keydown', onDocumentKeydown)

onBeforeUnmount(() => {
  clearTimeout(servicesCloseTimer)
  dropdownTl?.kill()
  // Reverting the matchMedia context kills the ScrollTrigger it created and
  // runs the cleanup that removes the pointer listener.
  matchMedia?.revert()
  teardownSectionTracking()
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <header ref="header" class="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
    <nav
      class="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-brand-950/60 px-4 py-2.5 backdrop-blur-md sm:px-6"
    >
      <RouterLink to="/" class="flex items-center gap-2 font-heading text-base font-semibold tracking-wide text-white">
        <!-- The mark is painted by CSS through an alpha mask rather than
             shipped as a coloured image: logo-mark.png is the artwork's
             silhouette, and `bg-white` here is what actually colours it. The
             source art is solid black, which would have vanished against this
             near-black bar. Recolouring is a class change — `bg-brand-accent`
             for cyan — with no need to regenerate the file. -->
        <span class="brand-mark h-6 w-7 shrink-0 bg-white" aria-hidden="true"></span>
        VELTECH<span class="text-brand-accent">®</span>
      </RouterLink>

      <ul class="hidden items-center gap-8 md:flex">
        <li>
          <a
            :href="pageHref('#about')"
            class="text-sm transition-colors"
            :class="activeHref === '#about' ? 'text-white' : 'text-white/70 hover:text-white'"
          >
            About
          </a>
        </li>

        <li
          ref="servicesDropdown"
          class="relative"
          @mouseenter="openServices"
          @mouseleave="closeServices()"
        >
          <button
            type="button"
            class="flex items-center gap-1.5 text-sm transition-colors"
            :class="isServicesActive() ? 'text-white' : 'text-white/70 hover:text-white'"
            :aria-expanded="servicesOpen"
            aria-haspopup="true"
            @click="toggleServices"
          >
            Services
            <svg
              viewBox="0 0 10 6"
              class="h-2 w-2.5 fill-current transition-transform duration-200"
              :class="{ 'rotate-180': servicesOpen }"
              aria-hidden="true"
            >
              <path d="M0 0 L5 6 L10 0 Z" />
            </svg>
          </button>

          <div v-if="servicesOpen" class="absolute left-1/2 top-full w-[36rem] max-w-[90vw] -translate-x-1/2 pt-3">
            <div
              ref="servicesPanel"
              class="grid overflow-hidden rounded-3xl border border-white/10 bg-brand-950/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md sm:grid-cols-2"
            >
              <RouterLink
                v-for="(service, index) in services"
                :key="service.slug"
                :ref="(el) => setServiceItemRef(el, index)"
                :to="{ name: 'service', params: { slug: service.slug } }"
                class="group flex flex-col gap-3 border-b border-white/10 p-6 text-left transition-colors last:border-b-0 sm:border-b-0 sm:odd:border-r sm:[&:nth-child(-n+2)]:border-b"
                @click="closeServices({ immediate: true })"
              >
                <span class="text-lg text-brand-accent transition-transform group-hover:rotate-90">+</span>
                <span class="font-heading text-base font-medium text-white">{{ service.title }}</span>
                <span class="text-xs leading-relaxed text-slate-400">{{ service.summary }}</span>
              </RouterLink>
            </div>
          </div>
        </li>

        <!-- Pricing is a route of its own, not a home-page section, so it
             sits outside the hash-driven `links` list and highlights off
             the current path instead of the scroll position. -->
        <li>
          <RouterLink
            :to="{ name: 'pricing' }"
            class="text-sm transition-colors"
            :class="route.path === '/pricing' ? 'text-white' : 'text-white/70 hover:text-white'"
          >
            Pricing
          </RouterLink>
        </li>

        <li v-for="link in links.slice(1)" :key="link.hash">
          <a
            :href="pageHref(link.hash)"
            class="text-sm transition-colors"
            :class="activeHref === link.hash ? 'text-white' : 'text-white/70 hover:text-white'"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>

      <div class="flex items-center gap-2">
        <a
          :href="pageHref('#contact')"
          class="hidden rounded-full bg-white px-5 py-2 text-sm font-medium text-brand-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.25)] sm:inline-block"
        >
          Let's Talk
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
      <li>
        <a
          :href="pageHref('#about')"
          class="block py-2 text-sm transition-colors"
          :class="activeHref === '#about' ? 'text-white' : 'text-white/70 hover:text-white'"
          @click="isOpen = false"
        >
          About
        </a>
      </li>

      <li>
        <button
          type="button"
          class="flex w-full items-center justify-between py-2 text-sm transition-colors"
          :class="isServicesActive() ? 'text-white' : 'text-white/70 hover:text-white'"
          :aria-expanded="mobileServicesOpen"
          @click="mobileServicesOpen = !mobileServicesOpen"
        >
          Services
          <svg
            viewBox="0 0 10 6"
            class="h-2 w-2.5 fill-current transition-transform duration-200"
            :class="{ 'rotate-180': mobileServicesOpen }"
            aria-hidden="true"
          >
            <path d="M0 0 L5 6 L10 0 Z" />
          </svg>
        </button>
        <ul v-if="mobileServicesOpen" class="flex flex-col gap-1 border-l border-white/10 pl-4">
          <li v-for="service in services" :key="service.slug">
            <RouterLink
              :to="{ name: 'service', params: { slug: service.slug } }"
              class="block py-2 text-sm text-white/70 transition-colors hover:text-white"
              @click="isOpen = false"
            >
              {{ service.title }}
            </RouterLink>
          </li>
        </ul>
      </li>

      <li>
        <RouterLink
          :to="{ name: 'pricing' }"
          class="block py-2 text-sm transition-colors"
          :class="route.path === '/pricing' ? 'text-white' : 'text-white/70 hover:text-white'"
          @click="isOpen = false"
        >
          Pricing
        </RouterLink>
      </li>

      <li v-for="link in links.slice(1)" :key="link.hash">
        <a
          :href="pageHref(link.hash)"
          class="block py-2 text-sm transition-colors"
          :class="activeHref === link.hash ? 'text-white' : 'text-white/70 hover:text-white'"
          @click="isOpen = false"
        >
          {{ link.label }}
        </a>
      </li>
    </ul>
  </header>
</template>

<style scoped>
/* Written out here rather than as Tailwind arbitrary properties so the
   -webkit- prefix comes along: Safari still needs it for mask shorthand. */
.brand-mark {
  -webkit-mask: url('/logo-mark.png') center / contain no-repeat;
  mask: url('/logo-mark.png') center / contain no-repeat;
}

/* The service dropdown is animated with GSAP rather than a Vue Transition so
   the panel and its items can be choreographed: the container scales down from
   the top while the four service links fade, slide up, and lose a slight blur
   in a staggered sequence. Reduced-motion users get an instant show/hide. */
</style>
