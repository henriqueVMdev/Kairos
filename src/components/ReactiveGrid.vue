<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  shape: { type: String, default: 'rounded' },
  fill: { type: String, default: 'solid' },
  strokeWidth: { type: Number, default: 1.5 },
  particleColor: { type: String, default: '#ffffff' },
  anomalyColor: { type: String, default: '#fec8c8' },
  backgroundColor: { type: String, default: '#000000' },
  maxSize: { type: Number, default: 36 },
  minSize: { type: Number, default: 12 },
  gap: { type: Number, default: 4 },
  influence: { type: Number, default: 300 },
})

const root = ref(null)
const canvas = ref(null)

let context
let animationFrame = 0
let resizeObserver
let intersectionObserver
let reducedMotionQuery
let pointer = null
let currentSizes = new Float32Array(0)
let width = 0
let height = 0
let pixelRatio = 1
let isVisible = false

const lerp = (start, end, amount) => start + (end - start) * amount
const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

function syncSize() {
  if (!root.value || !canvas.value || !context) return false

  const nextWidth = root.value.clientWidth
  const nextHeight = root.value.clientHeight
  const nextPixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
  if (nextWidth === width && nextHeight === height && nextPixelRatio === pixelRatio) return false

  width = nextWidth
  height = nextHeight
  pixelRatio = nextPixelRatio
  canvas.value.width = Math.round(width * pixelRatio)
  canvas.value.height = Math.round(height * pixelRatio)
  canvas.value.style.width = `${width}px`
  canvas.value.style.height = `${height}px`
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  currentSizes = new Float32Array(0)
  return true
}

function buildPath(centerX, centerY, size) {
  const half = size / 2
  context.beginPath()

  if (props.shape === 'circle') {
    context.arc(centerX, centerY, half, 0, Math.PI * 2)
    return
  }

  if (props.shape === 'rounded') {
    const radius = Math.min(half, size * 0.28)
    const x = centerX - half
    const y = centerY - half
    context.moveTo(x + radius, y)
    context.arcTo(x + size, y, x + size, y + size, radius)
    context.arcTo(x + size, y + size, x, y + size, radius)
    context.arcTo(x, y + size, x, y, radius)
    context.arcTo(x, y, x + size, y, radius)
    context.closePath()
    return
  }

  if (props.shape === 'triangle') {
    context.moveTo(centerX, centerY - half)
    context.lineTo(centerX + half, centerY + half)
    context.lineTo(centerX - half, centerY + half)
    context.closePath()
    return
  }

  if (props.shape === 'diamond') {
    context.moveTo(centerX, centerY - half)
    context.lineTo(centerX + half, centerY)
    context.lineTo(centerX, centerY + half)
    context.lineTo(centerX - half, centerY)
    context.closePath()
    return
  }

  if (props.shape === 'hexagon') {
    for (let index = 0; index < 6; index += 1) {
      const angle = ((-90 + 60 * index) * Math.PI) / 180
      const x = centerX + half * Math.cos(angle)
      const y = centerY + half * Math.sin(angle)
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath()
    return
  }

  if (props.shape === 'star') {
    const inner = half * 0.5
    for (let index = 0; index < 10; index += 1) {
      const radius = index % 2 === 0 ? half : inner
      const angle = ((-90 + 36 * index) * Math.PI) / 180
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    }
    context.closePath()
    return
  }

  context.rect(centerX - half, centerY - half, size, size)
}

function draw(timestamp = 0) {
  animationFrame = 0
  if (!context || !isVisible || document.hidden) return

  syncSize()
  context.clearRect(0, 0, width, height)
  context.fillStyle = props.backgroundColor
  context.fillRect(0, 0, width, height)

  const cell = Math.max(1, props.maxSize + props.gap)
  const columns = Math.max(1, Math.floor(width / cell))
  const rows = Math.max(1, Math.floor(height / cell))
  const offsetX = (width - columns * cell) / 2 + cell / 2
  const offsetY = (height - rows * cell) / 2 + cell / 2
  const count = columns * rows

  if (currentSizes.length !== count) {
    currentSizes = new Float32Array(count).fill(props.minSize)
  }

  context.fillStyle = props.particleColor
  context.strokeStyle = props.particleColor
  context.lineJoin = 'round'
  context.lineWidth = Math.max(0.5, props.strokeWidth)

  const radius = Math.max(1, props.influence)
  const reducedMotion = reducedMotionQuery?.matches ?? false
  const anomalyColumn = Math.min(columns - 1, Math.floor(columns * 0.72))
  const anomalyRow = Math.min(rows - 1, Math.floor(rows * 0.35))
  const pulse = reducedMotion
    ? 0
    : (Math.sin((timestamp / 2200) * Math.PI * 2 - Math.PI / 2) + 1) / 2
  const anomalyScale = 1 + pulse * 0.13
  const anomalyOpacity = 0.74 + pulse * 0.26
  let needsAnotherFrame = false

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const index = row * columns + column
      const centerX = offsetX + column * cell
      const centerY = offsetY + row * cell
      let influence = 0

      if (pointer) {
        const distanceX = pointer.x - centerX
        const distanceY = pointer.y - centerY
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)
        influence = clamp(1 - distance / radius, 0, 1)
      }

      const target = lerp(props.minSize, props.maxSize, influence)
      const current = reducedMotion ? target : lerp(currentSizes[index] || props.minSize, target, 0.2)
      if (Math.abs(current - target) > 0.05) needsAnotherFrame = true
      currentSizes[index] = current
      if (current <= 0.2) continue

      const isAnomaly = column === anomalyColumn && row === anomalyRow
      const color = isAnomaly ? props.anomalyColor : props.particleColor
      context.fillStyle = color
      context.strokeStyle = color
      context.globalAlpha = isAnomaly ? anomalyOpacity : 1
      buildPath(centerX, centerY, isAnomaly ? current * anomalyScale : current)
      if (props.fill === 'stroke') context.stroke()
      else context.fill()
    }
  }

  context.globalAlpha = 1
  if (needsAnotherFrame || !reducedMotion) animationFrame = requestAnimationFrame(draw)
}

function requestDraw() {
  if (!animationFrame && isVisible && !document.hidden) {
    animationFrame = requestAnimationFrame(draw)
  }
}

function onPointerMove(event) {
  const bounds = root.value.getBoundingClientRect()
  pointer = {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  }
  requestDraw()
}

function onPointerLeave() {
  pointer = null
  requestDraw()
}

function onVisibilityChange() {
  if (document.hidden) {
    cancelAnimationFrame(animationFrame)
    animationFrame = 0
  } else {
    requestDraw()
  }
}

onMounted(() => {
  context = canvas.value.getContext('2d')
  if (!context) return

  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotionQuery.addEventListener('change', requestDraw)
  resizeObserver = new ResizeObserver(() => {
    syncSize()
    requestDraw()
  })
  resizeObserver.observe(root.value)

  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting
      if (!isVisible) {
        cancelAnimationFrame(animationFrame)
        animationFrame = 0
      } else {
        requestDraw()
      }
    }, { rootMargin: '100px' })
    intersectionObserver.observe(root.value)
  } else {
    isVisible = true
  }

  root.value.addEventListener('pointermove', onPointerMove)
  root.value.addEventListener('pointerleave', onPointerLeave)
  document.addEventListener('visibilitychange', onVisibilityChange)
  syncSize()
  requestDraw()
})

watch(
  () => [
    props.shape,
    props.fill,
    props.strokeWidth,
    props.particleColor,
    props.anomalyColor,
    props.backgroundColor,
    props.maxSize,
    props.minSize,
    props.gap,
    props.influence,
  ],
  () => {
    currentSizes = new Float32Array(0)
    requestDraw()
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  reducedMotionQuery?.removeEventListener('change', requestDraw)
  root.value?.removeEventListener('pointermove', onPointerMove)
  root.value?.removeEventListener('pointerleave', onPointerLeave)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div ref="root" class="relative h-full w-full overflow-hidden bg-black" aria-hidden="true">
    <canvas ref="canvas" class="absolute inset-0 block h-full w-full" />
  </div>
</template>
