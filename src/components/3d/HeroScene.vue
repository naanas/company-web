<script setup>
/**
 * Interactive hero crystal — a faceted icosahedron with a wireframe shell,
 * idling with a slow auto-rotation and responding to drag to spin freely,
 * echoing the "hold to interact" hologram feel of the reference design
 * without needing a loaded .glb model.
 */
import { TresCanvas } from '@tresjs/core'
import { shallowRef, ref } from 'vue'

const meshRef = shallowRef()
const wireRef = shallowRef()
const groupRef = shallowRef()

const isDragging = ref(false)
let lastX = 0
let lastY = 0
let velocityX = 0.0025
let velocityY = 0.0012

function onPointerDown(e) {
  isDragging.value = true
  lastX = e.clientX
  lastY = e.clientY
}

function onPointerMove(e) {
  if (!isDragging.value || !groupRef.value) return
  const dx = e.clientX - lastX
  const dy = e.clientY - lastY
  velocityX = dx * 0.0006
  velocityY = dy * 0.0006
  lastX = e.clientX
  lastY = e.clientY
}

function onPointerUp() {
  isDragging.value = false
}

let elapsed = 0
function onBeforeRender({ delta }) {
  elapsed += delta

  if (groupRef.value) {
    groupRef.value.rotation.y += velocityX
    groupRef.value.rotation.x += velocityY
    // Decay drag velocity back toward the gentle idle spin
    velocityX += (0.0025 - velocityX) * 0.02
    velocityY += (0 - velocityY) * 0.04
    groupRef.value.position.y = Math.sin(elapsed * 0.6) * 0.12
  }
}
</script>

<template>
  <TresCanvas
    :alpha="true"
    clear-color="transparent"
    @before-render="onBeforeRender"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
  >
    <TresPerspectiveCamera :position="[0, 0, 5.5]" :look-at="[0, 0, 0]" />

    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[3, 3, 3]" :intensity="1" />
    <TresPointLight :position="[-3, -1.5, 2]" :intensity="1.4" color="#22d3ee" />
    <TresPointLight :position="[2, -2, -2]" :intensity="0.8" color="#3b82f6" />

    <TresGroup ref="groupRef">
      <TresMesh ref="meshRef">
        <TresIcosahedronGeometry :args="[1.5, 0]" />
        <TresMeshStandardMaterial color="#0c0d0f" :metalness="0.6" :roughness="0.25" flat-shading />
      </TresMesh>
      <TresMesh ref="wireRef" :scale="1.01">
        <TresIcosahedronGeometry :args="[1.5, 0]" />
        <TresMeshBasicMaterial color="#22d3ee" wireframe transparent :opacity="0.5" />
      </TresMesh>
    </TresGroup>
  </TresCanvas>
</template>
