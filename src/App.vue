<script setup>
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import ServicesSection from './components/ServicesSection.vue'
import StatsSection from './components/StatsSection.vue'
import WorkSection from './components/WorkSection.vue'
import ProcessSection from './components/ProcessSection.vue'
import TestimonialSection from './components/TestimonialSection.vue'
import ContactSection from './components/ContactSection.vue'
import { useLenis } from './composables/useLenis'
import { useSmoothAnchorScroll } from './composables/useSmoothAnchorScroll'

// Lenis must be initialized before the anchor-scroll and section reveal
// composables mount, since they either drive or read the scroll position
// it now owns.
useLenis()
useSmoothAnchorScroll()
</script>

<template>
  <NavBar />
  <main>
    <HeroSection />
    <AboutSection />
    <ServicesSection />
    <StatsSection />
    <WorkSection />
    <ProcessSection />
    <TestimonialSection />
    <ContactSection />
  </main>
</template>
