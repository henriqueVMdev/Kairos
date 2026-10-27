<script setup>
import { animate } from 'motion/mini'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'

const props = defineProps({
  sentence: { type: String, default: 'True Focus' },
  separator: { type: String, default: ' ' },
  manualMode: { type: Boolean, default: false },
  blurAmount: { type: Number, default: 5 },
  borderColor: { type: String, default: 'green' },
  glowColor: { type: String, default: 'rgba(0, 255, 0, 0.6)' },
  animationDuration: { type: Number, default: 0.5 },
  pauseBetweenAnimations: { type: Number, default: 1 },
})

const words = computed(() => props.sentence.split(props.separator))
const currentIndex = ref(0)
const lastActiveIndex = ref(null)
const container = ref(null)
const focusFrame = ref(null)
const wordElements = ref([])
const ready = ref(false)

let autoFocusTimer
let frameAnimation
let resizeObserver
let mounted = false

const componentStyle = computed(() => ({
  '--border-color': props.borderColor,
  '--glow-color': props.glowColor,
}))

const wordStyle = (index) => ({
  filter: `blur(${index === currentIndex.value ? 0 : props.blurAmount}px)`,
  transitionDuration: `${props.animationDuration}s`,
})

const setWordRef = (element, index) => {
  wordElements.value[index] = element
}

const positionFocusFrame = (shouldAnimate = true) => {
  const parent = container.value
  const frame = focusFrame.value
  const activeWord = wordElements.value[currentIndex.value]
  if (!parent || !frame || !activeWord) return

  const parentRect = parent.getBoundingClientRect()
  const activeRect = activeWord.getBoundingClientRect()
  const styles = {
    transform: `translate3d(${activeRect.left - parentRect.left}px, ${activeRect.top - parentRect.top}px, 0)`,
    width: `${activeRect.width}px`,
    height: `${activeRect.height}px`,
    opacity: 1,
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  frameAnimation?.stop()
  if (!shouldAnimate || reduceMotion) {
    Object.assign(frame.style, styles)
  } else {
    frameAnimation = animate(frame, styles, {
      duration: props.animationDuration,
      ease: 'easeOut',
    })
  }
  ready.value = true
}

const stopAutoFocus = () => {
  if (autoFocusTimer) window.clearInterval(autoFocusTimer)
  autoFocusTimer = undefined
}

const startAutoFocus = () => {
  stopAutoFocus()
  if (!mounted || props.manualMode || words.value.length < 2) return

  autoFocusTimer = window.setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % words.value.length
  }, (props.animationDuration + props.pauseBetweenAnimations) * 1000)
}

const activateWord = (index) => {
  if (!props.manualMode) return
  lastActiveIndex.value = index
  currentIndex.value = index
}

const retainLastWord = () => {
  if (props.manualMode && lastActiveIndex.value !== null) {
    currentIndex.value = lastActiveIndex.value
  }
}

const observeWords = () => {
  resizeObserver?.disconnect()
  if (!container.value) return

  resizeObserver = new ResizeObserver(() => positionFocusFrame(false))
  resizeObserver.observe(container.value)
  wordElements.value.forEach((element) => {
    if (element) resizeObserver.observe(element)
  })
}

watch(currentIndex, () => {
  nextTick(() => positionFocusFrame())
})

watch(
  () => [props.manualMode, props.animationDuration, props.pauseBetweenAnimations, words.value.length],
  startAutoFocus,
)

watch(words, () => {
  currentIndex.value = 0
  lastActiveIndex.value = null
  wordElements.value = []
  ready.value = false
  nextTick(() => {
    observeWords()
    positionFocusFrame(false)
    startAutoFocus()
  })
})

onMounted(() => {
  mounted = true
  nextTick(() => {
    observeWords()
    positionFocusFrame(false)
    startAutoFocus()
  })
  document.fonts?.ready.then(() => {
    if (mounted) positionFocusFrame(false)
  })
})

onBeforeUnmount(() => {
  mounted = false
  stopAutoFocus()
  frameAnimation?.stop()
  resizeObserver?.disconnect()
})
</script>

<template>
  <div
    ref="container"
    class="relative flex w-full items-center justify-evenly gap-[clamp(0.75rem,2vw,2rem)] outline-none select-none max-[640px]:justify-between max-[640px]:gap-2"
    :style="componentStyle"
    role="group"
    :aria-label="sentence.split(separator).join(' ')"
  >
    <template v-for="(word, index) in words" :key="`${word}-${index}`">
      <span
        :ref="(element) => setWordRef(element, index)"
        class="true-focus-word relative flex-none cursor-pointer text-[clamp(1.1rem,1.8vw,1.65rem)] leading-none font-medium tracking-[-0.03em] text-inherit whitespace-nowrap outline-none transition-[filter] [transition-timing-function:ease] focus-visible:[outline:1px_solid_rgba(255,255,255,0.45)] focus-visible:outline-offset-[0.65rem] max-[640px]:text-[clamp(0.62rem,2.6vw,0.82rem)] max-[640px]:tracking-[-0.02em]"
        :style="wordStyle(index)"
        tabindex="0"
        @mouseenter="activateWord(index)"
        @mouseleave="retainLastWord"
        @focus="activateWord(index)"
        @click="activateWord(index)"
      >
        {{ word }}
      </span>
      <i
        v-if="index < words.length - 1"
        class="size-[0.4rem] flex-none rounded-full border border-solid border-white/70 max-[640px]:hidden"
        aria-hidden="true"
      />
    </template>

    <div
      ref="focusFrame"
      class="pointer-events-none absolute top-0 left-0 box-border border-0 [will-change:width,height,transform] motion-reduce:hidden [@media(pointer:coarse)]:hidden"
      :class="ready ? 'opacity-100' : 'opacity-0'"
      aria-hidden="true"
    >
      <span
        class="absolute top-[-10px] left-[-10px] size-4 rounded-[3px] border-[3px] border-r-0 border-b-0 border-solid [border-color:var(--border-color)] [filter:drop-shadow(0_0_4px_var(--glow-color))] max-[640px]:top-[-6px] max-[640px]:left-[-6px] max-[640px]:size-[0.7rem] max-[640px]:border-2 max-[640px]:border-r-0 max-[640px]:border-b-0"
      />
      <span
        class="absolute top-[-10px] right-[-10px] size-4 rounded-[3px] border-[3px] border-b-0 border-l-0 border-solid [border-color:var(--border-color)] [filter:drop-shadow(0_0_4px_var(--glow-color))] max-[640px]:top-[-6px] max-[640px]:right-[-6px] max-[640px]:size-[0.7rem] max-[640px]:border-2 max-[640px]:border-b-0 max-[640px]:border-l-0"
      />
      <span
        class="absolute bottom-[-10px] left-[-10px] size-4 rounded-[3px] border-[3px] border-t-0 border-r-0 border-solid [border-color:var(--border-color)] [filter:drop-shadow(0_0_4px_var(--glow-color))] max-[640px]:bottom-[-6px] max-[640px]:left-[-6px] max-[640px]:size-[0.7rem] max-[640px]:border-2 max-[640px]:border-t-0 max-[640px]:border-r-0"
      />
      <span
        class="absolute right-[-10px] bottom-[-10px] size-4 rounded-[3px] border-[3px] border-t-0 border-l-0 border-solid [border-color:var(--border-color)] [filter:drop-shadow(0_0_4px_var(--glow-color))] max-[640px]:right-[-6px] max-[640px]:bottom-[-6px] max-[640px]:size-[0.7rem] max-[640px]:border-2 max-[640px]:border-t-0 max-[640px]:border-l-0"
      />
    </div>
  </div>
</template>

<style scoped>
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .true-focus-word {
    filter: none !important;
  }
}
</style>
