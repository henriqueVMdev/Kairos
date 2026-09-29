<script setup>
import { computed, ref } from 'vue'
import { useUploadStore, TIPOS_ERRO } from '../Stores/uploadStore.js'
import FileUploadCard from '../Components/FileUploadCard.vue'

const store = useUploadStore()
const filtroTipo = ref('')
const errosFiltrados = computed(() =>
  store.errosDadosPlanilha.filter((e) => !filtroTipo.value || e.tipo === filtroTipo.value)
)
function escolherArquivo(files) {
  const file = files[0]
  if (file) {
    store.lerArquivo(file)
    store.adicionarArquivo(file)
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6">
      <p class="text-sm font-semibold uppercase text-retd-600">Upload</p>
      <h1 class="text-3xl font-bold text-kairos-white">Enviar planilha</h1>
      <p class="mt-2 text-kairos-muted">
        Selecione XLSX, XLS ou CSV. O arquivo será lido no navegador e os dados
        serão armazenados no Pinia.
      </p>
    </div>

    <div class="grid gap-6 ">
       <FileUploadCard class = "" @filesChange="escolherArquivo" />

        <p v-if="store.arquivo" class="mt-4 text-sm text-slate-700">
          Arquivo: <strong>{{ store.arquivo.name }}</strong>
        </p>

        <p v-if="store.erro" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {{ store.erro }}
        </p>

      <div class="rounded-2xl border border-white/10 bg-kairos-panel p-6 shadow-sm">
        <div class="justify-between flex flex-row">
          <div class="flex flex-col">
          <p class="text-lg font-display font-semibold text-kairos-white">Resumo</p>
          <p class="mt-2 text-3xl font-bold text-kairos-white">{{ store.totalLinhas }}</p>
          <p class="text-sm text-kairos-muted">linhas carregadas</p>
          </div>
          <p v-if="store.arquivo" class="">Arquivo: 
            <strong bg-kairos-white font-bold> {{ store.arquivo.name }}</strong></p>
        </div>
        <p class="mt-4 text-3xl font-bold text-kairos-white">{{ store.totalColunas }}</p>
        <p class="text-sm text-kairos-muted">colunas</p>

        <button
          v-if="store.dadosTratados.length"
          @click="store.limpar()"
          class="mt-5 rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Limpar
        </button>
      </div>
    </div>

    <div
      v-if="store.validado"
      class="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-kairos-panel shadow-sm"
    >
      <div class="border-b border-white/10 p-4">
        <h2 class="font-bold text-kairos-white">Relatório de validação</h2>
        <p class="text-sm text-kairos-muted">Arquivo analisado: <strong>{{ store.nomeArquivo }}</strong></p>
      </div>

      <div class="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
        <div>
          <p class="text-3xl font-bold text-kairos-white">{{ store.totalLinhas }}</p>
          <p class="text-sm text-kairos-muted">registros</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-green-500">{{ store.registrosValidos }}</p>
          <p class="text-sm text-kairos-muted">registros válidos</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-red-500">{{ store.registrosComErro }}</p>
          <p class="text-sm text-kairos-muted">registros com erro</p>
        </div>
        <div>
          <p class="text-3xl font-bold text-kairos-white">{{ store.totalErros }}</p>
          <p class="text-sm text-kairos-muted">erros encontrados</p>
        </div>
      </div>

      <table class="min-w-full text-sm">
        <thead class="bg-white/10">
          <tr>
            <th class="px-4 py-3 text-left font-semibold">Validação realizada</th>
            <th class="px-4 py-3 text-left font-semibold">Quantidade</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in store.errosPorTipo" :key="item.tipo" class="border-t border-white/10">
            <td class="px-4 py-2 text-kairos-muted">{{ item.descricao }}</td>
            <td class="px-4 py-2 font-semibold" :class="item.quantidade ? 'text-red-500' : 'text-kairos-muted'">
              {{ item.quantidade }}
            </td>
          </tr>
          <tr class="border-t border-white/10">
            <td class="px-4 py-2 text-kairos-muted">Registros válidos</td>
            <td class="px-4 py-2 font-semibold text-green-500">{{ store.registrosValidos }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.totalErros" class="border-t border-white/10">
        <div class="flex items-center justify-between gap-4 p-4">
          <h3 class="font-bold text-kairos-white">Detalhes dos erros</h3>
          <select v-model="filtroTipo" class="rounded-lg border border-white/10 bg-kairos-panel px-3 py-2 text-sm">
            <option value="">Todos os tipos</option>
            <option v-for="(descricao, tipo) in TIPOS_ERRO" :key="tipo" :value="tipo">{{ descricao }}</option>
          </select>
        </div>
        <div class="max-h-96 overflow-auto">
          <table class="min-w-full text-sm">
            <thead class="sticky top-0 bg-kairos-panel">
              <tr>
                <th class="px-4 py-3 text-left font-semibold">Linha</th>
                <th class="px-4 py-3 text-left font-semibold">Campo</th>
                <th class="px-4 py-3 text-left font-semibold">Tipo</th>
                <th class="px-4 py-3 text-left font-semibold">Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(e, i) in errosFiltrados" :key="i" class="border-t border-white/10">
                <td class="px-4 py-2">{{ e.linha }}</td>
                <td class="px-4 py-2">{{ e.campo }}</td>
                <td class="whitespace-nowrap px-4 py-2 text-kairos-muted">{{ TIPOS_ERRO[e.tipo] }}</td>
                <td class="px-4 py-2 text-kairos-muted">{{ e.mensagem }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p v-else class="border-t border-white/10 p-4 text-sm text-green-500">Nenhum erro encontrado.</p>
    </div>

    <div
      v-if="store.dadosTratados.length"
      class="mt-6 overflow-hidden rounded-2xl border bg-kairos-panel shadow-sm"
    >
      <div class="border-b border- p-4">
        <h2 class="font-bold">Prévia dos dados tratados</h2>
        <p class="text-sm text-kairos-muted">Mostrando até 10 linhas.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <thead class="bg-white/10">
            <tr>
              <th v-for="coluna in store.colunas"
                :key="coluna"
                class="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">
                {{ coluna }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(linha, indice) in store.dadosTratados.slice(0, 10)"
              :key="indice"
              class="border-t border-slate-100">
              
              <td
                v-for="coluna in store.colunas"
                :key="coluna"
                class="whitespace-nowrap px-4 py-3 text-slate-600"
              >
                {{ linha[coluna] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="mt-6 rounded-2xl border bg-kairos-muted p-5">
      <p class="font-semibold text-red-800">Próxima etapa do projeto</p>
      <p class="mt-1 text-sm text-red-700">
        Depois, uma action do Pinia poderá usar Axios para enviar os dados ao Spring Boot.
        O tratamento completo de Ciência de Dados ficará em Python/Pandas e a persistência
        ficará no PostgreSQL/Azure.
      </p>
    </div>
  </section>
</template>
