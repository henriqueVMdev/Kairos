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
const SHIMMER_HOLD_MS = 6000
const PIXEL_FADE_MS = 260
const NEXT_SCAN_DELAY_MS = 6500

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

  shimmer() {
    if (this.size >= this.maxSize) this.isReverse = true
    else if (this.size <= this.minSize) this.isReverse = false
    this.size += this.isReverse ? -this.speed : this.speed
  }

  cycle(elapsed, growDuration, holdDuration, fadeDuration) {
    const localTime = elapsed - this.delay
    this.isIdle = false

    if (localTime < 0) return

    if (localTime < growDuration) {
      const progress = growDuration > 0 ? localTime / growDuration : 1
      this.size = easeOut(progress) * this.maxSize
      this.draw()
      return
    }

    if (localTime < growDuration + holdDuration) {
      this.shimmer()
      this.draw()
      return
    }

    if (localTime < growDuration + holdDuration + fadeDuration) {
      if (this.shrinkStart === null) {
        this.shrinkStart = elapsed
        this.shrinkFrom = this.size
      }
      const progress = Math.min(1, (elapsed - this.shrinkStart) / fadeDuration)
      this.size = this.shrinkFrom * (1 - easeOut(progress))
      this.draw()
      return
    }

    this.size = 0
    this.isIdle = true
  }

  reset() {
    this.size = 0
    this.counter = 0
    this.isIdle = false
    this.isReverse = false
    this.isShimmering = false
    this.growStart = null
    this.shrinkStart = null
    this.shrinkFrom = 0
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
  resetPixels()
  scanning.value = true

  const cycleStart = performance.now()
  const growDuration = Math.max(0, props.duration) * 1000
  const cycleDuration = SCAN_DURATION_MS + growDuration + SHIMMER_HOLD_MS + PIXEL_FADE_MS
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

    let allIdle = true
    const elapsed = now - cycleStart
    pixels.forEach((pixel) => {
      pixel.cycle(elapsed, growDuration, SHIMMER_HOLD_MS, PIXEL_FADE_MS)
      if (!pixel.isIdle) allIdle = false
    })

    if (elapsed >= cycleDuration && allIdle) {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }
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
  <div ref="root" class="pixel-card" aria-hidden="true">
    <canvas ref="canvas" />
    <span
      v-if="scanning"
      class="pixel-card__scan"
      :style="{ '--scan-duration': `${SCAN_DURATION_MS}ms` }"
    />
  </div>
</template>

<style scoped>
.pixel-card,
.pixel-card canvas {
  width: 100%;
  height: 100%;
}

.pixel-card {
  position: relative;
  min-width: 5rem;
  min-height: 5rem;
  overflow: hidden;
  background: #000;
  isolation: isolate;
}

.pixel-card canvas {
  display: block;
}

.pixel-card__scan {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    to right,
    transparent 84%,
    rgba(255, 255, 255, 0.025) 96%,
    rgba(255, 255, 255, 0.12) 100%
  );
  transform: translateX(-100%);
  animation: pixel-card-scan var(--scan-duration) linear both;
}

.pixel-card__scan::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0.35rem 0 1.15rem rgba(255, 255, 255, 0.48);
}

@keyframes pixel-card-scan {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
</style>
