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
    class="true-focus"
    :class="{ 'true-focus--ready': ready }"
    :style="componentStyle"
    role="group"
    :aria-label="sentence.split(separator).join(' ')"
  >
    <template v-for="(word, index) in words" :key="`${word}-${index}`">
      <span
        :ref="(element) => setWordRef(element, index)"
        class="true-focus__word"
        :class="{ 'true-focus__word--active': index === currentIndex }"
        :style="wordStyle(index)"
        tabindex="0"
        @mouseenter="activateWord(index)"
        @mouseleave="retainLastWord"
        @focus="activateWord(index)"
        @click="activateWord(index)"
      >
        {{ word }}
      </span>
      <i v-if="index < words.length - 1" class="true-focus__separator" aria-hidden="true" />
    </template>

    <div ref="focusFrame" class="true-focus__frame" aria-hidden="true">
      <span class="true-focus__corner true-focus__corner--top-left" />
      <span class="true-focus__corner true-focus__corner--top-right" />
      <span class="true-focus__corner true-focus__corner--bottom-left" />
      <span class="true-focus__corner true-focus__corner--bottom-right" />
    </div>
  </div>
</template>

<style scoped>
.true-focus {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  gap: clamp(0.75rem, 2vw, 2rem);
  width: 100%;
  outline: none;
  user-select: none;
}

.true-focus__word {
  position: relative;
  flex: 0 0 auto;
  color: inherit;
  font-size: clamp(1.1rem, 1.8vw, 1.65rem);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  transition-property: filter;
  transition-timing-function: ease;
}

.true-focus__word:focus-visible {
  outline: 1px solid rgba(255, 255, 255, 0.45);
  outline-offset: 0.65rem;
}

.true-focus__separator {
  flex: 0 0 auto;
  width: 0.4rem;
  height: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
}

.true-focus__frame {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
  border: 0;
  opacity: 0;
  pointer-events: none;
  will-change: width, height, transform;
}

.true-focus--ready .true-focus__frame {
  opacity: 1;
}

.true-focus__corner {
  position: absolute;
  width: 1rem;
  height: 1rem;
  border: 3px solid var(--border-color);
  border-radius: 3px;
  filter: drop-shadow(0 0 4px var(--glow-color));
}

.true-focus__corner--top-left {
  top: -10px;
  left: -10px;
  border-right: 0;
  border-bottom: 0;
}

.true-focus__corner--top-right {
  top: -10px;
  right: -10px;
  border-bottom: 0;
  border-left: 0;
}

.true-focus__corner--bottom-left {
  bottom: -10px;
  left: -10px;
  border-top: 0;
  border-right: 0;
}

.true-focus__corner--bottom-right {
  right: -10px;
  bottom: -10px;
  border-top: 0;
  border-left: 0;
}

@media (max-width: 640px) {
  .true-focus {
    justify-content: space-between;
    gap: 0.5rem;
  }

  .true-focus__word {
    font-size: clamp(0.62rem, 2.6vw, 0.82rem);
    letter-spacing: -0.02em;
  }

  .true-focus__separator {
    display: none;
  }

  .true-focus__corner {
    width: 0.7rem;
    height: 0.7rem;
    border-width: 2px;
  }

  .true-focus__corner--top-left { top: -6px; left: -6px; }
  .true-focus__corner--top-right { top: -6px; right: -6px; }
  .true-focus__corner--bottom-left { bottom: -6px; left: -6px; }
  .true-focus__corner--bottom-right { right: -6px; bottom: -6px; }
}

@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  .true-focus__word {
    filter: none !important;
  }

  .true-focus__frame {
    display: none;
  }
}
</style>
