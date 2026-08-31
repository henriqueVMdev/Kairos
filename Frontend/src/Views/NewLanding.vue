<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import KairosMark from './components/KairosMark.vue'

const canvasHost = ref(null)
const loadingModel = ref(true)
const modelError = ref(false)

let animationFrameId = 0
let camera
let diceModel
let motionQuery
let renderer
let resizeObserver
let scene
let unmounted = false

const pointerTarget = { x: 0, y: 0 }

function disposeMaterial(material) {
  Object.values(material).forEach((value) => {
    if (value?.isTexture) value.dispose()
  })
  material.dispose()
}

function disposeObject(object) {
  object?.traverse((child) => {
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach(disposeMaterial)
    else if (child.material) disposeMaterial(child.material)
  })
}

function renderScene() {
  if (renderer && scene && camera) renderer.render(scene, camera)
}

function resizeCanvas() {
  const host = canvasHost.value
  if (!host || !renderer || !camera) return

  const width = Math.max(1, host.clientWidth)
  const height = Math.max(1, host.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, width < 640 ? 1.35 : 1.75))
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderScene()
}

function onPointerMove(event) {
  const bounds = canvasHost.value?.getBoundingClientRect()
  if (!bounds || !diceModel) return
  pointerTarget.y = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.34
  pointerTarget.x = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.2
}

function resetPointer() {
  pointerTarget.x = 0
  pointerTarget.y = 0
}

function animate() {
  if (unmounted || motionQuery?.matches) return
  animationFrameId = requestAnimationFrame(animate)

  if (diceModel) {
    diceModel.rotation.y += 0.003
    diceModel.rotation.x += (0.22 + pointerTarget.x - diceModel.rotation.x) * 0.035
    diceModel.rotation.z += (-0.12 + pointerTarget.y - diceModel.rotation.z) * 0.035
  }

  renderScene()
}

function syncMotionPreference(event) {
  cancelAnimationFrame(animationFrameId)
  animationFrameId = 0
  if (event.matches) renderScene()
  else animate()
}

onMounted(() => {
  const host = canvasHost.value
  if (!host) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  camera.position.set(0, 0, 5.2)

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
  } catch {
    loadingModel.value = false
    modelError.value = true
    return
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.setClearColor(0x050505, 0)
  renderer.domElement.setAttribute('aria-hidden', 'true')
  host.appendChild(renderer.domElement)

  scene.add(new THREE.HemisphereLight(0xffffff, 0x151515, 3.2))

  const keyLight = new THREE.DirectionalLight(0xffffff, 4.5)
  keyLight.position.set(4, 5, 6)
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight(0xb8c5ff, 2.2)
  rimLight.position.set(-4, -1, 3)
  scene.add(rimLight)

  new GLTFLoader().load(
    '/models/dice.glb',
    (gltf) => {
      if (unmounted) {
        disposeObject(gltf.scene)
        return
      }

      diceModel = gltf.scene
      const bounds = new THREE.Box3().setFromObject(diceModel)
      const size = bounds.getSize(new THREE.Vector3())
      const center = bounds.getCenter(new THREE.Vector3())
      const largestSide = Math.max(size.x, size.y, size.z) || 1
      const normalizedScale = 2.35 / largestSide

      diceModel.position.copy(center.multiplyScalar(-normalizedScale))
      diceModel.scale.setScalar(normalizedScale)
      diceModel.rotation.set(0.22, -0.35, -0.12)
      scene.add(diceModel)
      loadingModel.value = false
      renderScene()
    },
    undefined,
    () => {
      if (unmounted) return
      loadingModel.value = false
      modelError.value = true
    },
  )

  resizeCanvas()
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(resizeCanvas)
    resizeObserver.observe(host)
  } else {
    window.addEventListener('resize', resizeCanvas)
  }

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener('change', syncMotionPreference)
  if (!motionQuery.matches) animate()

  host.addEventListener('pointermove', onPointerMove)
  host.addEventListener('pointerleave', resetPointer)
})

onBeforeUnmount(() => {
  unmounted = true
  cancelAnimationFrame(animationFrameId)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', resizeCanvas)
  motionQuery?.removeEventListener('change', syncMotionPreference)
  canvasHost.value?.removeEventListener('pointermove', onPointerMove)
  canvasHost.value?.removeEventListener('pointerleave', resetPointer)
  disposeObject(diceModel)
  renderer?.dispose()
  renderer?.forceContextLoss()
  renderer?.domElement.remove()
})
</script>

<template>
  <main class="new-landing relative isolate min-h-dvh overflow-x-hidden bg-kairos-black text-kairos-white">
    <div class="new-landing__grid pointer-events-none absolute inset-0 z-[-2]" aria-hidden="true" />

    <header class="kairos-container relative z-10 flex min-h-[5.5rem] items-center justify-between gap-5 max-[640px]:min-h-[4.75rem]">
      <a class="inline-flex min-h-11 items-center" href="/" aria-label="Kairos — início">
        <KairosMark />
      </a>

      <nav class="flex items-center gap-2 max-[420px]:gap-1" aria-label="Navegação principal">
        <a
          class="inline-flex min-h-11 items-center px-3 font-mono text-[0.62rem] tracking-[0.06em] text-kairos-muted transition-colors hover:text-kairos-white max-[420px]:hidden"
          href="/original"
        >
          Landing original
        </a>
        <a
          class="inline-flex min-h-11 items-center justify-center rounded-full border border-white/24 px-5 text-[0.7rem] font-semibold transition-[background,color,border-color] hover:border-kairos-white hover:bg-kairos-white hover:text-kairos-black max-[420px]:px-4"
          href="/login"
        >
          Entrar
        </a>
      </nav>
    </header>

    <section
      class="kairos-container grid min-h-[calc(100dvh-5.5rem)] grid-cols-[minmax(0,1fr)_minmax(22rem,0.86fr)] items-center gap-[clamp(2rem,6vw,7rem)] pt-8 pb-[clamp(2rem,5vw,5rem)] max-[1024px]:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)] max-[900px]:min-h-[calc(100dvh-5.5rem)] max-[900px]:grid-cols-1 max-[900px]:content-center max-[900px]:gap-8 max-[900px]:pt-10 max-[640px]:min-h-[calc(100dvh-4.75rem)] max-[640px]:gap-4 max-[640px]:pt-5 max-[640px]:pb-[max(1.5rem,env(safe-area-inset-bottom))] [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:grid-cols-[minmax(0,1fr)_minmax(16rem,0.75fr)] [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:content-center [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:gap-8 [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:pt-4"
      aria-labelledby="new-landing-title"
    >
      <div class="relative z-2 max-w-[43rem] max-[900px]:max-w-[42rem]">
        <p class="mb-5 flex items-center gap-2.5 font-mono text-[0.62rem] tracking-[0.14em] text-kairos-muted max-[640px]:mb-4">
          <i class="size-1.5 rounded-full bg-kairos-white" aria-hidden="true" />
          NOVA LANDING / EXPERIMENTO 3D
        </p>
        <h1
          id="new-landing-title"
          class="m-0 text-[clamp(3.6rem,7.3vw,7.6rem)] leading-[0.88] font-medium tracking-[-0.065em] max-[1024px]:text-[clamp(3.7rem,7vw,5.8rem)] max-[900px]:max-w-[10ch] max-[900px]:text-[clamp(4rem,11vw,6.2rem)] max-[640px]:text-[clamp(3.1rem,15.5vw,4.8rem)] max-[420px]:text-[clamp(2.85rem,15vw,3.85rem)] [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:text-[clamp(2.5rem,7vw,3.8rem)]"
        >
          Sua nova ideia <em class="font-display font-normal tracking-[-0.04em] text-white/82">começa aqui.</em>
        </h1>
        <p class="mt-7 max-w-[36rem] text-[clamp(0.9rem,1.25vw,1.05rem)] leading-[1.7] text-kairos-muted max-[640px]:mt-5 max-[640px]:max-w-[34ch] max-[640px]:text-[0.86rem] max-[640px]:leading-[1.6] [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:mt-4 [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:line-clamp-2">
          Esta página pode ser alterada livremente. A versão anterior continua preservada enquanto uma nova direção ganha forma.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-3 max-[640px]:mt-6">
          <a
            class="inline-flex min-h-[3.25rem] items-center justify-between gap-8 rounded-full bg-kairos-white pr-4 pl-5 text-[0.72rem] font-semibold text-kairos-black transition-transform hover:-translate-y-0.5 max-[420px]:w-full"
            href="/login"
          >
            Acessar o Kairos
            <span aria-hidden="true">↗</span>
          </a>
          <a
            class="inline-flex min-h-[3.25rem] items-center px-5 text-[0.7rem] text-white/62 transition-colors hover:text-kairos-white max-[420px]:w-full max-[420px]:justify-center"
            href="/original"
          >
            Explorar versão anterior
          </a>
        </div>
      </div>

      <div
        class="dice-stage relative mx-auto h-[clamp(24rem,46vw,42rem)] w-full max-w-[42rem] overflow-hidden rounded-[1rem] border border-white/12 bg-white/[0.025] max-[900px]:h-[clamp(20rem,43vh,28rem)] max-[900px]:max-w-[40rem] max-[640px]:h-[clamp(17rem,39vh,21rem)] max-[640px]:rounded-[0.7rem] [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:h-[calc(100svh-7.5rem)] [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:min-h-[16rem]"
      >
        <div
          ref="canvasHost"
          class="dice-stage__canvas absolute inset-0"
          role="img"
          aria-label="Dado tridimensional do experimento visual Kairos"
        />

        <div
          v-if="loadingModel"
          class="pointer-events-none absolute inset-0 grid place-items-center font-mono text-[0.55rem] tracking-[0.12em] text-white/45"
          role="status"
        >
          CARREGANDO OBJETO 3D
        </div>
        <p
          v-else-if="modelError"
          class="absolute inset-0 grid place-items-center px-6 text-center font-mono text-[0.58rem] leading-relaxed tracking-[0.08em] text-kairos-muted"
          role="status"
        >
          VISUALIZAÇÃO 3D INDISPONÍVEL
        </p>

        <div class="pointer-events-none absolute inset-x-4 top-4 flex justify-between font-mono text-[0.5rem] tracking-[0.1em] text-white/38" aria-hidden="true">
          <span>OBJECT / 01</span>
          <span>REALTIME</span>
        </div>
        <div class="pointer-events-none absolute inset-x-4 bottom-4 flex justify-between border-t border-white/10 pt-3 font-mono text-[0.5rem] tracking-[0.08em] text-white/38" aria-hidden="true">
          <span>PROBABILITY FIELD</span>
          <span>6 FACES</span>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.new-landing__grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: clamp(3.5rem, 6vw, 5.5rem) clamp(3.5rem, 6vw, 5.5rem);
  mask-image: linear-gradient(to bottom, black, transparent 88%);
}

.dice-stage::before {
  position: absolute;
  inset: 16%;
  z-index: -1;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 50%;
  content: '';
  box-shadow: 0 0 7rem rgba(255, 255, 255, 0.05);
}

.dice-stage::after {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(circle at 50% 48%, transparent 24%, rgba(5, 5, 5, 0.28) 74%, rgba(5, 5, 5, 0.76) 100%);
  content: '';
}

.dice-stage__canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
}

@media (prefers-reduced-motion: reduce) {
  .new-landing a {
    transition: none;
  }
}
</style>
