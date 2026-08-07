import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

createApp(App).mount('#app')

// The oversized display headings are sensitive to font metrics — when the
// Space Grotesk/Inter webfonts swap in after `document.fonts.ready`, text
// reflows and every ScrollTrigger's cached start/end positions go stale.
// Refreshing once fonts settle keeps scroll-driven sections (word reveals,
// the pinned services stage, etc.) aligned instead of firing early/late.
document.fonts?.ready.then(() => ScrollTrigger.refresh())
