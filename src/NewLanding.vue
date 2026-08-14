<script setup>
import KairosMark from './components/KairosMark.vue'
</script>

<template>
  <main class="min-h-screen bg-kairos-black text-kairos-white">
    <div class="kairos-container flex min-h-screen flex-col py-8">
      <header class="flex items-center justify-between">
        <KairosMark />

        <a
          class="font-mono text-xs tracking-wider text-kairos-muted transition-colors hover:text-kairos-white"
          href="/original"
        >
          Ver landing original
        </a>
      </header>

      <section class="flex flex-1 items-center justify-center py-20 text-center">
        <div class="max-w-2xl">
          <p class="mb-5 font-mono text-xs tracking-[.18em] text-kairos-muted">
            NOVA LANDING / ÁREA DE TESTES
          </p>
          <h1 class="text-[clamp(2.8rem,8vw,6.5rem)] leading-[.95] font-medium tracking-[-.055em]">
            Sua nova ideia começa aqui.
          </h1>
          <p class="mx-auto mt-7 max-w-lg text-base leading-relaxed text-kairos-muted">
            Esta página pode ser alterada livremente. A versão anterior continua preservada.
          </p>
        </div>
      </section>
    </div>
  </main>
</template>
