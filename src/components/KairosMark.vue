<template>
  <span class="brand" :class="{ 'brand--compact': compact }" aria-label="Kairos">
    <svg class="brand__mark" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="15.5" fill="none" stroke="currentColor" />
      <path d="M9 24V10M9 18.5L23 10M14 16L24.5 24" fill="none" stroke="currentColor" stroke-linecap="round" />
      <circle cx="23" cy="10" r="2.4" fill="currentColor" />
    </svg>
    <span v-if="!compact" class="brand__name">KAIROS</span>
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

<style scoped>
.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.72rem;
  color: inherit;
}

.brand__mark {
  width: 2rem;
  height: 2rem;
}

.brand__name {
  font-family: var(--font-sans);
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.24em;
}

.brand--compact .brand__mark {
  width: 1.65rem;
  height: 1.65rem;
}
</style>
