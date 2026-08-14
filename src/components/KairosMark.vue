<template>
  <span class="inline-flex items-center gap-[0.72rem] text-inherit" aria-label="Kairos">
    <svg
      :class="compact ? 'size-[1.65rem]' : 'size-8'"
      viewBox="0 0 34 34"
      aria-hidden="true"
    >
      <circle cx="17" cy="17" r="15.5" fill="none" stroke="currentColor" />
      <path d="M9 24V10M9 18.5L23 10M14 16L24.5 24" fill="none" stroke="currentColor" stroke-linecap="round" />
      <circle cx="23" cy="10" r="2.4" fill="currentColor" />
    </svg>
    <span
      v-if="!compact"
      class="[font-family:var(--font-sans)] text-[0.86rem] font-bold tracking-[0.24em]"
    >
      KAIROS
    </span>
  </span>
</template>

<script setup>
defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>
