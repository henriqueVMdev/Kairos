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
  <div ref="app" class="app-shell">
    <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <div class="scroll-progress" :style="{ transform: `scaleX(${progress / 100})` }" />

    <header class="site-header" :class="{ 'site-header--scrolled': scrolled, 'site-header--open': menuOpen }">
      <div class="site-header__inner">
        <a href="#inicio" class="site-header__brand" aria-label="Kairos — início" @click="closeMenu()">
          <KairosMark />
        </a>

        <a class="header-cta" href="#plataforma">
          <span>Ver a experiência</span>
          <ArrowIcon />
        </a>

        <button
          ref="menuToggle"
          class="menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          aria-controls="mobile-menu"
          :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'"
          @click="toggleMenu"
        >
          <span />
          <span />
        </button>
      </div>

      <nav
        id="mobile-menu"
        ref="mobileMenu"
        class="mobile-menu"
        aria-label="Navegação móvel"
        :aria-hidden="!menuOpen"
        :inert="!menuOpen"
      >
        <a href="#contato" @click="closeMenu()"><span>01</span>Contato</a>
        <div class="mobile-menu__footer">
          <span>KAIROS / DECISION INTELLIGENCE</span>
          <span>PROJETO ACADÊMICO — {{ currentYear }}</span>
        </div>
      </nav>
    </header>

    <main id="conteudo">
      <section id="inicio" class="hero section-dark">
        <div class="hero__grid grid-lines" />
        <div class="hero__glow" />
        <div class="hero__threads" aria-hidden="true">
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
        <div class="container hero__inner">
          <div class="hero__copy">
            <div class="eyebrow hero__eyebrow hero-intro">
              <span class="status-dot" />
              Inteligência de dados para decisões reais
            </div>

            <h1 class="hero__title" aria-label="Do dado bruto à decisão certa">
              <span class="hero__line hero-intro"><span>Do dado</span></span>
              <span class="hero__line hero__line--offset hero-intro"><span>bruto à</span></span>
              <span class="hero__line hero__line--serif hero-intro"><span>decisão certa.</span></span>
            </h1>

            <div class="hero__support hero-intro">
              <p>
                Kairos processa grandes volumes de informação, encontra padrões relevantes
                e transforma complexidade em direção clara.
              </p>
              <div class="hero__actions">
                <a class="button button--light" href="#plataforma">
                  <span>Explorar o Kairos</span>
                  <ArrowIcon />
                </a>
                <a class="text-link" href="#capacidades">
                  Ver capacidades
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>

          <div class="hero__meta hero-intro">
            <span>DATA SCIENCE</span>
            <span>LARGE-SCALE PROCESSING</span>
            <span>DECISION SUPPORT</span>
          </div>

          <a class="scroll-cue" href="#plataforma" aria-label="Rolar para a próxima seção">
            <span>SCROLL</span>
            <i />
          </a>
        </div>
      </section>

      <div class="marquee" aria-label="Fluxo do Kairos">
        <div class="marquee__track">
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

      <section id="plataforma" class="platform section-dark">
        <div class="container">
          <div class="section-index section-index--light" data-reveal>
            <span>01</span>
            <span>INTELIGÊNCIA EM MOVIMENTO</span>
          </div>

          <div class="section-heading" data-reveal>
            <h2>Complexidade por dentro.<br /><em>Clareza por fora.</em></h2>
            <p>
              Uma experiência desenhada para revelar relações, antecipar cenários
              e levar cada insight para mais perto da ação.
            </p>
          </div>

          <ProductPrototype data-reveal />
          <p class="demo-disclaimer" data-reveal>* Dados ilustrativos para demonstrar a experiência conceitual do produto.</p>
        </div>
      </section>

      <section id="capacidades" class="capabilities section-dark">
        <div class="container">
          <div class="section-index section-index--light" data-reveal>
            <span>02</span>
            <span>CAPACIDADES</span>
          </div>
          <div class="capabilities__header" data-reveal>
            <h2>Construído para ver<br /><em>o que passa despercebido.</em></h2>
          </div>

          <div class="bento-grid">
            <article class="capability-card capability-card--large" data-reveal>
              <div class="capability-card__top"><span>01</span><span>ESCALA</span></div>
              <PixelCard class="pixel-card-visual" active />
              <div class="capability-card__content">
                <h3>Processamento em massa</h3>
                <p>Uma base pensada para transformar conjuntos extensos de dados com consistência e rastreabilidade.</p>
              </div>
            </article>

            <article class="capability-card" data-reveal>
              <div class="capability-card__top"><span>02</span><span>MODELOS</span></div>
              <div class="rings-visual" aria-hidden="true"><i /><i /><i /><b /></div>
              <div class="capability-card__content">
                <h3>Ciência de dados aplicada</h3>
                <p>Modelos orientados a perguntas reais, não apenas a gráficos.</p>
              </div>
            </article>

            <article class="capability-card" data-reveal>
              <div class="capability-card__top"><span>03</span><span>PADRÕES</span></div>
              <ReactiveGrid class="reactive-grid-visual" />
              <div class="capability-card__content">
                <h3>Detecção de anomalias</h3>
                <p>Sinais fora da curva ganham contexto antes de se tornarem problemas.</p>
              </div>
            </article>

            <article class="capability-card capability-card--wide" data-reveal>
              <div class="capability-card__top"><span>04</span><span>DECISÃO</span></div>
              <div class="decision-visual" aria-hidden="true">
                <div><span>CONTEXTO</span><strong>82</strong></div><i />
                <div><span>RISCO</span><strong>14</strong></div><i />
                <div class="is-selected"><span>OPORTUNIDADE</span><strong>94</strong></div>
              </div>
              <div class="capability-card__content">
                <h3>Inteligência contextualizada</h3>
                <p>Cada descoberta chega acompanhada de sinais, relevância e impacto — para aproximar análise e ação.</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="scenario section-dark">
        <div class="container scenario__layout">
          <div class="scenario__copy" data-reveal>
            <div class="section-index section-index--light">
              <span>03</span>
              <span>CENÁRIO INTERATIVO</span>
            </div>
            <h2>E se a demanda<br />mudar <em>amanhã?</em></h2>
            <p>
              Teste uma variável. O Kairos reorganiza os sinais e transforma uma hipótese
              em impacto, risco e recomendação.
            </p>
            <div class="scenario__control">
              <label for="demand-range"><span>AUMENTO DE DEMANDA</span><output for="demand-range">+{{ scenario }}%</output></label>
              <input id="demand-range" v-model.number="scenario" type="range" min="0" max="45" step="1" />
              <div><span>0%</span><span>45%</span></div>
            </div>
          </div>

          <div id="cenario" class="scenario-panel" data-reveal>
            <header>
              <div><span class="status-dot" /> SIMULAÇÃO CONCEITUAL / DADOS ILUSTRATIVOS</div>
              <span>KRS / SCN-001</span>
            </header>
            <div class="scenario-panel__chart">
              <div class="scenario-bars" role="img" :aria-label="`Gráfico ilustrativo: aumento de demanda configurado em ${scenario} por cento e índice de pressão projetado em ${impact}`">
                <i v-for="(bar, index) in chartBars" :key="index" :style="{ height: `${bar}%` }"><span v-if="index === chartBars.length - 1">+{{ scenario }}%</span></i>
              </div>
              <div class="scenario-chart__axis"><span>HISTÓRICO</span><span>PROJEÇÃO →</span></div>
            </div>
            <div class="scenario-panel__results">
              <article><span>PRESSÃO PROJETADA</span><strong>{{ impact }}</strong><small>ÍNDICE RELATIVO / BASE 100</small></article>
              <article><span>NÍVEL DE RISCO</span><strong>{{ risk.code }} <em>{{ risk.label }}</em></strong><small>JANELA DE 30 DIAS</small></article>
              <article><span>COERÊNCIA DO CENÁRIO</span><strong>{{ confidence }}%</strong><small>CÁLCULO DEMONSTRATIVO</small></article>
            </div>
            <div class="scenario-panel__recommendation">
              <span>LEITURA DO CENÁRIO</span>
              <p>{{ recommendation }}</p>
              <ArrowIcon />
            </div>
            <p class="sr-only" aria-live="polite">{{ scenarioAnnouncement }}</p>
          </div>
        </div>
      </section>

      <section id="contato" class="final-cta section-dark">
        <GridScan
          class="final-cta__gridscan"
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
        <div class="container final-cta__inner">
          <div class="eyebrow" data-reveal><span class="status-dot" /> O MOMENTO CERTO COMEÇA AQUI</div>
          <h2 data-reveal>O próximo movimento<br />pode estar nos <em>seus dados.</em></h2>
          <p data-reveal>Encontre os padrões que importam e transforme informação em uma vantagem para decidir.</p>
          <a class="button button--light button--large" href="mailto:contato@kairos.dev" data-reveal>
            <span>Falar sobre o projeto</span>
            <ArrowIcon />
          </a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container site-footer__top">
        <KairosMark />
        <p>Inteligência para o momento de decidir.</p>
        <nav aria-label="Navegação do rodapé">
          <a href="#capacidades">Capacidades</a>
        </nav>
      </div>
      <div class="container site-footer__bottom">
        <span>© {{ currentYear }} KAIROS</span>
        <span>PROJETO ACADÊMICO · VUE / SPRING BOOT / PYTHON</span>
        <span><i class="status-dot" /> PROTOTYPE ONLINE</span>
      </div>
    </footer>
  </div>
</template>
