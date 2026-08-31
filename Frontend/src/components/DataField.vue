<template>
  <div
    ref="wrap"
    class="relative isolate aspect-square w-[min(47vw,42rem)] before:absolute before:inset-[13%] before:z-[-1] before:rounded-full before:border before:border-white/[0.08] before:content-[''] after:absolute after:inset-[21%] after:z-[-1] after:animate-spin after:rounded-full after:border after:border-dashed after:border-white/[0.08] after:[animation-direction:reverse] after:[animation-duration:34s] after:content-[''] after:motion-reduce:animate-none max-[900px]:w-[min(100%,35rem)]"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="absolute inset-0 size-full rounded-full [-webkit-mask-image:radial-gradient(circle,#000_44%,rgba(0,0,0,0.92)_60%,transparent_74%)] [mask-image:radial-gradient(circle,#000_44%,rgba(0,0,0,0.92)_60%,transparent_74%)]"
    />
    <div
      class="absolute top-1/2 left-1/2 grid size-[7.8rem] -translate-x-1/2 -translate-y-1/2 place-content-center rounded-full border border-white/25 bg-[rgba(6,6,6,0.72)] text-center shadow-[0_0_3rem_rgba(255,255,255,0.08),inset_0_0_1.5rem_rgba(255,255,255,0.03)] backdrop-blur-[12px]"
    >
      <span
        class="mb-[0.35rem] [font-family:var(--font-mono)] text-[0.55rem] tracking-[0.16em] text-[var(--white)] uppercase"
      >
        sinal
      </span>
      <strong
        class="[font-family:var(--font-display)] text-[clamp(1.8rem,3vw,2.5rem)] leading-none font-normal"
      >
        94,8
      </strong>
      <span
        class="[font-family:var(--font-mono)] text-[0.55rem] tracking-[0.16em] text-[var(--muted)] uppercase"
      >
        confiança
      </span>
    </div>
    <span
      class="absolute top-[18%] left-[8%] border border-white/15 bg-[rgba(5,5,5,0.7)] px-[0.62rem] py-[0.45rem] [font-family:var(--font-mono)] text-[0.56rem] tracking-[0.1em] text-white/62 whitespace-nowrap backdrop-blur-[8px]"
    >
      01 / ENTRADA
    </span>
    <span
      class="absolute top-[26%] right-[2%] border border-white/15 bg-[rgba(5,5,5,0.7)] px-[0.62rem] py-[0.45rem] [font-family:var(--font-mono)] text-[0.56rem] tracking-[0.1em] text-white/62 whitespace-nowrap backdrop-blur-[8px]"
    >
      PADRÃO DETECTADO
    </span>
    <span
      class="absolute right-[14%] bottom-[19%] border border-white/15 bg-[rgba(5,5,5,0.7)] px-[0.62rem] py-[0.45rem] [font-family:var(--font-mono)] text-[0.56rem] tracking-[0.1em] text-[var(--white)] whitespace-nowrap backdrop-blur-[8px]"
    >
      Δ +18,4%
    </span>
    <span
      class="absolute inset-[6%] z-[-1] animate-spin rounded-full border border-white/10 [animation-duration:18s] after:absolute after:top-1/2 after:left-[-2px] after:size-1 after:rounded-full after:bg-[var(--white)] after:shadow-[0_0_12px_var(--white)] after:content-[''] motion-reduce:animate-none"
    />
    <span
      class="absolute inset-[29%] z-[-1] animate-spin rounded-full border border-white/10 [animation-direction:reverse] [animation-duration:11s] after:absolute after:top-1/2 after:left-[-2px] after:size-1 after:rounded-full after:bg-[var(--white)] after:shadow-[0_0_12px_var(--white)] after:content-[''] motion-reduce:animate-none"
    />
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
