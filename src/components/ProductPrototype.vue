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
  <div class="product-frame">
    <div class="product-frame__bar">
      <div class="product-frame__brand"><KairosMark compact /> <span>KAIROS / SIGNAL ROOM</span></div>
      <div class="product-frame__mode"><span class="status-dot" /> PROTÓTIPO INTERATIVO</div>
      <div class="product-frame__time">CONCEITO / V0.2</div>
    </div>

    <div class="product-frame__body">
      <nav class="product-sidebar" aria-label="Telas do protótipo">
        <span class="product-sidebar__label">ESPAÇO DE TRABALHO</span>
        <button
          v-for="page in navItems"
          :key="page.id"
          class="product-nav-item"
          :class="{ 'is-active': activePage === page.id }"
          type="button"
          :aria-current="activePage === page.id ? 'page' : undefined"
          @click="selectPage(page)"
        >
          <i aria-hidden="true">{{ page.icon }}</i> {{ page.label }}
        </button>
        <div class="product-sidebar__foot">
          <span>PIPELINE</span>
          <strong><i class="status-dot" /> FLUXO CONCEITUAL</strong>
        </div>
      </nav>

      <div class="product-main">
        <nav class="product-mobile-nav" aria-label="Telas do protótipo">
          <button
            v-for="page in navItems"
            :key="page.id"
            type="button"
            :class="{ 'is-active': activePage === page.id }"
            :aria-current="activePage === page.id ? 'page' : undefined"
            @click="selectPage(page)"
          >
            {{ page.label }}
          </button>
        </nav>

        <header class="product-main__header">
          <div>
            <span>{{ activeHeader.eyebrow }} / {{ activeFilterLabel }}</span>
            <h3>{{ activeHeader.title }}</h3>
          </div>
          <label class="product-filter">
            <span class="sr-only">Filtrar {{ activeHeader.eyebrow.toLowerCase() }}</span>
            <select v-model="activeFilter" @change="announceFilter">
              <option v-for="option in activeFilterOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <i aria-hidden="true">⌄</i>
          </label>
        </header>

        <Transition name="prototype-page" mode="out-in">
          <div :key="activePage" class="prototype-page" role="region" :aria-label="activeHeader.title">
            <template v-if="activePage === 'overview'">
              <div class="signal-grid">
                <article class="signal-chart">
                  <div class="signal-chart__header">
                    <div><span>SINAL PRIORITÁRIO</span><strong>{{ overview.label }}</strong></div>
                    <span class="signal-badge">{{ overview.badge }}</span>
                  </div>
                  <div class="signal-chart__metric">
                    <strong>+{{ formatPercent(overview.metric) }}%</strong>
                    <span>vs. período anterior</span>
                  </div>
                  <div class="chart-visual" role="img" :aria-label="`Gráfico mostrando tendência crescente de ${formatPercent(overview.metric)} por cento no período`">
                    <div class="chart-visual__grid" />
                    <svg :key="filters.overview" viewBox="0 0 760 210" preserveAspectRatio="none" aria-hidden="true">
                      <defs>
                        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="white" stop-opacity=".16" />
                          <stop offset="100%" stop-color="white" stop-opacity="0" />
                        </linearGradient>
                      </defs>
                      <path class="chart-area" :d="overview.area" />
                      <path class="chart-line" :d="overview.line" />
                    </svg>
                    <span class="chart-marker"><i />{{ formatPercent(overview.metric) }}%</span>
                    <div class="chart-axis"><span v-for="axis in overview.axes" :key="axis">{{ axis }}</span></div>
                  </div>
                </article>

                <article class="signal-list">
                  <header><span>SINAIS DETECTADOS</span><b>{{ String(overview.signals.length).padStart(2, '0') }}</b></header>
                  <div v-for="(signal, index) in overview.signals" :key="signal.title" class="signal-list__item">
                    <span class="signal-list__index">{{ String(index + 1).padStart(2, '0') }}</span>
                    <div><strong>{{ signal.title }}</strong><span>{{ signal.detail }}</span></div>
                    <em>{{ signal.value }}</em>
                  </div>
                  <footer><span>SIMULAÇÃO / KRS-04</span><span>ADERÊNCIA {{ overview.adherence }}</span></footer>
                </article>
              </div>
            </template>

            <template v-else-if="activePage === 'sources'">
              <div class="prototype-workspace">
                <section class="prototype-list-panel" aria-label="Lista de fontes">
                  <header class="prototype-panel-header"><span>FONTES DISPONÍVEIS</span><b>{{ String(filteredSources.length).padStart(2, '0') }}</b></header>
                  <button
                    v-for="source in filteredSources"
                    :key="source.id"
                    class="prototype-list-row"
                    :class="{ 'is-active': activeSource?.id === source.id }"
                    type="button"
                    @click="selectSource(source)"
                  >
                    <span class="prototype-list-row__icon" aria-hidden="true">◌</span>
                    <span><strong>{{ source.name }}</strong><small>{{ source.type }} · {{ source.volume }}% do volume</small></span>
                    <em :class="`is-${source.status}`">{{ source.statusLabel }}</em>
                  </button>
                </section>

                <article v-if="activeSource" class="prototype-detail-panel">
                  <div class="prototype-detail-panel__head">
                    <div><span>FONTE SELECIONADA</span><h4>{{ activeSource.name }}</h4></div>
                    <em :class="`is-${activeSource.status}`">{{ activeSource.statusLabel }}</em>
                  </div>
                  <dl class="prototype-detail-stats">
                    <div><dt>ÚLTIMA SINCRONIZAÇÃO</dt><dd>{{ sourceSyncTimes[activeSource.id] ?? activeSource.freshness }}</dd></div>
                    <div><dt>CADÊNCIA</dt><dd>{{ activeSource.cadence }}</dd></div>
                    <div><dt>REGISTROS</dt><dd>{{ activeSource.records }} M</dd></div>
                  </dl>
                  <div class="prototype-progress">
                    <div><span>COMPLETUDE DOS DADOS</span><strong>{{ activeSource.completeness }}%</strong></div>
                    <i><b :style="{ width: `${activeSource.completeness}%` }" /></i>
                  </div>
                  <button class="prototype-action" type="button" :disabled="syncingSourceId === activeSource.id" @click="syncSource">
                    {{ syncingSourceId === activeSource.id ? 'SINCRONIZANDO…' : 'SINCRONIZAR AGORA' }} <span aria-hidden="true">↻</span>
                  </button>
                </article>
              </div>
            </template>

            <template v-else-if="activePage === 'models'">
              <div class="prototype-workspace">
                <section class="prototype-list-panel" aria-label="Lista de modelos">
                  <header class="prototype-panel-header"><span>MODELOS DISPONÍVEIS</span><b>{{ String(filteredModels.length).padStart(2, '0') }}</b></header>
                  <button
                    v-for="model in filteredModels"
                    :key="model.id"
                    class="prototype-list-row"
                    :class="{ 'is-active': activeModel?.id === model.id }"
                    type="button"
                    @click="selectModel(model)"
                  >
                    <span class="prototype-list-row__icon" aria-hidden="true">⌇</span>
                    <span><strong>{{ model.name }}</strong><small>{{ model.family }} · {{ model.features }} variáveis</small></span>
                    <em :class="`is-${model.status}`">{{ model.statusLabel }}</em>
                  </button>
                </section>

                <article v-if="activeModel" class="prototype-detail-panel">
                  <div class="prototype-detail-panel__head">
                    <div><span>MODELO SELECIONADO</span><h4>{{ activeModel.name }}</h4></div>
                    <em :class="`is-${activeModel.status}`">{{ activeModel.statusLabel }}</em>
                  </div>
                  <div class="prototype-score"><strong>{{ formatPercent(activeModel.score) }}%</strong><span>ADERÊNCIA ATUAL</span></div>
                  <dl class="prototype-detail-stats">
                    <div><dt>DRIFT OBSERVADO</dt><dd>{{ formatPercent(activeModel.drift) }}%</dd></div>
                    <div><dt>ÚLTIMA ATUALIZAÇÃO</dt><dd>{{ activeModel.updated }}</dd></div>
                    <div><dt>VARIÁVEIS</dt><dd>{{ activeModel.features }}</dd></div>
                  </dl>
                  <p v-if="diagnosedAt[activeModel.id]" class="prototype-result"><i class="status-dot" /> {{ diagnosedAt[activeModel.id] }}</p>
                  <button class="prototype-action" type="button" :disabled="diagnosingModelId === activeModel.id" @click="diagnoseModel">
                    {{ diagnosingModelId === activeModel.id ? 'DIAGNOSTICANDO…' : 'EXECUTAR DIAGNÓSTICO' }} <span aria-hidden="true">→</span>
                  </button>
                </article>
              </div>
            </template>

            <template v-else>
              <div class="scenario-cards" aria-label="Cenários disponíveis">
                <button
                  v-for="scenario in scenarios"
                  :key="scenario.id"
                  class="scenario-card"
                  :class="{ 'is-active': activeScenario.id === scenario.id }"
                  type="button"
                  @click="selectScenario(scenario)"
                >
                  <span>{{ scenario.risk }}</span>
                  <strong>{{ scenario.name }}</strong>
                  <small>{{ scenario.description }}</small>
                  <em>{{ Math.round(scenario.probability * horizonMultiplier) }}% PROB.</em>
                </button>
              </div>
              <section class="scenario-simulator">
                <div class="scenario-simulator__controls">
                  <span>SIMULADOR / {{ activeScenario.name.toUpperCase() }}</span>
                  <h4>Variação de demanda</h4>
                  <div class="scenario-range__value">+{{ scenarioDemand }}%</div>
                  <label class="scenario-range">
                    <span class="sr-only">Variação de demanda</span>
                    <input v-model.number="scenarioDemand" type="range" min="0" max="48" step="1" />
                  </label>
                  <div class="scenario-range__axis"><span>0%</span><span>+24%</span><span>+48%</span></div>
                </div>
                <div class="scenario-simulator__result">
                  <span>IMPACTO PROJETADO</span>
                  <strong>{{ projectedImpact }}</strong>
                  <p>Confiança do cenário em {{ projectedConfidence }}% para {{ activeFilterLabel.toLowerCase() }}.</p>
                  <button class="prototype-action" type="button" :disabled="simulating" @click="runSimulation">
                    {{ simulating ? 'CALCULANDO…' : 'RODAR SIMULAÇÃO' }} <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </section>
            </template>

            <div class="product-metrics">
              <article v-for="metric in pageMetrics" :key="`${activePage}-${activeFilter}-${metric.label}-${metric.value}`">
                <span>{{ metric.label }}</span>
                <strong><CountUp :value="metric.value" :decimals="metric.decimals ?? 0" :suffix="metric.suffix" /></strong>
                <small>{{ metric.caption }}</small>
              </article>
            </div>
          </div>
        </Transition>
        <p class="sr-only" aria-live="polite">{{ announcement }}</p>
      </div>
    </div>
  </div>
</template>
