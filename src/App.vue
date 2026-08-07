<script setup>
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import ServicesSection from './components/ServicesSection.vue'
import ProcessSection from './components/ProcessSection.vue'
import ContactSection from './components/ContactSection.vue'
import { useSmoothAnchorScroll } from './composables/useSmoothAnchorScroll'

useSmoothAnchorScroll()
</script>

<template>
  <NavBar />
  <main>
    <HeroSection />
    <AboutSection />
    <ServicesSection />
    <ProcessSection />
    <ContactSection />
  </main>
</template>
