<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  colors: {
    type: Array,
    default: () => ['rgba(255, 255, 255, 1)', 'rgba(16, 0, 0, 0.8)'],
  },
  gap: { type: Number, default: 6 },
  pixelSize: { type: Number, default: 2 },
  speed: { type: Number, default: 80 },
  appearFrom: { type: String, default: 'left' },
  duration: { type: Number, default: 0.5 },
})

const root = ref(null)
const canvas = ref(null)
const scanning = ref(false)

const SCAN_DURATION_MS = 7500
const SHIMMER_DELAY_MS = 5500
const SHIMMER_SETTLE_MS = 700
const NEXT_SCAN_DELAY_MS = 3000

let pixels = []
let animationFrame = 0
let cycleFrame = 0
let scanTimer = 0
let loopTimer = 0
let resizeObserver
let intersectionObserver
let reducedMotionQuery
let isVisible = false
let width = 0
let height = 0
let scanSequence = 0

const easeOut = cubicBezier(0, 0, 0.58, 1)

class Pixel {
  constructor(context, canvasWidth, canvasHeight, x, y, color, speed, delay, maxSize) {
    this.context = context
    this.canvasWidth = canvasWidth
    this.canvasHeight = canvasHeight
    this.x = x
    this.y = y
    this.color = color
    this.speed = randomBetween(0.1, 0.9) * speed
    this.size = 0
    this.minSize = 0.5 * (maxSize / 2)
    this.maxSizeInteger = maxSize
    this.maxSize = randomBetween(this.minSize, maxSize)
    this.delay = delay
    this.counter = 0
    this.counterStep = 1
    this.isIdle = false
    this.isReverse = false
    this.isShimmering = false
    this.growStart = null
    this.shrinkStart = null
    this.shrinkFrom = 0
    this.cycleStartSize = 0
    this.activatedAt = null
    this.scanSequence = -1
  }

  draw() {
    const offset = this.maxSizeInteger * 0.5 - this.size * 0.5
    this.context.fillStyle = this.color
    this.context.fillRect(this.x + offset, this.y + offset, this.size, this.size)
  }

  appear(now, durationMs) {
    this.isIdle = false
    this.shrinkStart = null

    if (this.counter <= this.delay) {
      this.counter += this.counterStep
      return
    }

    if (!this.isShimmering) {
      if (this.growStart === null) this.growStart = now
      const progress = durationMs > 0 ? Math.min(1, (now - this.growStart) / durationMs) : 1
      this.size = easeOut(progress) * this.maxSize
      if (progress >= 1) this.isShimmering = true
    }

    if (this.isShimmering) this.shimmer()
    this.draw()
  }

  disappear(now, durationMs) {
    this.isShimmering = false
    this.counter = 0
    this.growStart = null

    if (this.size <= 0) {
      this.isIdle = true
      this.shrinkStart = null
      return
    }

    if (this.shrinkStart === null) {
      this.shrinkStart = now
      this.shrinkFrom = this.size
    }

    const progress = durationMs > 0 ? Math.min(1, (now - this.shrinkStart) / durationMs) : 1
    this.size = this.shrinkFrom * (1 - easeOut(progress))
    if (progress >= 1) this.size = 0
    this.draw()
  }

  shimmer(intensity = 1) {
    if (this.size >= this.maxSize) this.isReverse = true
    else if (this.size <= this.minSize) this.isReverse = false
    this.size += (this.isReverse ? -this.speed : this.speed) * intensity
  }

  updateScan(now, scanStartedAt, activeScanSequence) {
    const passTime = scanStartedAt + this.delay
    this.isIdle = false

    if (this.scanSequence !== activeScanSequence && now >= passTime) {
      this.scanSequence = activeScanSequence
      this.activatedAt = passTime
      this.isReverse = false
    }

    const activeTime = this.activatedAt === null ? -1 : now - this.activatedAt

    if (activeTime >= 0 && activeTime < SHIMMER_DELAY_MS) {
      this.shimmer()
      this.draw()
      return
    }

    if (activeTime >= SHIMMER_DELAY_MS && activeTime < SHIMMER_DELAY_MS + SHIMMER_SETTLE_MS) {
      const progress = (activeTime - SHIMMER_DELAY_MS) / SHIMMER_SETTLE_MS
      this.shimmer(1 - easeOut(progress))
      this.size += (this.maxSize - this.size) * 0.12
      this.draw()
      return
    }

    this.size = this.maxSize
    this.isReverse = false
    this.draw()
  }

  reset() {
    this.size = this.maxSize
    this.counter = 0
    this.isIdle = false
    this.isReverse = false
    this.isShimmering = false
    this.growStart = null
    this.shrinkStart = null
    this.shrinkFrom = 0
    this.cycleStartSize = 0
    this.activatedAt = null
    this.scanSequence = -1
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const curveX = (time) => ((ax * time + bx) * time + cx) * time
  const curveXDerivative = (time) => (3 * ax * time + 2 * bx) * time + cx

  return (position) => {
    if (position <= 0) return 0
    if (position >= 1) return 1

    let time = position
    for (let index = 0; index < 8; index += 1) {
      const error = curveX(time) - position
      const derivative = curveXDerivative(time)
      if (Math.abs(error) < 0.00001 || derivative === 0) break
      time -= error / derivative
    }

    return ((ay * time + by) * time + cy) * time
  }
}

function getDelay(x, y) {
  if (props.appearFrom === 'bottom') return ((height - y) / height) * SCAN_DURATION_MS
  if (props.appearFrom === 'left') return (x / width) * SCAN_DURATION_MS
  if (props.appearFrom === 'right') return ((width - x) / width) * SCAN_DURATION_MS
  if (props.appearFrom === 'middle') {
    const offsetX = x - width / 2
    const offsetY = y - height / 2
    const maxDistance = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2)
    return (Math.sqrt(offsetX * offsetX + offsetY * offsetY) / maxDistance) * SCAN_DURATION_MS
  }
  return (y / height) * SCAN_DURATION_MS
}

function clearCanvas() {
  const context = canvas.value?.getContext('2d')
  if (!context) return
  context.clearRect(0, 0, width, height)
}

function initializePixels() {
  if (!root.value || !canvas.value) return

  const nextWidth = Math.floor(root.value.clientWidth)
  const nextHeight = Math.floor(root.value.clientHeight)
  if (!nextWidth || !nextHeight) return
  if (nextWidth === width && nextHeight === height && pixels.length) return

  width = nextWidth
  height = nextHeight
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const context = canvas.value.getContext('2d')
  canvas.value.width = Math.floor(width * pixelRatio)
  canvas.value.height = Math.floor(height * pixelRatio)
  canvas.value.style.width = `${width}px`
  canvas.value.style.height = `${height}px`
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

  const step = Math.max(1, Math.floor(props.gap))
  const maxSize = Math.max(0.1, props.pixelSize)
  const reducedMotion = reducedMotionQuery?.matches ?? false
  const effectiveSpeed = reducedMotion ? 0 : Math.max(0, Math.min(100, props.speed)) * 0.002
  const palette = props.colors.length ? props.colors : ['#ffffff']
  const nextPixels = []
  let colorIndex = 0

  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < height; y += step) {
      nextPixels.push(new Pixel(
        context,
        width,
        height,
        x,
        y,
        palette[colorIndex % palette.length],
        effectiveSpeed,
        reducedMotion ? 0 : getDelay(x, y),
        maxSize,
      ))
      colorIndex += 1
    }
  }

  pixels = nextPixels
  syncAnimation()
}

function drawStaticFrame() {
  clearCanvas()
  pixels.forEach((pixel) => {
    pixel.size = pixel.maxSize
    pixel.draw()
  })
}

function clearCycle() {
  cancelAnimationFrame(cycleFrame)
  clearTimeout(scanTimer)
  clearTimeout(loopTimer)
  cycleFrame = 0
  scanTimer = 0
  loopTimer = 0
  scanning.value = false
}

function resetPixels() {
  pixels.forEach((pixel) => pixel.reset())
  clearCanvas()
}

function runAnimation(method) {
  cancelAnimationFrame(animationFrame)
  const durationMs = Math.max(0, props.duration) * 1000
  let previousTime = performance.now()

  const frame = (now) => {
    animationFrame = requestAnimationFrame(frame)
    if (now - previousTime < 1000 / 60) return
    previousTime = now
    clearCanvas()

    let allIdle = true
    pixels.forEach((pixel) => {
      pixel[method](now, durationMs)
      if (!pixel.isIdle) allIdle = false
    })

    if (allIdle) {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }
  }

  animationFrame = requestAnimationFrame(frame)
}

function startScanCycle() {
  cancelAnimationFrame(animationFrame)
  clearTimeout(scanTimer)
  clearTimeout(loopTimer)
  animationFrame = 0
  scanning.value = true

  const cycleStart = performance.now()
  scanSequence += 1
  const activeScanSequence = scanSequence
  let previousTime = cycleStart

  scanTimer = window.setTimeout(() => {
    scanning.value = false
  }, SCAN_DURATION_MS)
  loopTimer = window.setTimeout(() => {
    if (isVisible && props.active && !document.hidden) startScanCycle()
  }, SCAN_DURATION_MS + NEXT_SCAN_DELAY_MS)

  const frame = (now) => {
    animationFrame = requestAnimationFrame(frame)
    if (now - previousTime < 1000 / 60) return
    previousTime = now
    clearCanvas()

    pixels.forEach((pixel) => {
      pixel.updateScan(now, cycleStart, activeScanSequence)
    })
  }

  animationFrame = requestAnimationFrame(frame)
}

function syncAnimation() {
  cancelAnimationFrame(animationFrame)
  animationFrame = 0
  clearCycle()

  if (!isVisible || document.hidden) return
  if (reducedMotionQuery?.matches) {
    if (props.active) drawStaticFrame()
    else clearCanvas()
    return
  }

  if (!props.active) {
    runAnimation('disappear')
    return
  }

  resetPixels()
  cycleFrame = requestAnimationFrame(() => {
    startScanCycle()
  })
}

function onVisibilityChange() {
  syncAnimation()
}

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotionQuery.addEventListener('change', syncAnimation)
  resizeObserver = new ResizeObserver(initializePixels)
  resizeObserver.observe(root.value)

  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      syncAnimation()
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    intersectionObserver.observe(root.value)
  } else {
    isVisible = true
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
  initializePixels()
})

watch(() => props.active, syncAnimation)
watch(
  () => [props.gap, props.pixelSize, props.speed, props.appearFrom, props.colors],
  () => {
    width = 0
    height = 0
    initializePixels()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  clearCycle()
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  reducedMotionQuery?.removeEventListener('change', syncAnimation)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div
    ref="root"
    class="relative isolate h-full min-h-20 w-full min-w-20 overflow-hidden bg-black"
    aria-hidden="true"
  >
    <canvas ref="canvas" class="block h-full w-full" />
    <span
      v-if="scanning"
      class="pixel-card__scan pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(to_right,transparent_84%,rgba(255,255,255,0.025)_96%,rgba(255,255,255,0.12)_100%)] after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-[rgba(255,255,255,0.95)] after:content-[''] after:shadow-[0.35rem_0_1.15rem_rgba(255,255,255,0.48)]"
      :style="{ '--scan-duration': `${SCAN_DURATION_MS}ms` }"
    />
  </div>
</template>

<style scoped>
.pixel-card__scan {
  animation: pixel-card-scan var(--scan-duration) linear both;
}

@keyframes pixel-card-scan {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
</style>
