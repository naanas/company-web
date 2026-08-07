<script setup>
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import MarqueeSection from './components/MarqueeSection.vue'
import AboutSection from './components/AboutSection.vue'
import StatsSection from './components/StatsSection.vue'
import WorkSection from './components/WorkSection.vue'
import ServicesSection from './components/ServicesSection.vue'
import ProcessSection from './components/ProcessSection.vue'
import TestimonialSection from './components/TestimonialSection.vue'
import ContactSection from './components/ContactSection.vue'
import { useSmoothAnchorScroll } from './composables/useSmoothAnchorScroll'

useSmoothAnchorScroll()
</script>

<template>
  <NavBar />
  <main>
    <HeroSection />
    <MarqueeSection />
    <AboutSection />
    <StatsSection />
    <WorkSection />
    <ServicesSection />
    <ProcessSection />
    <TestimonialSection />
    <ContactSection />
  </main>
</template>
