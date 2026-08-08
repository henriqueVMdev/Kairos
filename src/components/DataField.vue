<template>
  <div ref="wrap" class="data-field" aria-hidden="true">
    <canvas ref="canvas" />
    <div class="data-field__core">
      <span class="data-field__core-label">sinal</span>
      <strong>94,8</strong>
      <span>confiança</span>
    </div>
    <span class="data-field__tag data-field__tag--one">01 / ENTRADA</span>
    <span class="data-field__tag data-field__tag--two">PADRÃO DETECTADO</span>
    <span class="data-field__tag data-field__tag--three">Δ +18,4%</span>
    <span class="data-field__orbit data-field__orbit--one" />
    <span class="data-field__orbit data-field__orbit--two" />
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref(null)
const wrap = ref(null)

let frame
let observer
let resizeObserver
let pointer = { x: 0, y: 0 }

const onPointerMove = (event) => {
  if (!wrap.value) return
  const rect = wrap.value.getBoundingClientRect()
  pointer.x = (event.clientX - rect.left) / rect.width - 0.5
  pointer.y = (event.clientY - rect.top) / rect.height - 0.5
}

const onPointerLeave = () => {
  pointer = { x: 0, y: 0 }
}

onMounted(() => {
  const element = canvas.value
  const container = wrap.value
  const context = element.getContext('2d')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let width = 0
  let height = 0
  let visible = true
  let start = performance.now()
  let nodes = []

  const createNodes = () => {
    const count = width < 520 ? 88 : 148
    nodes = Array.from({ length: count }, (_, index) => {
      const spiral = Math.sqrt((index + 1) / count)
      const angle = index * 2.399963 + (index % 5) * 0.035
      return {
        angle,
        radius: spiral,
        phase: Math.random() * Math.PI * 2,
        size: index % 17 === 0 ? 1.9 : Math.random() * 1.15 + 0.35,
        speed: 0.55 + Math.random() * 0.65,
      }
    })
  }

  const resize = () => {
    const rect = container.getBoundingClientRect()
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    width = rect.width
    height = rect.height
    element.width = Math.max(1, Math.floor(width * ratio))
    element.height = Math.max(1, Math.floor(height * ratio))
    element.style.width = `${width}px`
    element.style.height = `${height}px`
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    createNodes()
  }

  const draw = (now) => {
    if (!visible || !width || !height) {
      if (!reducedMotion) frame = requestAnimationFrame(draw)
      return
    }

    const elapsed = reducedMotion ? 0 : (now - start) / 1000
    const centerX = width / 2 + pointer.x * 14
    const centerY = height / 2 + pointer.y * 14
    const radius = Math.min(width, height) * 0.37
    context.clearRect(0, 0, width, height)

    const projected = nodes.map((node, index) => {
      const rotation = node.angle + elapsed * 0.055 * node.speed
      const r = node.radius * radius
      const wave = Math.sin(rotation * 3 + elapsed * 0.5 + node.phase) * radius * 0.07 * (1 - node.radius)
      const x = centerX + Math.cos(rotation) * r + wave + pointer.x * (1 - node.radius) * 24
      const y = centerY + Math.sin(rotation) * r * 0.72 + Math.sin(node.phase + elapsed * 0.25) * 4 + pointer.y * (1 - node.radius) * 18
      const depth = 0.35 + (Math.sin(rotation + node.phase) + 1) * 0.325
      return { x, y, depth, index, size: node.size }
    })

    context.lineWidth = 0.55
    for (let i = 0; i < projected.length; i += 1) {
      const a = projected[i]
      for (let j = i + 1; j < Math.min(projected.length, i + 9); j += 1) {
        const b = projected[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const threshold = radius * 0.235
        if (distance < threshold) {
          context.beginPath()
          context.strokeStyle = `rgba(255,255,255,${(1 - distance / threshold) * 0.12})`
          context.moveTo(a.x, a.y)
          context.lineTo(b.x, b.y)
          context.stroke()
        }
      }
    }

    projected.forEach((point) => {
      const pulse = point.index % 17 === 0 ? 1 + Math.sin(elapsed * 1.4 + point.index) * 0.28 : 1
      context.beginPath()
      context.fillStyle = `rgba(255,255,255,${0.25 + point.depth * 0.72})`
      context.arc(point.x, point.y, point.size * pulse, 0, Math.PI * 2)
      context.fill()

      if (point.index % 29 === 0) {
        context.beginPath()
        context.strokeStyle = 'rgba(255,255,255,0.18)'
        context.arc(point.x, point.y, 7 + pulse * 2, 0, Math.PI * 2)
        context.stroke()
      }
    })

    const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.55)
    glow.addColorStop(0, 'rgba(255,255,255,0.11)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = glow
    context.beginPath()
    context.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2)
    context.fill()

    if (!reducedMotion) frame = requestAnimationFrame(draw)
  }

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && reducedMotion) frame = requestAnimationFrame(draw)
  })
  observer.observe(container)
  container.addEventListener('pointermove', onPointerMove)
  container.addEventListener('pointerleave', onPointerLeave)
  resize()
  frame = requestAnimationFrame(draw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  observer?.disconnect()
  resizeObserver?.disconnect()
  wrap.value?.removeEventListener('pointermove', onPointerMove)
  wrap.value?.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<style scoped>
.data-field {
  position: relative;
  width: min(47vw, 42rem);
  aspect-ratio: 1;
  isolation: isolate;
}

canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  -webkit-mask-image: radial-gradient(circle, #000 44%, rgba(0, 0, 0, 0.92) 60%, transparent 74%);
  mask-image: radial-gradient(circle, #000 44%, rgba(0, 0, 0, 0.92) 60%, transparent 74%);
}

.data-field::before,
.data-field::after {
  content: '';
  position: absolute;
  inset: 13%;
  z-index: -1;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.data-field::after {
  inset: 21%;
  border-style: dashed;
  animation: rotate-field 34s linear infinite reverse;
}

.data-field__core {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  width: 7.8rem;
  height: 7.8rem;
  place-content: center;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: rgba(6, 6, 6, 0.72);
  box-shadow: 0 0 3rem rgba(255, 255, 255, 0.08), inset 0 0 1.5rem rgba(255, 255, 255, 0.03);
  text-align: center;
  transform: translate(-50%, -50%);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

.data-field__core strong {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 400;
  line-height: 1;
}

.data-field__core span {
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.data-field__core .data-field__core-label {
  margin-bottom: 0.35rem;
  color: var(--white);
}

.data-field__tag {
  position: absolute;
  padding: 0.45rem 0.62rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(5, 5, 5, 0.7);
  color: rgba(255, 255, 255, 0.62);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  white-space: nowrap;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.data-field__tag--one {
  top: 18%;
  left: 8%;
}

.data-field__tag--two {
  top: 26%;
  right: 2%;
}

.data-field__tag--three {
  right: 14%;
  bottom: 19%;
  color: var(--white);
}

.data-field__orbit {
  position: absolute;
  z-index: -1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: rotate-field 18s linear infinite;
}

.data-field__orbit::after {
  content: '';
  position: absolute;
  top: 50%;
  left: -2px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--white);
  box-shadow: 0 0 12px var(--white);
}

.data-field__orbit--one {
  inset: 6%;
}

.data-field__orbit--two {
  inset: 29%;
  animation-duration: 11s;
  animation-direction: reverse;
}

@keyframes rotate-field {
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .data-field {
    width: min(100%, 35rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  .data-field::after,
  .data-field__orbit {
    animation: none;
  }
}
</style>
