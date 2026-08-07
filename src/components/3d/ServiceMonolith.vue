<script setup>
/**
 * A faceted "rock" bearing the VELTECH mark — stands in for the reference
 * site's carved-stone services centerpiece. The rock is a low-poly
 * icosahedron with per-vertex noise displacement (built once as a raw
 * Three.js mesh, then dropped into the TresJS scene via <primitive>), and
 * the wordmark is a canvas-drawn texture on a plane parented to the same
 * rotating group so it reads as branding etched into one facet.
 *
 * `stage` (0-4) is bumped by the parent as each service card is revealed
 * on scroll — every change plays a small scale/rotation "impact" so the
 * rock visibly reacts to the reveal instead of spinning inertly.
 */
import { TresCanvas } from '@tresjs/core'
import { shallowRef, watch, onMounted } from 'vue'
import * as THREE from 'three'
import { gsap } from 'gsap'

const props = defineProps({
  stage: { type: Number, default: 0 },
})

const groupRef = shallowRef()
const rockObject = shallowRef(null)
const markObject = shallowRef(null)

function buildRock() {
  const geometry = new THREE.IcosahedronGeometry(1.6, 2).toNonIndexed()
  const position = geometry.attributes.position
  const v = new THREE.Vector3()

  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i)
    const n =
      Math.sin(v.x * 2.1 + v.y * 1.3) * 0.12 +
      Math.sin(v.y * 3.4 + v.z * 2.2) * 0.09 +
      Math.sin(v.z * 1.7 + v.x * 2.6) * 0.07
    v.multiplyScalar(1 + n)
    position.setXYZ(i, v.x, v.y, v.z)
  }
  geometry.computeVertexNormals()

  const material = new THREE.MeshStandardMaterial({
    color: '#1a1b1e',
    roughness: 0.85,
    metalness: 0.15,
    flatShading: true,
  })

  return new THREE.Mesh(geometry, material)
}

function buildWordmark() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  ctx.fillStyle = 'rgba(34, 211, 238, 0.95)'
  ctx.font = '700 84px "Space Grotesk", sans-serif'
  ctx.fillText('VELTECH', canvas.width / 2, canvas.height / 2 - 10)

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.font = '400 22px sans-serif'
  ctx.letterSpacing = '4px'
  ctx.fillText('IT CONSULTING · SOFTWARE HOUSE', canvas.width / 2, canvas.height / 2 + 48)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true

  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
  const geometry = new THREE.PlaneGeometry(2.6, 1.3)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0, 1.68)
  return mesh
}

onMounted(() => {
  rockObject.value = buildRock()
  markObject.value = buildWordmark()
})

watch(
  () => props.stage,
  () => {
    if (!groupRef.value) return
    gsap.fromTo(
      groupRef.value.scale,
      { x: 1.12, y: 1.12, z: 1.12 },
      { x: 1, y: 1, z: 1, duration: 0.7, ease: 'elastic.out(1, 0.5)' }
    )
    gsap.to(groupRef.value.rotation, { y: `+=0.6`, duration: 0.9, ease: 'power3.out' })
  }
)

let elapsed = 0
function onBeforeRender({ delta }) {
  elapsed += delta
  if (groupRef.value) {
    groupRef.value.position.y = Math.sin(elapsed * 0.5) * 0.15
    groupRef.value.rotation.x = Math.sin(elapsed * 0.3) * 0.08
  }
}
</script>

<template>
  <TresCanvas :alpha="true" clear-color="transparent" @before-render="onBeforeRender">
    <TresPerspectiveCamera :position="[0, 0, 6]" :look-at="[0, 0, 0]" />

    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[3, 4, 3]" :intensity="1.1" />
    <TresPointLight :position="[-3, -1, 2]" :intensity="1.6" color="#22d3ee" />
    <TresPointLight :position="[2, -2, -3]" :intensity="0.7" color="#3b82f6" />

    <TresGroup ref="groupRef">
      <primitive v-if="rockObject" :object="rockObject" />
      <primitive v-if="markObject" :object="markObject" />
    </TresGroup>
  </TresCanvas>
</template>
