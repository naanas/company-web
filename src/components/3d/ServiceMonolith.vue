<script setup>
/**
 * A real scanned rock bearing the VELTECH mark — stands in for the reference
 * site's carved-stone services centerpiece. The mesh is Poly Haven's
 * "Moon Rock 01" (CC0, see public/models/veltech-rock/README.txt), loaded
 * once via top-level await so the <Suspense> boundary in ServicesSection
 * waits for it. The wordmark is a canvas-drawn texture on a plane parented
 * to the same rotating group so it reads as branding etched into one facet.
 *
 * `stage` (0-4) is bumped by the parent as each service card is revealed
 * on scroll — every change plays a small scale/rotation "impact" so the
 * rock visibly reacts to the reveal instead of spinning inertly.
 */
import { TresCanvas } from '@tresjs/core'
import { shallowRef, watch } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { gsap } from 'gsap'

const props = defineProps({
  stage: { type: Number, default: 0 },
})

const groupRef = shallowRef()

// The dev server's conditional-cache revalidation for the large binary
// buffer intermittently comes back as an empty 204 instead of a real 200/304
// (seen consistently for the .bin, never for the small .gltf/.jpg files) —
// a URL modifier makes every request Three.js issues for this model
// cache-bust, sidestepping that revalidation path entirely.
const manager = new THREE.LoadingManager()
manager.setURLModifier((url) => (url.includes('/models/veltech-rock/') ? `${url}?v=1` : url))

// The source .gltf bundles 4 LODs as sibling nodes (all in the default
// scene) — grab only the highest-detail one (~10k tris) so we're not
// silently rendering all four stacked on top of each other.
const gltf = await new GLTFLoader(manager).loadAsync('/models/veltech-rock/veltech-rock.gltf')
let rockMesh = null
gltf.scene.traverse((obj) => {
  if (obj.isMesh && obj.name.includes('LOD0')) rockMesh = obj
})
if (!rockMesh) gltf.scene.traverse((obj) => { if (obj.isMesh && !rockMesh) rockMesh = obj })

// Poly Haven exports at real-world scale (this rock is ~20cm across) —
// normalize to a fixed radius so it fills the same frame as the old
// procedural placeholder regardless of the source model's native units.
const box = new THREE.Box3().setFromObject(rockMesh)
const center = box.getCenter(new THREE.Vector3())
const radius = box.getSize(new THREE.Vector3()).length() / 2
rockMesh.geometry = rockMesh.geometry.clone()
rockMesh.geometry.translate(-center.x, -center.y, -center.z)
// The source model is a long, low log-like shape (X is its longest axis) —
// stand it up on end so it reads as a monolith rather than lying flat.
rockMesh.geometry.rotateZ(Math.PI / 2)

const targetRadius = 1.7
rockMesh.scale.setScalar(targetRadius / radius)

if (rockMesh.material) {
  rockMesh.material.roughness = 0.92
  rockMesh.material.metalness = 0.08
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
  const geometry = new THREE.PlaneGeometry(2.4, 1.2)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(0, 0.1, targetRadius * 0.98)
  return mesh
}

const markObject = buildWordmark()

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
  <TresCanvas :alpha="true" @before-render="onBeforeRender">
    <TresPerspectiveCamera :position="[0, 0, 6]" :look-at="[0, 0, 0]" />

    <TresAmbientLight :intensity="0.7" />
    <TresDirectionalLight :position="[3, 4, 3]" :intensity="2.6" />
    <TresDirectionalLight :position="[-2, 1, -3]" :intensity="0.6" color="#8fb8ff" />
    <TresPointLight :position="[-3, -1, 2]" :intensity="3" color="#22d3ee" />
    <TresPointLight :position="[2, -2, -3]" :intensity="1.4" color="#3b82f6" />

    <TresGroup ref="groupRef">
      <primitive :object="rockMesh" />
      <primitive :object="markObject" />
    </TresGroup>
  </TresCanvas>
</template>
