<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import ArrowIcon from './components/ArrowIcon.vue'
import GridScan from './components/GridScan.vue'
import KairosMark from './components/KairosMark.vue'
import PixelCard from './components/PixelCard.vue'
import ProductPrototype from './components/ProductPrototype.vue'
import ReactiveGrid from './components/ReactiveGrid.vue'
import TrueFocus from './components/TrueFocus.vue'
import WebThreads from './components/WebThreads.vue'

const app = ref(null)
const menuToggle = ref(null)
const mobileMenu = ref(null)
const menuOpen = ref(false)
const scrolled = ref(false)
const progress = ref(0)
const scenario = ref(18)
const currentYear = new Date().getFullYear()

const impact = computed(() => Math.round(72 + scenario.value * 1.35))
const confidence = computed(() => Math.max(72, Math.round(97 - scenario.value * 0.32)))
const risk = computed(() => {
  if (scenario.value < 12) return { label: 'Baixo', code: '01' }
  if (scenario.value < 30) return { label: 'Moderado', code: '02' }
  return { label: 'Elevado', code: '03' }
})
const recommendation = computed(() => {
  if (scenario.value < 12) return 'Manter o plano atual e monitorar os próximos ciclos.'
  if (scenario.value < 30) return 'Antecipar capacidade nas regiões com maior aceleração.'
  return 'Redistribuir recursos agora e ativar o plano de contingência.'
})
const scenarioAnnouncement = computed(() =>
  `Com aumento de demanda de ${scenario.value} por cento: índice de pressão ${impact.value}, risco ${risk.value.label.toLowerCase()} e coerência do cenário ${confidence.value} por cento. ${recommendation.value}`,
)
const chartBars = computed(() => [
  24,
  31,
  27,
  40,
  45,
  38 + scenario.value * 0.4,
  46 + scenario.value * 0.55,
  50 + scenario.value * 0.75,
  54 + scenario.value,
])

let revealObserver
let raf = 0
let scrollRaf = 0
let desktopMedia

const closeMenu = (returnFocus = false) => {
  menuOpen.value = false
  document.body.classList.remove('menu-is-open')
  if (returnFocus) nextTick(() => menuToggle.value?.focus())
}

const toggleMenu = async () => {
  menuOpen.value = !menuOpen.value
  document.body.classList.toggle('menu-is-open', menuOpen.value)
  if (menuOpen.value) {
    await nextTick()
    document.querySelector('.mobile-menu a')?.focus()
  }
}

const onKeydown = (event) => {
  if (!menuOpen.value) return
  if (event.key === 'Escape') {
    closeMenu(true)
    return
  }
  if (event.key !== 'Tab') return

  const focusable = [...mobileMenu.value.querySelectorAll('a[href], button:not([disabled])')]
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

const onScroll = () => {
  if (scrollRaf) return
  scrollRaf = requestAnimationFrame(() => {
    scrolled.value = window.scrollY > 24
    const scrollable = document.documentElement.scrollHeight - window.innerHeight
    progress.value = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0
    scrollRaf = 0
  })
}

const onBreakpointChange = (event) => {
  if (event.matches && menuOpen.value) closeMenu()
}

const onPointerMove = (event) => {
  if (!window.matchMedia('(pointer: fine)').matches || !app.value) return
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    app.value.style.setProperty('--pointer-x', `${event.clientX}px`)
    app.value.style.setProperty('--pointer-y', `${event.clientY}px`)
  })
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const revealItems = document.querySelectorAll('[data-reveal]')

  if (!('IntersectionObserver' in window) || reducedMotion) {
    revealItems.forEach((item) => item.classList.add('is-visible'))
  } else {
    document.documentElement.classList.add('js')
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        revealObserver.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    revealItems.forEach((item) => revealObserver.observe(item))
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('keydown', onKeydown)
  desktopMedia = window.matchMedia('(min-width: 901px)')
  desktopMedia.addEventListener('change', onBreakpointChange)
  onScroll()
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  cancelAnimationFrame(raf)
  cancelAnimationFrame(scrollRaf)
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('keydown', onKeydown)
  desktopMedia?.removeEventListener('change', onBreakpointChange)
  document.body.classList.remove('menu-is-open')
})
</script>

<template>
  <div ref="app" class="app-shell relative min-h-screen overflow-clip bg-kairos-black">
    <a
      class="fixed top-3 left-3 z-[1000] -translate-y-[160%] bg-kairos-white px-4 py-3 font-mono text-xs text-kairos-black transition-transform duration-200 focus:translate-y-0"
      href="#conteudo"
    >Pular para o conteúdo</a>
    <div
      class="fixed top-0 left-0 z-[150] h-0.5 w-full origin-left bg-kairos-white will-change-transform"
      :style="{ transform: `scaleX(${progress / 100})` }"
    />

    <header
      class="fixed inset-x-0 top-0 z-100 w-full text-kairos-white [transition:background_.45s_ease,border-color_.45s_ease,transform_.45s_var(--ease-out)]"
      :class="scrolled && 'border-b border-white/10 bg-[rgba(5,5,5,.87)] backdrop-blur-[18px]'"
    >
      <div class="kairos-container grid h-21 grid-cols-[1fr_auto] items-center max-[900px]:h-[4.6rem]">
        <a href="#inicio" class="justify-self-start" aria-label="Kairos — início" @click="closeMenu()">
          <KairosMark />
        </a>

        <a
          class="inline-flex min-h-[2.7rem] items-center justify-self-end gap-[.7rem] rounded-full border border-white/32 py-0 pr-[.95rem] pl-[1.1rem] text-[.7rem] tracking-[.04em] [transition:background_.3s_ease,color_.3s_ease,border-color_.3s_ease] hover:border-kairos-white hover:bg-kairos-white hover:text-kairos-black max-[900px]:hidden [&_svg]:w-4 [&_svg]:[transition:transform_.3s_var(--ease-out)] hover:[&_svg]:translate-x-[.2rem]"
          href="/login"
        >
          <span>Entrar</span>
          <ArrowIcon />
        </a>

        <button
          ref="menuToggle"
          class="relative hidden size-11 cursor-pointer justify-self-end rounded-full border border-white/24 bg-transparent p-0 text-inherit max-[900px]:block"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
          @click="toggleMenu"
        >
          <span
            class="absolute left-1/2 h-px w-4 -translate-x-1/2 bg-current transition-[transform,top] duration-350 ease-kairos-out"
            :class="menuOpen ? 'top-1/2 rotate-45' : 'top-[calc(50%-3px)]'"
          />
          <span
            class="absolute left-1/2 h-px w-4 -translate-x-1/2 bg-current transition-[transform,top] duration-350 ease-kairos-out"
            :class="menuOpen ? 'top-1/2 -rotate-45' : 'top-[calc(50%+3px)]'"
          />
        </button>
      </div>

      <nav
        id="mobile-menu"
        ref="mobileMenu"
        class="fixed inset-0 z-[-1] hidden h-dvh flex-col justify-start overflow-y-auto bg-kairos-black px-(--gutter) pt-[clamp(7rem,15vh,10rem)] pb-[max(2rem,env(safe-area-inset-bottom))] [transition:opacity_.35s_ease] max-[900px]:flex [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:pt-[5.5rem]"
        :class="menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'"
        aria-label="Navegação móvel"
        :aria-hidden="!menuOpen"
        :inert="!menuOpen"
      >
        <a
          class="flex items-start gap-5 border-b border-white/14 py-[.45rem] text-[clamp(2.6rem,12vw,5rem)] leading-[1.15] font-medium [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:text-[2rem] [&_span]:pt-[.7rem] [&_span]:font-mono [&_span]:text-[.62rem] [&_span]:text-kairos-muted"
          href="/login"
          @click="closeMenu()"
        ><span>01</span>Entrar</a>
        <a
          class="flex items-start gap-5 border-b border-white/14 py-[.45rem] text-[clamp(2.6rem,12vw,5rem)] leading-[1.15] font-medium [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:text-[2rem] [&_span]:pt-[.7rem] [&_span]:font-mono [&_span]:text-[.62rem] [&_span]:text-kairos-muted"
          href="#contato"
          @click="closeMenu()"
        ><span>02</span>Contato</a>
        <div class="mt-auto flex justify-between font-mono text-[.58rem] tracking-[.08em] text-kairos-muted max-[640px]:flex-col max-[640px]:gap-[.55rem]">
          <span>KAIROS / DECISION INTELLIGENCE</span>
          <span>PROJETO ACADÊMICO — {{ currentYear }}</span>
        </div>
      </nav>
    </header>

    <main id="conteudo">
      <section id="inicio" class="hero-orbit relative isolate min-h-[max(48rem,100svh)] overflow-hidden bg-kairos-black text-kairos-white max-[900px]:min-h-[max(47rem,100svh)] max-[640px]:min-h-[max(46rem,100svh)] [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:min-h-[44rem]">
        <div class="grid-lines absolute inset-0 z-[-3]" />
        <div class="absolute top-1/5 right-[17%] z-[-2] size-88 rounded-full bg-white/8 blur-[110px]" />
        <div class="absolute inset-0 z-[-1] size-full" aria-hidden="true">
          <WebThreads
            color1="#ffffff"
            color2="#000000"
            color3="#FFFFFF"
            :speed="0.15"
            :thread-count="6"
            :frequency="5.0"
            :spread="0.11"
            :taper="1.0"
            :position="0.5"
            fan-mode="left"
            :glow="0.02"
            :falloff="0.61"
            :thickness="1.1"
            :brightness="0.6"
            :opacity="1.0"
            :mirror="false"
            :shimmer="false"
            :grain="false"
            :grain-intensity="0.06"
            :mouse-interaction="true"
            :mouse-strength="0.12"
          />
        </div>
        <div class="kairos-container relative grid min-h-[max(48rem,100svh)] grid-cols-[minmax(0,1.1fr)_minmax(24rem,.9fr)] items-center pt-[7.8rem] pb-16 max-[1180px]:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)] max-[900px]:flex max-[900px]:min-h-[max(47rem,100svh)] max-[900px]:flex-col max-[900px]:items-stretch max-[900px]:pt-[8.2rem] max-[640px]:min-h-[max(46rem,100svh)] max-[640px]:pt-[7.5rem] max-[640px]:pb-20 [@media(max-width:900px)_and_(max-height:620px)_and_(orientation:landscape)]:min-h-[44rem]">
          <div class="relative z-2 self-center">
            <div class="hero-intro mb-[clamp(1.6rem,3vh,2.8rem)] flex items-center gap-[.7rem] font-mono text-[.64rem] tracking-[.12em] text-white/62 uppercase [animation-delay:.15s] max-[640px]:max-w-64 max-[640px]:leading-[1.45]">
              <span class="status-dot inline-block size-[.42rem] shrink-0 rounded-full bg-kairos-white" />
              Inteligência de dados para decisões reais
            </div>

            <h1 class="m-0 text-[clamp(4.2rem,8.6vw,9.2rem)] leading-[.82] font-medium tracking-[-.075em] max-[900px]:text-[clamp(4.2rem,14vw,7.3rem)] max-[640px]:text-[clamp(3.55rem,18vw,5.7rem)] max-[640px]:leading-[.87] max-[420px]:text-[clamp(3.2rem,16vw,4.25rem)]" aria-label="Do dado bruto à decisão certa">
              <span class="hero-intro block overflow-hidden pt-[.06em] pr-[.1em] pb-[.08em] [animation-delay:.22s] [&>span]:block"><span>Do dado</span></span>
              <span class="hero-intro block overflow-hidden pt-[.06em] pr-[.1em] pb-[.08em] pl-[clamp(0rem,5vw,5.5rem)] [animation-delay:.32s] max-[900px]:pl-0 [&>span]:block"><span>bruto à</span></span>
              <span class="hero-intro block overflow-hidden pt-[.06em] pr-[.1em] pb-[.16em] font-display font-normal tracking-[-.045em] text-[rgba(244,242,237,.92)] italic [animation-delay:.42s] max-[420px]:text-[.92em] max-[420px]:whitespace-nowrap [&>span]:block"><span>decisão certa.</span></span>
            </h1>

            <div class="hero-intro mt-[clamp(2rem,4vh,3.2rem)] grid grid-cols-[minmax(14rem,25rem)_1fr] items-end gap-[clamp(2rem,5vw,5rem)] pl-[clamp(0rem,5vw,5.5rem)] [animation-delay:.58s] max-[1180px]:grid-cols-[minmax(14rem,22rem)_auto] max-[900px]:grid-cols-[minmax(14rem,26rem)_auto] max-[900px]:pl-0 max-[640px]:mt-[1.8rem] max-[640px]:block">
              <p class="m-0 text-[clamp(.95rem,1.2vw,1.08rem)] leading-[1.7] text-white/58 max-[640px]:max-w-88 max-[640px]:text-[.88rem] max-[640px]:leading-[1.6]">
                Kairos processa grandes volumes de informação, encontra padrões relevantes
                e transforma complexidade em direção clara.
              </p>
              <div class="flex flex-col items-start gap-[1.15rem] max-[640px]:mt-6 max-[640px]:flex-row max-[640px]:items-center max-[420px]:flex-col max-[420px]:items-start max-[420px]:gap-[.8rem]">
                <a class="button-sweep relative isolate inline-flex min-h-[3.55rem] min-w-50 items-center justify-between overflow-hidden rounded-full border border-kairos-white bg-kairos-white py-0 pr-[.9rem] pl-[1.35rem] text-xs font-semibold tracking-[.02em] text-kairos-black hover:text-kairos-white max-[640px]:min-h-[3.15rem] max-[640px]:min-w-[10.8rem] max-[640px]:pl-4 max-[640px]:text-[.65rem] [&_svg]:size-[1.2rem] [&_svg]:[transition:transform_.35s_var(--ease-out)] hover:[&_svg]:translate-x-1" href="#plataforma">
                  <span>Explorar o Kairos</span>
                  <ArrowIcon />
                </a>
                <a class="inline-flex items-center gap-[.65rem] border-b border-white/28 py-[.2rem] text-[.7rem] text-white/62 [transition:color_.25s_ease,border-color_.25s_ease] hover:border-kairos-white hover:text-kairos-white" href="#capacidades">
                  Ver capacidades
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>

          <div class="hero-intro absolute right-(--gutter) bottom-[2.1rem] left-(--gutter) flex gap-8 border-t border-white/14 pt-[.85rem] font-mono text-[.54rem] tracking-[.08em] text-white/42 [animation-delay:.75s] max-[900px]:bottom-[1.6rem] max-[640px]:gap-[.8rem] max-[640px]:text-[.55rem] [&_span:last-child]:ml-auto [&_span:nth-child(2)]:max-[640px]:hidden">
            <span>DATA SCIENCE</span>
            <span>LARGE-SCALE PROCESSING</span>
            <span>DECISION SUPPORT</span>
          </div>

          <a class="absolute right-(--gutter) bottom-20 flex flex-col items-center gap-[.7rem] font-mono text-[.51rem] tracking-[.12em] text-white/45 max-[900px]:hidden" href="#plataforma" aria-label="Rolar para a próxima seção">
            <span>SCROLL</span>
            <i class="scroll-line relative block h-[2.6rem] w-px overflow-hidden bg-white/18" />
          </a>
        </div>
      </section>

      <div class="relative z-3 overflow-hidden border-y border-white/14 bg-kairos-black text-kairos-white" aria-label="Fluxo do Kairos">
        <div class="flex min-h-[6.1rem] w-full items-center px-(--gutter) max-[640px]:min-h-[4.8rem]">
          <TrueFocus
            sentence="CAPTURAR|PROCESSAR|MODELAR|PREVER|DECIDIR"
            separator="|"
            :manual-mode="true"
            :blur-amount="3.5"
            border-color="#ffffff"
            glow-color="rgba(255, 255, 255, 0.6)"
            :animation-duration="0.6"
            :pause-between-animations="1"
          />
        </div>
      </div>

      <section id="plataforma" class="bg-kairos-black py-[clamp(7rem,11vw,11rem)] pb-[clamp(6rem,10vw,9rem)] text-kairos-white">
        <div class="kairos-container">
          <div class="flex items-center justify-between gap-[.7rem] border-b border-white/14 pb-[1.15rem] font-mono text-[.64rem] tracking-[.12em] text-kairos-muted uppercase" data-reveal>
            <span>01</span>
            <span>INTELIGÊNCIA EM MOVIMENTO</span>
          </div>

          <div class="mt-[clamp(4rem,7vw,7rem)] grid grid-cols-[minmax(0,1.5fr)_minmax(18rem,.5fr)] items-end gap-16 max-[900px]:grid-cols-1 max-[900px]:gap-10 max-[640px]:mt-[3.2rem]" data-reveal>
            <h2 class="m-0 text-[clamp(3.1rem,6vw,6.4rem)] leading-[.93] font-medium tracking-[-.07em] max-[640px]:text-[clamp(2.8rem,13.5vw,4.4rem)] [&_em]:font-display [&_em]:font-normal [&_em]:text-white/68">Complexidade por dentro.<br /><em>Clareza por fora.</em></h2>
            <p class="mt-0 mr-0 mb-[.65rem] ml-0 text-[clamp(.95rem,1.25vw,1.1rem)] leading-[1.7] text-kairos-muted">
              Uma experiência desenhada para revelar relações, antecipar cenários
              e levar cada insight para mais perto da ação.
            </p>
          </div>

          <ProductPrototype data-reveal />
          <p class="mt-[.85rem] text-right font-mono text-[.5rem] leading-[1.5] tracking-[.04em] text-[#858585] max-[640px]:text-left" data-reveal>* Dados ilustrativos para demonstrar a experiência conceitual do produto.</p>
        </div>
      </section>

      <section id="capacidades" class="bg-kairos-black py-[clamp(7rem,11vw,11rem)] text-kairos-white">
        <div class="kairos-container">
          <div class="flex items-center justify-between gap-[.7rem] border-b border-white/14 pb-[1.15rem] font-mono text-[.64rem] tracking-[.12em] text-kairos-muted uppercase" data-reveal>
            <span>02</span>
            <span>CAPACIDADES</span>
          </div>
          <div class="mt-[clamp(4rem,7vw,7rem)]" data-reveal>
            <h2 class="m-0 text-[clamp(3.1rem,6vw,6.4rem)] leading-[.93] font-medium tracking-[-.07em] max-[640px]:text-[clamp(2.8rem,13.5vw,4.4rem)] [&_em]:font-display [&_em]:font-normal [&_em]:text-white/68">Construído para ver<br /><em>o que passa despercebido.</em></h2>
          </div>

          <div class="mt-[clamp(4rem,7vw,7rem)] grid grid-cols-2 gap-3 max-[640px]:grid-cols-1 [&>[data-reveal]:nth-child(2)]:[transition-delay:.1s] [&>[data-reveal]:nth-child(3)]:[transition-delay:.2s] [&>[data-reveal]:nth-child(4)]:[transition-delay:.3s]">
            <article class="group relative row-span-2 flex min-h-[58.75rem] flex-col overflow-hidden rounded-[.55rem] border border-white/14 bg-kairos-black-soft p-[clamp(1.25rem,2.5vw,2.1rem)] [transition:border-color_.35s_ease,transform_.55s_var(--ease-out)] hover:-translate-y-[.3rem] hover:border-white/35 max-[900px]:min-h-[56rem] max-[640px]:row-auto max-[640px]:min-h-[31rem]" data-reveal>
              <div class="relative z-2 flex justify-between font-mono text-[.55rem] tracking-[.1em] text-[#666]"><span>01</span><span>ESCALA</span></div>
              <PixelCard class="pointer-events-none absolute! top-4 right-0 bottom-[clamp(14rem,20vw,17rem)] left-0 z-0 h-auto! w-auto! overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_7%,black_88%,transparent)] max-[640px]:bottom-[12.5rem]" active />
              <div class="relative z-2 mt-auto">
                <h3 class="m-0 text-[clamp(1.65rem,2.8vw,2.65rem)] font-medium tracking-[-.055em]">Processamento em massa</h3>
                <p class="mt-4 mb-0 max-w-136 text-[.88rem] leading-[1.7] text-kairos-muted">Uma base pensada para transformar conjuntos extensos de dados com consistência e rastreabilidade.</p>
              </div>
            </article>

            <article class="relative flex min-h-116 flex-col overflow-hidden rounded-[.55rem] border border-white/14 bg-kairos-black-soft p-[clamp(1.25rem,2.5vw,2.1rem)] [transition:border-color_.35s_ease,transform_.55s_var(--ease-out)] hover:-translate-y-[.3rem] hover:border-white/35 max-[640px]:min-h-[31rem]" data-reveal>
              <div class="relative z-2 flex justify-between font-mono text-[.55rem] tracking-[.1em] text-[#666]"><span>02</span><span>MODELOS</span></div>
              <div class="relative grid min-h-56 flex-1 place-items-center" aria-hidden="true">
                <i class="absolute size-52 rounded-full border border-white/12" />
                <i class="absolute size-36 animate-[ring-rotate_15s_linear_infinite] rounded-full border border-dashed border-white/12" />
                <i class="absolute size-20 rounded-full border border-white/32" />
                <b class="size-[.7rem] rounded-full bg-kairos-white shadow-[0_0_2rem_var(--white)]" />
              </div>
              <div class="relative z-2 mt-auto">
                <h3 class="m-0 text-[clamp(1.65rem,2.8vw,2.65rem)] font-medium tracking-[-.055em]">Ciência de dados aplicada</h3>
                <p class="mt-4 mb-0 max-w-136 text-[.88rem] leading-[1.7] text-kairos-muted">Modelos orientados a perguntas reais, não apenas a gráficos.</p>
              </div>
            </article>

            <article class="relative flex min-h-116 flex-col overflow-hidden rounded-[.55rem] border border-white/14 bg-kairos-black-soft p-[clamp(1.25rem,2.5vw,2.1rem)] [transition:border-color_.35s_ease,transform_.55s_var(--ease-out)] hover:-translate-y-[.3rem] hover:border-white/35 max-[640px]:min-h-[31rem]" data-reveal>
              <div class="relative z-2 flex justify-between font-mono text-[.55rem] tracking-[.1em] text-[#666]"><span>03</span><span>PADRÕES</span></div>
              <ReactiveGrid class="my-6 min-h-52 flex-1" />
              <div class="relative z-2 mt-auto">
                <h3 class="m-0 text-[clamp(1.65rem,2.8vw,2.65rem)] font-medium tracking-[-.055em]">Detecção de anomalias</h3>
                <p class="mt-4 mb-0 max-w-136 text-[.88rem] leading-[1.7] text-kairos-muted">Sinais fora da curva ganham contexto antes de se tornarem problemas.</p>
              </div>
            </article>

            <article class="relative col-span-full flex min-h-116 flex-col overflow-hidden rounded-[.55rem] border border-white/14 bg-kairos-black-soft p-[clamp(1.25rem,2.5vw,2.1rem)] [transition:border-color_.35s_ease,transform_.55s_var(--ease-out)] hover:-translate-y-[.3rem] hover:border-white/35 max-[640px]:col-auto max-[640px]:min-h-[31rem]" data-reveal>
              <div class="relative z-2 flex justify-between font-mono text-[.55rem] tracking-[.1em] text-[#666]"><span>04</span><span>DECISÃO</span></div>
              <div class="grid flex-1 grid-cols-[1fr_auto_1fr_auto_1.2fr] items-center gap-[.8rem] py-8 max-[640px]:grid-cols-[1fr_auto_1fr] max-[420px]:gap-[.45rem]" aria-hidden="true">
                <div class="rounded-[.3rem] border border-white/14 p-4 max-[640px]:hidden max-[420px]:p-[.7rem]"><span class="block font-mono text-[.46rem] text-[#666]">CONTEXTO</span><strong class="mt-[.45rem] block font-display text-[2rem] font-normal max-[420px]:text-[1.6rem]">82</strong></div><i class="h-px w-[1.2rem] bg-[#444] max-[640px]:hidden" />
                <div class="rounded-[.3rem] border border-white/14 p-4 max-[420px]:p-[.7rem]"><span class="block font-mono text-[.46rem] text-[#666]">RISCO</span><strong class="mt-[.45rem] block font-display text-[2rem] font-normal max-[420px]:text-[1.6rem]">14</strong></div><i class="h-px w-[1.2rem] bg-[#444]" />
                <div class="rounded-[.3rem] border border-white/14 bg-kairos-white p-4 text-kairos-black max-[420px]:p-[.7rem]"><span class="block font-mono text-[.46rem] text-[#555]">OPORTUNIDADE</span><strong class="mt-[.45rem] block font-display text-[2rem] font-normal max-[420px]:text-[1.6rem]">94</strong></div>
              </div>
              <div class="relative z-2 mt-auto">
                <h3 class="m-0 text-[clamp(1.65rem,2.8vw,2.65rem)] font-medium tracking-[-.055em]">Inteligência contextualizada</h3>
                <p class="mt-4 mb-0 max-w-136 text-[.88rem] leading-[1.7] text-kairos-muted">Cada descoberta chega acompanhada de sinais, relevância e impacto — para aproximar análise e ação.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="border-t border-white/14 bg-kairos-black py-[clamp(7rem,11vw,11rem)] text-kairos-white">
        <div class="kairos-container grid grid-cols-[minmax(18rem,.68fr)_minmax(0,1.32fr)] items-center gap-[clamp(3rem,8vw,8rem)] max-[900px]:grid-cols-1">
          <div class="max-[900px]:max-w-[42rem]" data-reveal>
            <div class="mb-[clamp(3rem,5vw,5rem)] flex items-center justify-between gap-[.7rem] border-b border-white/14 pb-[1.15rem] font-mono text-[.64rem] tracking-[.12em] text-kairos-muted uppercase">
              <span>03</span>
              <span>CENÁRIO INTERATIVO</span>
            </div>
            <h2 class="m-0 text-[clamp(3rem,5.5vw,5.8rem)] leading-[.93] font-medium tracking-[-.07em] max-[640px]:text-[clamp(2.8rem,13.5vw,4.4rem)] [&_em]:font-display [&_em]:font-normal [&_em]:text-white/68">E se a demanda<br />mudar <em>amanhã?</em></h2>
            <p class="mt-8 mb-0 text-[.95rem] leading-[1.7] text-kairos-muted">
              Teste uma variável. O Kairos reorganiza os sinais e transforma uma hipótese
              em impacto, risco e recomendação.
            </p>
            <div class="mt-[3.2rem] border-t border-white/14 pt-[1.4rem]">
              <label class="flex items-center justify-between font-mono text-[.56rem] tracking-[.08em]" for="demand-range"><span>AUMENTO DE DEMANDA</span><output class="font-display text-[2rem] font-normal tracking-[-.04em]" for="demand-range">+{{ scenario }}%</output></label>
              <input id="demand-range" v-model.number="scenario" class="scenario-range my-[.2rem] mt-[.35rem] h-11 w-full cursor-ew-resize appearance-none rounded-none border-0 [background:linear-gradient(rgba(255,255,255,.32),rgba(255,255,255,.32))_center/100%_1px_no-repeat] outline-offset-[.5rem]" type="range" min="0" max="45" step="1" />
              <div class="flex items-center justify-between font-mono text-[.5rem] tracking-[.08em] text-kairos-muted"><span>0%</span><span>45%</span></div>
            </div>
          </div>

          <div id="cenario" class="rounded-[.55rem] border border-white/24 bg-[#0d0d0d] text-kairos-white shadow-[0_2rem_6rem_rgba(0,0,0,.45)]" data-reveal>
            <header class="flex min-h-[3.4rem] items-center justify-between border-b border-white/14 px-4 font-mono text-[.48rem] tracking-[.07em] text-kairos-muted">
              <div class="flex items-center gap-2"><span class="status-dot inline-block size-[.32rem] shrink-0 rounded-full bg-kairos-white" /> SIMULAÇÃO CONCEITUAL / DADOS ILUSTRATIVOS</div>
              <span class="max-[420px]:hidden">KRS / SCN-001</span>
            </header>
            <div class="border-b border-white/14 px-6 pt-8 pb-4 max-[640px]:px-[.8rem] max-[640px]:pt-[1.2rem] max-[640px]:pb-[.8rem]">
              <div class="relative flex h-76 items-end gap-[clamp(.45rem,1.1vw,.85rem)] border-b border-white/24 bg-[linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px)] bg-size-[100%_25%] pt-4 after:absolute after:top-0 after:bottom-0 after:left-[56%] after:border-l after:border-dashed after:border-white/30 after:content-[''] max-[640px]:h-60 max-[640px]:gap-[.35rem]" role="img" :aria-label="`Gráfico ilustrativo: aumento de demanda configurado em ${scenario} por cento e índice de pressão projetado em ${impact}`">
                <i
                  v-for="(bar, index) in chartBars"
                  :key="index"
                  class="relative z-1 min-h-[1%] flex-1 border border-b-0 border-white/42 [transition:height_.22s_var(--ease-out),background_.22s_ease]"
                  :class="index >= 5 ? 'bg-kairos-white' : 'bg-white/8'"
                  :style="{ height: `${bar}%` }"
                ><span v-if="index === chartBars.length - 1" class="absolute -top-6 right-0 font-mono text-[.48rem] not-italic">+{{ scenario }}%</span></i>
              </div>
              <div class="mt-[.7rem] flex justify-between font-mono text-[.48rem] text-kairos-muted"><span>HISTÓRICO</span><span>PROJEÇÃO →</span></div>
            </div>
            <div class="grid grid-cols-3 border-b border-white/14 max-[640px]:grid-cols-1">
              <article class="flex flex-col border-r border-white/14 p-[1.2rem] max-[640px]:grid max-[640px]:grid-cols-[1fr_auto] max-[640px]:items-center max-[640px]:border-r-0 max-[640px]:border-b"><span class="font-mono text-[.45rem] tracking-[.06em] text-kairos-muted">PRESSÃO PROJETADA</span><strong class="my-[.7rem] mb-[.35rem] font-display text-[clamp(1.7rem,3vw,2.5rem)] leading-none font-normal max-[640px]:col-start-2 max-[640px]:row-span-2 max-[640px]:m-0">{{ impact }}</strong><small class="font-mono text-[.4rem] text-kairos-muted">ÍNDICE RELATIVO / BASE 100</small></article>
              <article class="flex flex-col border-r border-white/14 p-[1.2rem] max-[640px]:grid max-[640px]:grid-cols-[1fr_auto] max-[640px]:items-center max-[640px]:border-r-0 max-[640px]:border-b"><span class="font-mono text-[.45rem] tracking-[.06em] text-kairos-muted">NÍVEL DE RISCO</span><strong class="my-[.7rem] mb-[.35rem] font-display text-[clamp(1.7rem,3vw,2.5rem)] leading-none font-normal max-[640px]:col-start-2 max-[640px]:row-span-2 max-[640px]:m-0">{{ risk.code }} <em class="ml-1 font-sans text-[.55rem] font-medium not-italic uppercase">{{ risk.label }}</em></strong><small class="font-mono text-[.4rem] text-kairos-muted">JANELA DE 30 DIAS</small></article>
              <article class="flex flex-col p-[1.2rem] max-[640px]:grid max-[640px]:grid-cols-[1fr_auto] max-[640px]:items-center"><span class="font-mono text-[.45rem] tracking-[.06em] text-kairos-muted">COERÊNCIA DO CENÁRIO</span><strong class="my-[.7rem] mb-[.35rem] font-display text-[clamp(1.7rem,3vw,2.5rem)] leading-none font-normal max-[640px]:col-start-2 max-[640px]:row-span-2 max-[640px]:m-0">{{ confidence }}%</strong><small class="font-mono text-[.4rem] text-kairos-muted">CÁLCULO DEMONSTRATIVO</small></article>
            </div>
            <div class="relative min-h-[8.2rem] py-5 pr-18 pl-5">
              <span class="font-mono text-[.48rem] tracking-[.07em] text-kairos-muted">LEITURA DO CENÁRIO</span>
              <p class="mt-3 mb-0 max-w-140 text-[clamp(.95rem,1.5vw,1.18rem)] leading-[1.45] font-semibold">{{ recommendation }}</p>
              <ArrowIcon class="absolute top-1/2 right-[1.4rem] w-[1.7rem] -translate-y-1/2" />
            </div>
            <p class="sr-only" aria-live="polite">{{ scenarioAnnouncement }}</p>
          </div>
        </div>
      </section>

      <section id="contato" class="relative isolate min-h-[min(58rem,100svh)] overflow-hidden border-t border-white/14 bg-kairos-black text-kairos-white max-[640px]:min-h-[45rem]">
        <GridScan
          class="final-cta__gridscan pointer-events-none absolute inset-0 z-0 opacity-100 max-[640px]:opacity-88"
          :sensitivity="0.6"
          :line-thickness="1.35"
          lines-color="#e4e4e4"
          :grid-scale="0.085"
          scan-color="#afafaf"
          :scan-opacity="0.72"
          :line-jitter="0.025"
          :bloom-intensity="0.58"
          :bloom-threshold="0.06"
          :bloom-smoothing="0.7"
          :chromatic-aberration="0.0008"
          :noise-intensity="0.008"
          :scan-glow="0.54"
          :scan-softness="2.3"
          :scan-phase-taper="0.22"
          scan-direction="forward"
          :scan-duration="7"
          :scan-delay="10.5"
          aria-hidden="true"
        />
        <div class="kairos-container relative z-2 flex min-h-[min(58rem,100svh)] flex-col items-center justify-center py-32 text-center max-[640px]:min-h-[45rem]">
          <div class="flex items-center gap-[.7rem] font-mono text-[.64rem] tracking-[.12em] text-kairos-muted uppercase" data-reveal><span class="status-dot inline-block size-[.42rem] shrink-0 rounded-full bg-kairos-white" /> O MOMENTO CERTO COMEÇA AQUI</div>
          <h2 class="mt-[clamp(2rem,4vw,3.5rem)] mb-0 max-w-304 text-[clamp(3.5rem,7.8vw,8rem)] leading-[.93] font-medium tracking-[-.07em] max-[640px]:max-w-92 max-[640px]:text-[clamp(2.95rem,13vw,4.5rem)] max-[640px]:leading-[.95] [&_em]:font-display [&_em]:font-normal [&_em]:text-white/65 max-[640px]:[&_em]:block" data-reveal>O próximo movimento<br />pode estar nos <em>seus dados.</em></h2>
          <p class="mt-8 mb-0 max-w-140 text-[clamp(.95rem,1.3vw,1.1rem)] leading-[1.7] text-kairos-muted" data-reveal>Encontre os padrões que importam e transforme informação em uma vantagem para decidir.</p>
          <a class="button-sweep relative isolate mt-[2.8rem] inline-flex min-h-[4.2rem] min-w-64 items-center justify-between overflow-hidden rounded-full border border-kairos-white bg-kairos-white py-0 pr-[.9rem] pl-[1.65rem] text-xs font-semibold tracking-[.02em] text-kairos-black hover:text-kairos-white [&_svg]:size-[1.2rem] [&_svg]:[transition:transform_.35s_var(--ease-out)] hover:[&_svg]:translate-x-1" href="mailto:contato@kairos.dev" data-reveal>
            <span>Falar sobre o projeto</span>
            <ArrowIcon />
          </a>
        </div>
      </section>
    </main>

    <footer class="border-t border-white/14 bg-kairos-black text-kairos-white">
      <div class="kairos-container grid grid-cols-3 items-start pt-14 pb-20 max-[640px]:grid-cols-1 max-[640px]:gap-8 max-[640px]:pb-12">
        <KairosMark />
        <p class="m-0 text-center font-display text-[1.15rem] text-kairos-muted italic max-[640px]:text-left">Inteligência para o momento de decidir.</p>
        <nav class="flex justify-end gap-6 max-[640px]:flex-wrap max-[640px]:justify-start" aria-label="Navegação do rodapé">
          <a class="text-[.68rem] text-kairos-muted [transition:color_.25s_ease] hover:text-kairos-white" href="#capacidades">Capacidades</a>
        </nav>
      </div>
      <div class="kairos-container grid grid-cols-[1fr_auto_1fr] items-center border-t border-white/14 py-[1.2rem] font-mono text-[.55rem] tracking-[.06em] text-[#858585] max-[640px]:grid-cols-[1fr_auto] max-[640px]:gap-y-3">
        <span>© {{ currentYear }} KAIROS</span>
        <span class="justify-self-center max-[640px]:col-span-2 max-[640px]:col-start-1 max-[640px]:row-start-2 max-[640px]:justify-self-start">PROJETO ACADÊMICO · VUE / SPRING BOOT / PYTHON</span>
        <span class="flex items-center justify-self-end gap-[.45rem]"><i class="status-dot inline-block size-[.28rem] shrink-0 rounded-full bg-kairos-white" /> PROTOTYPE ONLINE</span>
      </div>
    </footer>
  </div>
</template>
