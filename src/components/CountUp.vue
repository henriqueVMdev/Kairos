<template>
  <span ref="root">{{ display }}{{ suffix }}</span>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  decimals: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
})

const root = ref(null)
const formatValue = (value) => new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: props.decimals,
  maximumFractionDigits: props.decimals,
}).format(value)
const display = ref(formatValue(0))
let observer
let frame

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!('IntersectionObserver' in window)) {
    display.value = formatValue(props.value)
    return
  }
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return
    observer.disconnect()
    if (reducedMotion) {
      display.value = formatValue(props.value)
      return
    }
    const start = performance.now()
    const duration = 1300
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      display.value = formatValue(props.value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
  }, { threshold: 0.7 })
  observer.observe(root.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  cancelAnimationFrame(frame)
})
</script>
