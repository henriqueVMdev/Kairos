<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import CountUp from './CountUp.vue'
import KairosMark from './KairosMark.vue'

const navItems = [
  { id: 'overview', label: 'Visão geral', icon: '⌁' },
  { id: 'sources', label: 'Fontes', icon: '◌' },
  { id: 'models', label: 'Modelos', icon: '⌇' },
  { id: 'scenarios', label: 'Cenários', icon: '↗' },
]

const pageHeaders = {
  overview: { eyebrow: 'VISÃO GERAL', title: 'Sinais que pedem atenção.' },
  sources: { eyebrow: 'FONTES', title: 'Conexões que alimentam a análise.' },
  models: { eyebrow: 'MODELOS', title: 'Inteligência sob monitoramento.' },
  scenarios: { eyebrow: 'CENÁRIOS', title: 'Possibilidades antes da decisão.' },
}

const filterOptions = {
  overview: [
    { value: '7', label: 'ÚLTIMOS 7 DIAS' },
    { value: '30', label: 'ÚLTIMOS 30 DIAS' },
    { value: '90', label: 'ÚLTIMOS 90 DIAS' },
  ],
  sources: [
    { value: 'all', label: 'TODAS AS FONTES' },
    { value: 'connected', label: 'CONECTADAS' },
    { value: 'attention', label: 'REQUER ATENÇÃO' },
  ],
  models: [
    { value: 'all', label: 'TODOS OS MODELOS' },
    { value: 'production', label: 'EM PRODUÇÃO' },
    { value: 'monitoring', label: 'EM MONITORAMENTO' },
  ],
  scenarios: [
    { value: '30', label: 'HORIZONTE 30 DIAS' },
    { value: '90', label: 'HORIZONTE 90 DIAS' },
    { value: '180', label: 'HORIZONTE 180 DIAS' },
  ],
}

const overviewPeriods = {
  7: {
    label: 'Demanda recente', metric: 8.7, badge: 'EM ACELERAÇÃO', adherence: '96,1%',
    line: 'M0 172 C58 168 83 143 130 151S195 172 244 140 309 119 365 131 430 104 490 88 548 96 613 64 681 59 760 42',
    area: 'M0 172 C58 168 83 143 130 151S195 172 244 140 309 119 365 131 430 104 490 88 548 96 613 64 681 59 760 42 V210 H0Z',
    axes: ['SEG', 'TER', 'QUA', 'QUI', 'HOJE'],
    signals: [
      { title: 'Pico de conversão', detail: 'Canal direto · 18h', value: '+12%' },
      { title: 'Busca recorrente', detail: 'Cluster A · frequência', value: '+8%' },
      { title: 'Fila operacional', detail: 'Janela de 48 horas', value: 'BAI' },
    ],
    volume: 0.7, sources: 8, patterns: 61,
  },
  30: {
    label: 'Demanda emergente', metric: 18.4, badge: 'ALTA RELEVÂNCIA', adherence: '94,8%',
    line: 'M0 176 C54 172 72 151 119 155S178 184 224 153 276 110 323 121 385 144 435 111 489 94 535 100 587 62 632 75 698 35 760 25',
    area: 'M0 176 C54 172 72 151 119 155S178 184 224 153 276 110 323 121 385 144 435 111 489 94 535 100 587 62 632 75 698 35 760 25 V210 H0Z',
    axes: ['01 AGO', '08 AGO', '15 AGO', '22 AGO', 'HOJE'],
    signals: [
      { title: 'Concentração regional', detail: 'Sudeste · aceleração', value: '+24%' },
      { title: 'Mudança de comportamento', detail: 'Cluster B · recorrência', value: '+11%' },
      { title: 'Risco de capacidade', detail: 'Janela de 14 dias', value: 'MED' },
    ],
    volume: 2.4, sources: 12, patterns: 284,
  },
  90: {
    label: 'Mudança estrutural', metric: 31.6, badge: 'TENDÊNCIA VALIDADA', adherence: '92,6%',
    line: 'M0 185 C64 176 105 183 153 160S218 126 270 139 330 158 383 118 437 104 495 112 548 83 602 71 659 48 710 54 760 18',
    area: 'M0 185 C64 176 105 183 153 160S218 126 270 139 330 158 383 118 437 104 495 112 548 83 602 71 659 48 710 54 760 18 V210 H0Z',
    axes: ['MAI', 'JUN', 'JUL', 'AGO', 'HOJE'],
    signals: [
      { title: 'Expansão de mercado', detail: 'Novas regiões · tração', value: '+37%' },
      { title: 'Retenção crescente', detail: 'Coorte trimestral', value: '+19%' },
      { title: 'Pressão logística', detail: 'Capacidade projetada', value: 'ALT' },
    ],
    volume: 7.8, sources: 16, patterns: 846,
  },
}

const sources = [
  { id: 'erp', name: 'ERP Operacional', type: 'Transacional', status: 'connected', statusLabel: 'CONECTADA', volume: 38.4, freshness: '4 min', completeness: 98, records: 12.8, cadence: 'A cada 5 minutos' },
  { id: 'crm', name: 'CRM Clientes', type: 'Relacionamento', status: 'connected', statusLabel: 'CONECTADA', volume: 21.7, freshness: '11 min', completeness: 96, records: 8.3, cadence: 'A cada 15 minutos' },
  { id: 'lake', name: 'Data Lake Eventos', type: 'Comportamental', status: 'connected', statusLabel: 'CONECTADA', volume: 34.2, freshness: '2 min', completeness: 99, records: 42.6, cadence: 'Fluxo contínuo' },
  { id: 'market', name: 'Pesquisa de Mercado', type: 'Externa', status: 'attention', statusLabel: 'ATENÇÃO', volume: 5.7, freshness: '2 dias', completeness: 82, records: 1.4, cadence: 'Semanal' },
]

const models = [
  { id: 'demand', name: 'Previsão de demanda', family: 'Série temporal', status: 'production', statusLabel: 'EM PRODUÇÃO', score: 94.8, drift: 1.2, updated: 'Hoje, 08:42', features: 38, runs: 1248 },
  { id: 'churn', name: 'Propensão à evasão', family: 'Classificação', status: 'production', statusLabel: 'EM PRODUÇÃO', score: 91.3, drift: 2.8, updated: 'Ontem, 22:10', features: 24, runs: 832 },
  { id: 'capacity', name: 'Risco de capacidade', family: 'Detecção de anomalia', status: 'monitoring', statusLabel: 'MONITORAMENTO', score: 87.6, drift: 6.4, updated: 'Hoje, 06:18', features: 17, runs: 416 },
]

const scenarios = [
  { id: 'balanced', name: 'Crescimento equilibrado', description: 'Expansão gradual com preservação da capacidade operacional.', probability: 68, impact: 72, risk: 'BAIXO' },
  { id: 'accelerated', name: 'Demanda acelerada', description: 'Aumento concentrado exige antecipação de recursos críticos.', probability: 51, impact: 89, risk: 'MÉDIO' },
  { id: 'constrained', name: 'Oferta restrita', description: 'Limites logísticos pressionam prazo, margem e experiência.', probability: 34, impact: 94, risk: 'ALTO' },
]

const activePage = ref('overview')
const filters = reactive({ overview: '30', sources: 'all', models: 'all', scenarios: '90' })
const selectedSourceId = ref('erp')
const selectedModelId = ref('demand')
const selectedScenarioId = ref('balanced')
const syncingSourceId = ref(null)
const sourceSyncTimes = reactive({})
const diagnosingModelId = ref(null)
const diagnosedAt = reactive({})
const scenarioDemand = ref(18)
const simulating = ref(false)
const simulationRun = ref(0)
const announcement = ref('Visão geral selecionada')

let syncTimer
let diagnosticTimer
let simulationTimer

const activeHeader = computed(() => pageHeaders[activePage.value])
const activeFilterOptions = computed(() => filterOptions[activePage.value])
const activeFilter = computed({
  get: () => filters[activePage.value],
  set: (value) => { filters[activePage.value] = value },
})
const activeFilterLabel = computed(() => activeFilterOptions.value.find((option) => option.value === activeFilter.value)?.label ?? '')
const overview = computed(() => overviewPeriods[filters.overview])
const filteredSources = computed(() => filters.sources === 'all' ? sources : sources.filter((source) => source.status === filters.sources))
const activeSource = computed(() => filteredSources.value.find((source) => source.id === selectedSourceId.value) ?? filteredSources.value[0])
const filteredModels = computed(() => filters.models === 'all' ? models : models.filter((model) => model.status === filters.models))
const activeModel = computed(() => filteredModels.value.find((model) => model.id === selectedModelId.value) ?? filteredModels.value[0])
const activeScenario = computed(() => scenarios.find((scenario) => scenario.id === selectedScenarioId.value) ?? scenarios[0])
const horizonMultiplier = computed(() => ({ 30: 0.72, 90: 1, 180: 1.28 }[filters.scenarios]))
const projectedImpact = computed(() => Math.min(99, Math.round((activeScenario.value.impact * 0.7 + scenarioDemand.value * 0.45 + simulationRun.value) * horizonMultiplier.value)))
const projectedConfidence = computed(() => Math.max(64, Math.round(activeScenario.value.probability + 18 - Math.abs(scenarioDemand.value - 18) * 0.35)))

const pageMetrics = computed(() => {
  if (activePage.value === 'overview') {
    return [
      { label: 'VOLUME ANALISADO*', value: overview.value.volume, decimals: 1, suffix: ' TB', caption: 'AMBIENTE DEMONSTRATIVO' },
      { label: 'FONTES CONECTADAS*', value: overview.value.sources, suffix: '', caption: 'ESTRUTURADAS + NÃO ESTRUT.' },
      { label: 'PADRÕES ENCONTRADOS*', value: overview.value.patterns, suffix: '', caption: 'NO CICLO SIMULADO' },
    ]
  }
  if (activePage.value === 'sources') {
    return [
      { label: 'FONTES VISÍVEIS*', value: filteredSources.value.length, suffix: '', caption: activeFilterLabel.value },
      { label: 'REGISTROS PROCESSADOS*', value: activeSource.value?.records ?? 0, decimals: 1, suffix: ' M', caption: 'NA FONTE SELECIONADA' },
      { label: 'COMPLETUDE MÉDIA*', value: activeSource.value?.completeness ?? 0, suffix: '%', caption: 'QUALIDADE OBSERVADA' },
    ]
  }
  if (activePage.value === 'models') {
    return [
      { label: 'MODELOS VISÍVEIS*', value: filteredModels.value.length, suffix: '', caption: activeFilterLabel.value },
      { label: 'ADERÊNCIA ATUAL*', value: activeModel.value?.score ?? 0, decimals: 1, suffix: '%', caption: 'MODELO SELECIONADO' },
      { label: 'EXECUÇÕES ACUMULADAS*', value: activeModel.value?.runs ?? 0, suffix: '', caption: 'AMBIENTE CONCEITUAL' },
    ]
  }
  return [
    { label: 'IMPACTO PROJETADO*', value: projectedImpact.value, suffix: '', caption: 'ÍNDICE COMPOSTO' },
    { label: 'CONFIANÇA DO CENÁRIO*', value: projectedConfidence.value, suffix: '%', caption: activeFilterLabel.value },
    { label: 'VARIAÇÃO DE DEMANDA*', value: scenarioDemand.value, suffix: '%', caption: 'ENTRADA DA SIMULAÇÃO' },
  ]
})

const formatPercent = (value) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)

const selectPage = (page) => {
  activePage.value = page.id
  announcement.value = `${page.label} selecionada. ${pageHeaders[page.id].title}`
}

const announceFilter = () => {
  announcement.value = `Filtro alterado para ${activeFilterLabel.value.toLowerCase()}`
}

const selectSource = (source) => {
  selectedSourceId.value = source.id
  announcement.value = `Fonte ${source.name} selecionada`
}

const syncSource = () => {
  if (!activeSource.value || syncingSourceId.value) return
  const id = activeSource.value.id
  const name = activeSource.value.name
  syncingSourceId.value = id
  window.clearTimeout(syncTimer)
  syncTimer = window.setTimeout(() => {
    sourceSyncTimes[id] = 'Agora'
    syncingSourceId.value = null
    announcement.value = `${name} sincronizada com sucesso`
  }, 900)
}

const selectModel = (model) => {
  selectedModelId.value = model.id
  announcement.value = `Modelo ${model.name} selecionado`
}

const diagnoseModel = () => {
  if (!activeModel.value || diagnosingModelId.value) return
  const id = activeModel.value.id
  const name = activeModel.value.name
  diagnosingModelId.value = id
  window.clearTimeout(diagnosticTimer)
  diagnosticTimer = window.setTimeout(() => {
    diagnosedAt[id] = 'Diagnóstico concluído agora'
    diagnosingModelId.value = null
    announcement.value = `Diagnóstico do modelo ${name} concluído`
  }, 1100)
}

const selectScenario = (scenario) => {
  selectedScenarioId.value = scenario.id
  announcement.value = `Cenário ${scenario.name} selecionado`
}

const runSimulation = () => {
  if (simulating.value) return
  simulating.value = true
  window.clearTimeout(simulationTimer)
  simulationTimer = window.setTimeout(() => {
    simulationRun.value += 1
    simulating.value = false
    announcement.value = `Simulação concluída. Impacto projetado ${projectedImpact.value}`
  }, 1000)
}

watch(filteredSources, (items) => {
  if (items.length && !items.some((source) => source.id === selectedSourceId.value)) selectedSourceId.value = items[0].id
})

watch(filteredModels, (items) => {
  if (items.length && !items.some((model) => model.id === selectedModelId.value)) selectedModelId.value = items[0].id
})

onBeforeUnmount(() => {
  window.clearTimeout(syncTimer)
  window.clearTimeout(diagnosticTimer)
  window.clearTimeout(simulationTimer)
})
</script>

<template>
  <div class="prototype-shell mt-[clamp(4rem,8vw,8rem)] overflow-hidden rounded-[.7rem] border border-white/[.22] bg-[#0b0b0b] shadow-[0_2rem_8rem_rgba(0,0,0,.55)] max-[640px]:mx-[-.75rem]">
    <div class="grid min-h-[3.9rem] grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--line)] px-[1.15rem] font-mono text-[.55rem] tracking-[.08em] max-[640px]:grid-cols-[1fr_auto] max-[640px]:px-[.8rem]">
      <div class="flex items-center gap-[.6rem]"><KairosMark compact /> <span class="text-[var(--muted)] max-[640px]:hidden">KAIROS / SIGNAL ROOM</span></div>
      <div class="flex items-center gap-[.6rem]"><span class="status-dot inline-block size-[.42rem] flex-none rounded-full bg-[var(--white)]" /> PROTÓTIPO INTERATIVO</div>
      <div class="justify-self-end text-[var(--muted)] max-[640px]:hidden">CONCEITO / V0.2</div>
    </div>

    <div class="grid min-h-[43rem] grid-cols-[11.5rem_1fr] max-[1180px]:grid-cols-[9.5rem_1fr] max-[900px]:grid-cols-1">
      <nav class="flex flex-col border-r border-[var(--line)] px-[.7rem] pt-[1.7rem] pb-4 max-[900px]:hidden" aria-label="Telas do protótipo">
        <span class="mx-[.7rem] mb-4 font-mono text-[.5rem] tracking-[.08em] text-[#666]">ESPAÇO DE TRABALHO</span>
        <button
          v-for="page in navItems"
          :key="page.id"
          class="flex min-h-[2.7rem] w-full cursor-pointer items-center gap-3 rounded-[.3rem] border-0 bg-transparent px-[.7rem] text-left text-[.68rem] text-[#777] transition-[color,background] duration-200 ease-[ease] hover:bg-white/[.045] hover:text-[var(--white)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] max-[1180px]:text-[.6rem]"
          :class="activePage === page.id ? 'bg-white/[.08] text-[var(--white)]' : ''"
          type="button"
          :aria-current="activePage === page.id ? 'page' : undefined"
          @click="selectPage(page)"
        >
          <i class="w-4 text-[.9rem] font-normal not-italic text-[#8e8e8e]" aria-hidden="true">{{ page.icon }}</i> {{ page.label }}
        </button>
        <div class="mt-auto flex flex-col gap-[.45rem] border-t border-[var(--line)] px-[.7rem] pt-4 font-mono text-[.48rem]">
          <span class="text-[#666]">PIPELINE</span>
          <strong class="flex items-center gap-[.4rem] font-normal"><i class="status-dot inline-block size-[.3rem] flex-none rounded-full bg-[var(--white)]" /> FLUXO CONCEITUAL</strong>
        </div>
      </nav>

      <div class="relative min-w-0 p-[clamp(1.25rem,2vw,2rem)] max-[640px]:p-3">
        <nav class="hidden max-[900px]:mb-[1.1rem] max-[900px]:mt-[-.25rem] max-[900px]:flex max-[900px]:gap-[.35rem] max-[900px]:overflow-x-auto max-[900px]:pb-1 max-[900px]:[scrollbar-width:thin]" aria-label="Telas do protótipo">
          <button
            v-for="page in navItems"
            :key="page.id"
            type="button"
            class="min-h-11 flex-none cursor-pointer rounded-[.25rem] border border-[var(--line)] bg-transparent px-[.85rem] text-[.65rem] text-[#888] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)]"
            :class="activePage === page.id ? 'bg-white/[.09] text-[var(--white)]' : ''"
            :aria-current="activePage === page.id ? 'page' : undefined"
            @click="selectPage(page)"
          >
            {{ page.label }}
          </button>
        </nav>

        <header class="flex items-end justify-between pb-[1.6rem] max-[640px]:flex-wrap max-[640px]:items-start max-[640px]:gap-4">
          <div>
            <span class="font-mono text-[.56rem] tracking-[.08em] text-[#8c8c8c]">{{ activeHeader.eyebrow }} / {{ activeFilterLabel }}</span>
            <h3 class="mt-[.4rem] text-[clamp(1.25rem,2vw,1.8rem)] font-medium tracking-[-.04em] outline-none">{{ activeHeader.title }}</h3>
          </div>
          <label class="relative flex min-h-[2.15rem] items-center rounded-[.25rem] border border-[var(--line)] bg-transparent p-0 font-mono text-[.48rem] tracking-[.07em] text-[#999] max-[640px]:w-full">
            <span class="sr-only">Filtrar {{ activeHeader.eyebrow.toLowerCase() }}</span>
            <select class="min-h-[2.15rem] cursor-pointer appearance-none border-0 bg-transparent py-0 pr-8 pl-[.65rem] font-[inherit] tracking-[inherit] text-inherit outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] max-[640px]:w-full [&>option]:bg-[#111] [&>option]:text-[var(--white)]" v-model="activeFilter" @change="announceFilter">
              <option v-for="option in activeFilterOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <i class="pointer-events-none absolute right-[.65rem] not-italic" aria-hidden="true">⌄</i>
          </label>
        </header>

        <Transition name="prototype-page" mode="out-in">
          <div :key="activePage" class="min-w-0" role="region" :aria-label="activeHeader.title">
            <template v-if="activePage === 'overview'">
              <div class="grid grid-cols-[minmax(0,1.65fr)_minmax(15rem,.7fr)] gap-3 max-[1180px]:grid-cols-[1fr_14.5rem] max-[900px]:grid-cols-1">
                <article class="min-w-0 rounded-[.3rem] border border-[var(--line)] bg-white/[.015] px-[1.1rem] pt-[1.1rem] pb-[.9rem] max-[640px]:px-[.8rem] max-[640px]:pt-[.9rem] max-[640px]:pb-[.7rem]">
                  <div class="flex items-start justify-between">
                    <div class="flex flex-col gap-[.3rem]"><span class="font-mono text-[.56rem] tracking-[.08em] text-[#8c8c8c]">SINAL PRIORITÁRIO</span><strong class="text-[.75rem] font-medium">{{ overview.label }}</strong></div>
                    <span class="rounded-[.2rem] border border-white/[.18] px-[.45rem] py-[.3rem] font-mono text-[.56rem] tracking-[.08em] text-[#bbb] max-[640px]:hidden">{{ overview.badge }}</span>
                  </div>
                  <div class="mt-[2.3rem] flex items-end gap-[.8rem] max-[640px]:mt-[1.7rem]">
                    <strong class="font-display text-[clamp(2.6rem,5vw,4.4rem)] font-normal leading-[.9]">+{{ formatPercent(overview.metric) }}%</strong>
                    <span class="pb-[.4rem] text-[.58rem] text-[#777]">vs. período anterior</span>
                  </div>
                  <div class="relative mt-[1.2rem] h-[15.5rem] max-[640px]:h-[13rem]" role="img" :aria-label="`Gráfico mostrando tendência crescente de ${formatPercent(overview.metric)} por cento no período`">
                    <div class="absolute inset-x-0 top-0 bottom-[1.6rem] bg-[linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] [background-size:25%_25%]" />
                    <svg class="absolute inset-x-0 top-0 bottom-[1.6rem] h-[calc(100%-1.6rem)] w-full overflow-visible" :key="filters.overview" viewBox="0 0 760 210" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="white" stop-opacity=".16" />
                          <stop offset="100%" stop-color="white" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                      <path class="fill-[url(#area-fill)]" :d="overview.area" />
                      <path
                        class="prototype-chart-line fill-none stroke-[var(--white)]"
                        :d="overview.line"
                        stroke-width="1.4"
                        vector-effect="non-scaling-stroke"
                        stroke-dasharray="1200"
                        stroke-dashoffset="1200"
                      />
                    </svg>
                    <span class="absolute top-[4%] right-0 flex items-center gap-[.35rem] bg-[var(--white)] px-[.38rem] py-[.28rem] font-mono text-[.48rem] text-[var(--black)]"><i class="size-[.27rem] rounded-full bg-[var(--black)]" />{{ formatPercent(overview.metric) }}%</span>
                    <div class="absolute inset-x-0 bottom-0 flex justify-between font-mono text-[.43rem] text-[#777]"><span v-for="axis in overview.axes" :key="axis" class="max-[640px]:even:hidden">{{ axis }}</span></div>
                  </div>
                </article>

                <article class="flex flex-col rounded-[.3rem] border border-[var(--line)] bg-white/[.015] p-[1.1rem] max-[900px]:min-h-[24rem] max-[640px]:min-h-[22rem]">
                  <header class="flex items-center justify-between border-b border-[var(--line)] pb-4"><span class="font-mono text-[.56rem] tracking-[.08em] text-[#8c8c8c]">SINAIS DETECTADOS</span><b class="grid size-6 place-items-center rounded-full border border-[var(--line)] font-mono text-[.48rem] font-normal">{{ String(overview.signals.length).padStart(2, '0') }}</b></header>
                  <div v-for="(signal, index) in overview.signals" :key="signal.title" class="grid grid-cols-[auto_1fr_auto] items-start gap-[.7rem] border-b border-[var(--line)] py-[1.3rem]">
                    <span class="font-mono text-[.46rem] text-[#555]">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div class="flex flex-col gap-[.32rem]"><strong class="text-[.67rem] font-medium">{{ signal.title }}</strong><span class="text-[.52rem] text-[#858585]">{{ signal.detail }}</span></div>
                    <em class="font-mono text-[.5rem] not-italic">{{ signal.value }}</em>
                  </div>
                  <footer class="mt-auto flex justify-between pt-4 font-mono text-[.43rem] text-[#797979]"><span>SIMULAÇÃO / KRS-04</span><span>ADERÊNCIA {{ overview.adherence }}</span></footer>
                </article>
              </div>
            </template>

            <template v-else-if="activePage === 'sources'">
              <div class="grid min-h-[31.25rem] grid-cols-[minmax(0,1.35fr)_minmax(17rem,.65fr)] gap-3 max-[1180px]:grid-cols-[minmax(0,1fr)_14.5rem] max-[900px]:min-h-0 max-[900px]:grid-cols-1">
                <section class="min-w-0 overflow-hidden rounded-[.3rem] border border-[var(--line)] bg-white/[.015]" aria-label="Lista de fontes">
                  <header class="flex min-h-[3.8rem] items-center justify-between border-b border-[var(--line)] px-[1.1rem]"><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">FONTES DISPONÍVEIS</span><b class="grid size-6 place-items-center rounded-full border border-[var(--line)] font-mono text-[.48rem] font-normal">{{ String(filteredSources.length).padStart(2, '0') }}</b></header>
                  <button
                    v-for="source in filteredSources"
                    :key="source.id"
                    class="grid min-h-[5.25rem] w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.8rem] border-0 border-b border-[var(--line)] bg-transparent px-[1.1rem] py-[.85rem] text-left text-inherit transition-[background] duration-200 ease-[ease] last:border-b-0 hover:bg-white/[.035] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] max-[640px]:grid-cols-[auto_minmax(0,1fr)]"
                    :class="activeSource?.id === source.id ? 'bg-white/[.075] hover:bg-white/[.075]' : ''"
                    type="button"
                    @click="selectSource(source)"
                  >
                    <span class="grid size-8 place-items-center rounded-full border border-[var(--line)] font-mono text-[#aaa]" aria-hidden="true">◌</span>
                    <span class="flex min-w-0 flex-col gap-[.35rem]"><strong class="overflow-hidden text-ellipsis whitespace-nowrap text-[.72rem] font-medium">{{ source.name }}</strong><small class="overflow-hidden text-ellipsis whitespace-nowrap text-[.52rem] text-[#777]">{{ source.type }} · {{ source.volume }}% do volume</small></span>
                    <em class="font-mono text-[.45rem] not-italic tracking-[.05em] max-[640px]:hidden" :class="source.status === 'attention' ? 'text-[#d5b98c]' : 'text-[#999]'">{{ source.statusLabel }}</em>
                  </button>
                </section>

                <article v-if="activeSource" class="flex min-w-0 flex-col rounded-[.3rem] border border-[var(--line)] bg-white/[.015] p-5 max-[900px]:min-h-[25rem]">
                  <div class="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
                    <div><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">FONTE SELECIONADA</span><h4 class="mt-[.45rem] text-base font-medium tracking-[-.03em]">{{ activeSource.name }}</h4></div>
                    <em class="font-mono text-[.45rem] not-italic tracking-[.05em]" :class="activeSource.status === 'attention' ? 'text-[#d5b98c]' : 'text-[#999]'">{{ activeSource.statusLabel }}</em>
                  </div>
                  <dl class="mt-[1.2rem] grid gap-0">
                    <div class="flex items-center justify-between gap-4 border-b border-[var(--line)] py-[.85rem]"><dt class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">ÚLTIMA SINCRONIZAÇÃO</dt><dd class="m-0 text-right font-mono text-[.55rem] text-[#d0d0d0]">{{ sourceSyncTimes[activeSource.id] ?? activeSource.freshness }}</dd></div>
                    <div class="flex items-center justify-between gap-4 border-b border-[var(--line)] py-[.85rem]"><dt class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">CADÊNCIA</dt><dd class="m-0 text-right font-mono text-[.55rem] text-[#d0d0d0]">{{ activeSource.cadence }}</dd></div>
                    <div class="flex items-center justify-between gap-4 border-b border-[var(--line)] py-[.85rem]"><dt class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">REGISTROS</dt><dd class="m-0 text-right font-mono text-[.55rem] text-[#d0d0d0]">{{ activeSource.records }} M</dd></div>
                  </dl>
                  <div class="mt-[1.4rem]">
                    <div class="flex justify-between"><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">COMPLETUDE DOS DADOS</span><strong class="font-mono text-[.58rem] font-normal">{{ activeSource.completeness }}%</strong></div>
                    <i class="mt-[.7rem] block h-0.5 bg-white/10"><b class="block h-full bg-[var(--white)] transition-[width] duration-[600ms] ease-[var(--ease-out)]" :style="{ width: `${activeSource.completeness}%` }" /></i>
                  </div>
                  <button class="mt-auto flex min-h-[2.8rem] w-full cursor-pointer items-center justify-between rounded-[.25rem] border border-white/[.24] bg-transparent px-[.85rem] font-mono text-[.5rem] tracking-[.06em] text-[var(--white)] transition-[background,color] duration-200 ease-[ease] hover:not-disabled:bg-[var(--white)] hover:not-disabled:text-[var(--black)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] disabled:cursor-wait disabled:opacity-55" type="button" :disabled="syncingSourceId === activeSource.id" @click="syncSource">
                    {{ syncingSourceId === activeSource.id ? 'SINCRONIZANDO…' : 'SINCRONIZAR AGORA' }} <span aria-hidden="true">↻</span>
                  </button>
                </article>
              </div>
            </template>

            <template v-else-if="activePage === 'models'">
              <div class="grid min-h-[31.25rem] grid-cols-[minmax(0,1.35fr)_minmax(17rem,.65fr)] gap-3 max-[1180px]:grid-cols-[minmax(0,1fr)_14.5rem] max-[900px]:min-h-0 max-[900px]:grid-cols-1">
                <section class="min-w-0 overflow-hidden rounded-[.3rem] border border-[var(--line)] bg-white/[.015]" aria-label="Lista de modelos">
                  <header class="flex min-h-[3.8rem] items-center justify-between border-b border-[var(--line)] px-[1.1rem]"><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">MODELOS DISPONÍVEIS</span><b class="grid size-6 place-items-center rounded-full border border-[var(--line)] font-mono text-[.48rem] font-normal">{{ String(filteredModels.length).padStart(2, '0') }}</b></header>
                  <button
                    v-for="model in filteredModels"
                    :key="model.id"
                    class="grid min-h-[5.25rem] w-full cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-[.8rem] border-0 border-b border-[var(--line)] bg-transparent px-[1.1rem] py-[.85rem] text-left text-inherit transition-[background] duration-200 ease-[ease] last:border-b-0 hover:bg-white/[.035] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] max-[640px]:grid-cols-[auto_minmax(0,1fr)]"
                    :class="activeModel?.id === model.id ? 'bg-white/[.075] hover:bg-white/[.075]' : ''"
                    type="button"
                    @click="selectModel(model)"
                  >
                    <span class="grid size-8 place-items-center rounded-full border border-[var(--line)] font-mono text-[#aaa]" aria-hidden="true">⌇</span>
                    <span class="flex min-w-0 flex-col gap-[.35rem]"><strong class="overflow-hidden text-ellipsis whitespace-nowrap text-[.72rem] font-medium">{{ model.name }}</strong><small class="overflow-hidden text-ellipsis whitespace-nowrap text-[.52rem] text-[#777]">{{ model.family }} · {{ model.features }} variáveis</small></span>
                    <em class="font-mono text-[.45rem] not-italic tracking-[.05em] max-[640px]:hidden" :class="model.status === 'monitoring' ? 'text-[#d5b98c]' : 'text-[#999]'">{{ model.statusLabel }}</em>
                  </button>
                </section>

                <article v-if="activeModel" class="flex min-w-0 flex-col rounded-[.3rem] border border-[var(--line)] bg-white/[.015] p-5 max-[900px]:min-h-[25rem]">
                  <div class="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
                    <div><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">MODELO SELECIONADO</span><h4 class="mt-[.45rem] text-base font-medium tracking-[-.03em]">{{ activeModel.name }}</h4></div>
                    <em class="font-mono text-[.45rem] not-italic tracking-[.05em]" :class="activeModel.status === 'monitoring' ? 'text-[#d5b98c]' : 'text-[#999]'">{{ activeModel.statusLabel }}</em>
                  </div>
                  <div class="mt-6 flex items-end gap-3"><strong class="font-display text-[clamp(2.5rem,4vw,3.8rem)] font-normal leading-[.9]">{{ formatPercent(activeModel.score) }}%</strong><span class="pb-[.35rem] font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">ADERÊNCIA ATUAL</span></div>
                  <dl class="mt-[1.2rem] grid gap-0">
                    <div class="flex items-center justify-between gap-4 border-b border-[var(--line)] py-[.85rem]"><dt class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">DRIFT OBSERVADO</dt><dd class="m-0 text-right font-mono text-[.55rem] text-[#d0d0d0]">{{ formatPercent(activeModel.drift) }}%</dd></div>
                    <div class="flex items-center justify-between gap-4 border-b border-[var(--line)] py-[.85rem]"><dt class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">ÚLTIMA ATUALIZAÇÃO</dt><dd class="m-0 text-right font-mono text-[.55rem] text-[#d0d0d0]">{{ activeModel.updated }}</dd></div>
                    <div class="flex items-center justify-between gap-4 border-b border-[var(--line)] py-[.85rem]"><dt class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">VARIÁVEIS</dt><dd class="m-0 text-right font-mono text-[.55rem] text-[#d0d0d0]">{{ activeModel.features }}</dd></div>
                  </dl>
                  <p v-if="diagnosedAt[activeModel.id]" class="mt-4 flex items-center gap-[.45rem] font-mono text-[.48rem] text-[#aaa]"><i class="status-dot inline-block size-[.3rem] flex-none rounded-full bg-[var(--white)]" /> {{ diagnosedAt[activeModel.id] }}</p>
                  <button class="mt-auto flex min-h-[2.8rem] w-full cursor-pointer items-center justify-between rounded-[.25rem] border border-white/[.24] bg-transparent px-[.85rem] font-mono text-[.5rem] tracking-[.06em] text-[var(--white)] transition-[background,color] duration-200 ease-[ease] hover:not-disabled:bg-[var(--white)] hover:not-disabled:text-[var(--black)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] disabled:cursor-wait disabled:opacity-55" type="button" :disabled="diagnosingModelId === activeModel.id" @click="diagnoseModel">
                    {{ diagnosingModelId === activeModel.id ? 'DIAGNOSTICANDO…' : 'EXECUTAR DIAGNÓSTICO' }} <span aria-hidden="true">→</span>
                  </button>
                </article>
              </div>
            </template>

            <template v-else>
              <div class="grid grid-cols-3 gap-3 max-[640px]:grid-cols-1" aria-label="Cenários disponíveis">
                <button
                  v-for="scenario in scenarios"
                  :key="scenario.id"
                  class="flex min-h-40 min-w-0 cursor-pointer flex-col items-start rounded-[.3rem] border border-[var(--line)] bg-white/[.015] p-4 text-left text-inherit transition-[border-color,background] duration-200 ease-[ease] hover:border-white/[.42] hover:bg-white/[.055] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] max-[640px]:min-h-[8.5rem]"
                  :class="activeScenario.id === scenario.id ? 'border-white/[.42] bg-white/[.055]' : ''"
                  type="button"
                  @click="selectScenario(scenario)"
                >
                  <span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">{{ scenario.risk }}</span>
                  <strong class="mt-[.8rem] text-[.78rem] font-medium">{{ scenario.name }}</strong>
                  <small class="mt-2 text-[.55rem] leading-normal text-[#888]">{{ scenario.description }}</small>
                  <em class="mt-auto pt-[.8rem] font-mono text-[.5rem] not-italic tracking-[.08em] text-[#8c8c8c]">{{ Math.round(scenario.probability * horizonMultiplier) }}% PROB.</em>
                </button>
              </div>
              <section class="mt-3 grid min-h-[20.5rem] grid-cols-[minmax(0,1.3fr)_minmax(15rem,.7fr)] rounded-[.3rem] border border-[var(--line)] bg-white/[.015] max-[640px]:grid-cols-1">
                <div class="flex flex-col border-r border-[var(--line)] p-5 max-[640px]:border-r-0 max-[640px]:border-b">
                  <span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">SIMULADOR / {{ activeScenario.name.toUpperCase() }}</span>
                  <h4 class="mt-[.45rem] text-base font-medium tracking-[-.03em]">Variação de demanda</h4>
                  <div class="mt-[2.2rem] font-display text-[clamp(2.8rem,5vw,4.2rem)] leading-none">+{{ scenarioDemand }}%</div>
                  <label class="mt-[1.6rem]">
                    <span class="sr-only">Variação de demanda</span>
                    <input class="w-full cursor-ew-resize accent-[var(--white)]" v-model.number="scenarioDemand" type="range" min="0" max="48" step="1" />
                  </label>
                  <div class="mt-[.45rem] flex justify-between"><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">0%</span><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">+24%</span><span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">+48%</span></div>
                </div>
                <div class="flex flex-col p-5">
                  <span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]">IMPACTO PROJETADO</span>
                  <strong class="mt-[1.4rem] font-display text-[clamp(3.5rem,6vw,5.5rem)] font-normal leading-[.9]">{{ projectedImpact }}</strong>
                  <p class="mt-4 mb-6 text-[.62rem] leading-[1.6] text-[#888]">Confiança do cenário em {{ projectedConfidence }}% para {{ activeFilterLabel.toLowerCase() }}.</p>
                  <button class="mt-auto flex min-h-[2.8rem] w-full cursor-pointer items-center justify-between rounded-[.25rem] border border-white/[.24] bg-transparent px-[.85rem] font-mono text-[.5rem] tracking-[.06em] text-[var(--white)] transition-[background,color] duration-200 ease-[ease] hover:not-disabled:bg-[var(--white)] hover:not-disabled:text-[var(--black)] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--white)] disabled:cursor-wait disabled:opacity-55" type="button" :disabled="simulating" @click="runSimulation">
                    {{ simulating ? 'CALCULANDO…' : 'RODAR SIMULAÇÃO' }} <span class="font-mono text-[.5rem] tracking-[.08em] text-[#8c8c8c]" aria-hidden="true">↗</span>
                  </button>
                </div>
              </section>
            </template>

            <div class="mt-3 grid grid-cols-3 gap-3 max-[640px]:grid-cols-1">
              <article class="flex flex-col rounded-[.3rem] border border-[var(--line)] bg-white/[.015] px-[1.1rem] py-4 max-[640px]:grid max-[640px]:grid-cols-[1fr_auto] max-[640px]:items-center" v-for="metric in pageMetrics" :key="`${activePage}-${activeFilter}-${metric.label}-${metric.value}`">
                <span class="font-mono text-[.56rem] tracking-[.08em] text-[#8c8c8c]">{{ metric.label }}</span>
                <strong class="my-[.55rem] mb-[.3rem] font-display text-[clamp(1.75rem,3vw,2.6rem)] font-normal leading-none max-[640px]:col-start-2 max-[640px]:row-span-2 max-[640px]:row-start-1 max-[640px]:m-0"><CountUp :value="metric.value" :decimals="metric.decimals ?? 0" :suffix="metric.suffix" /></strong>
                <small class="font-mono text-[.43rem] tracking-[.06em] text-[#777]">{{ metric.caption }}</small>
              </article>
            </div>
          </div>
        </Transition>
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prototype-shell.is-visible .prototype-chart-line {
  animation: chart-draw 2.2s var(--ease-out) 0.3s forwards;
}

@keyframes chart-draw {
  to { stroke-dashoffset: 0; }
}

.prototype-page-enter-active,
.prototype-page-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.prototype-page-enter-from {
  opacity: 0;
  transform: translateY(0.4rem);
}

.prototype-page-leave-to {
  opacity: 0;
  transform: translateY(-0.25rem);
}
</style>
