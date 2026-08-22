<script setup>
import NavBar from './components/NavBar.vue'
import { useLenis } from './composables/useLenis'
import { useSmoothAnchorScroll } from './composables/useSmoothAnchorScroll'

// Lenis must be initialized before the anchor-scroll and section reveal
// composables mount, since they either drive or read the scroll position
// it now owns. Kept here (above <router-view>) rather than per-view so the
// one shared Lenis instance survives route changes between the home page
// and a service detail page.
useLenis()
useSmoothAnchorScroll()
</script>

<template>
  <NavBar />
  <!-- Keyed on the full path: navigating between two /services/:slug pages
       (or back to home) should remount rather than patch in place, so each
       view's ScrollTrigger/pin setup (TelescopeHero, useScrollReveal) always
       starts from a clean DOM instead of reusing stale trigger positions
       from whatever page was there before. -->
  <router-view :key="$route.fullPath" />
</template>
