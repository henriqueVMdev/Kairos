import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'

const CAMPOS_OBRIGATORIOS = ['nome', 'email', 'segmento', 'nivel_cliente']
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Chave = texto sem acento e em maiúsculas; valor = forma padronizada.
const SEGMENTOS = {
  'IND.': 'Indústria',
  INDUSTRIA: 'Indústria',
  COMERCIO: 'Comércio',
  SERVICOS: 'Serviços'
}

export const TIPOS_ERRO = {
  vazio: 'Campos vazios',
  espacos: 'Espaços desnecessários',
  duplicado: 'Registros duplicados',
  email: 'E-mails inválidos',
  padrao: 'Dados fora do padrão',
  padronizacao: 'Textos a padronizar'
}

const semAcento = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')

// "E-mail " -> "email", "Nível Cliente" -> "nivel_cliente"
const normalizarChave = (chave) =>
  semAcento(String(chave).trim().toLowerCase()).replace(/-/g, '').replace(/\s+/g, '_')

const normalizarLinha = (linha) =>
  Object.fromEntries(Object.entries(linha).map(([chave, valor]) => [normalizarChave(chave), valor]))

const padronizarSegmento = (valor) => SEGMENTOS[semAcento(valor.trim().toUpperCase())]

export const useUploadStore = defineStore('upload', {
  // STATE: arquivo e dados lidos da planilha.
  state: () => ({
    validado: false,
    arquivo: null,
    dadosOriginais: [],
    dadosTratados: [],
    erro: '',
    arquivosEmUpload: [],
    errosDadosPlanilha: [],
  }),

  // GETTERS: informações derivadas do state.
  getters: {
    totalLinhas: (state) => state.dadosTratados.length,

    totalColunas: (state) => {
      if (!state.dadosTratados.length) return 0
      return Object.keys(state.dadosTratados[0]).length
    },

    colunas: (state) => {
      if (!state.dadosTratados.length) return []
      return Object.keys(state.dadosTratados[0])
    },

    nomeArquivo: (state) => state.arquivo?.name ?? '',

    totalErros: (state) => state.errosDadosPlanilha.length,

    // Um registro com vários erros conta uma vez só.
    registrosComErro: (state) => new Set(state.errosDadosPlanilha.map((e) => e.linha)).size,

    registrosValidos() {
      return this.totalLinhas - this.registrosComErro
    },

    errosPorTipo: (state) =>
      Object.entries(TIPOS_ERRO).map(([tipo, descricao]) => ({
        tipo,
        descricao,
        quantidade: state.errosDadosPlanilha.filter((e) => e.tipo === tipo).length
      }))
  },

  // ACTIONS: leitura, tratamento e limpeza.

  actions: {    
    async lerArquivo(file) {
      this.validado = false
      this.errosDadosPlanilha = []
      this.erro = ''
      this.arquivo = file
      this.dadosOriginais = []
      this.dadosTratados = []

      if (!file) return

      const extensao = file.name.split('.').pop()?.toLowerCase()

      if (!['xlsx', 'xls', 'csv'].includes(extensao)) {
        this.erro = 'Formato inválido. Use XLSX, XLS ou CSV.'
        return
      }

      try {
        // CSV é lido como texto para manter os acentos (UTF-8).
        const workbook = extensao === 'csv'
          ? XLSX.read(await file.text(), { type: 'string' })
          : XLSX.read(await file.arrayBuffer(), { type: 'array' })

        const nomePrimeiraAba = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[nomePrimeiraAba]

        this.dadosOriginais = XLSX.utils
          .sheet_to_json(worksheet, { defval: '' })
          .map(normalizarLinha)

        this.tratarDados()
        this.validarDados()
      } catch (error) {
        console.error(error)
        this.erro = 'Não foi possível ler a planilha.'
      }
    },
    
    registrarErro(linha, campo, mensagem, tipo) {
      this.errosDadosPlanilha.push({ linha, campo, mensagem, tipo })
    },

    // Analisa os dados originais (antes do trim) e registra cada problema encontrado.
    validarDados() {
      this.errosDadosPlanilha = []
      const vistos = new Map()

      this.dadosOriginais.forEach((linha, indice) => {
        const numeroLinha = indice + 2 // linha 1 da planilha é o cabeçalho
        const texto = (campo) => String(linha[campo] ?? '').trim()

        for (const campo of CAMPOS_OBRIGATORIOS) {
          if (!texto(campo)) {
            this.registrarErro(numeroLinha, campo, 'Campo obrigatório vazio.', 'vazio')
          }
        }

        for (const [campo, valor] of Object.entries(linha)) {
          if (typeof valor === 'string' && valor.trim() && (valor !== valor.trim() || /\s{2,}/.test(valor))) {
            this.registrarErro(numeroLinha, campo, `Espaços desnecessários em "${valor}".`, 'espacos')
          }
        }

        const email = texto('email')
        if (email && !REGEX_EMAIL.test(email)) {
          this.registrarErro(numeroLinha, 'email', `E-mail inválido: "${email}".`, 'email')
        } else if (email && email !== email.toLowerCase()) {
          this.registrarErro(numeroLinha, 'email', `E-mail deve estar em minúsculas: "${email}".`, 'padronizacao')
        }

        const nome = texto('nome')
        if (nome && (nome === nome.toUpperCase() || nome === nome.toLowerCase())) {
          this.registrarErro(numeroLinha, 'nome', `Nome todo em maiúsculas/minúsculas: "${nome}".`, 'padronizacao')
        }
        if (/\d/.test(nome)) {
          this.registrarErro(numeroLinha, 'nome', `Nome contém números: "${nome}".`, 'padrao')
        }

        const segmento = texto('segmento')
        const segmentoPadrao = segmento && padronizarSegmento(segmento)
        if (segmento && !segmentoPadrao) {
          this.registrarErro(numeroLinha, 'segmento', `Segmento desconhecido: "${segmento}". Use Indústria, Comércio ou Serviços.`, 'padrao')
        } else if (segmentoPadrao && segmento !== segmentoPadrao) {
          this.registrarErro(numeroLinha, 'segmento', `"${segmento}" deve ser escrito como "${segmentoPadrao}".`, 'padronizacao')
        }

        const nivel = texto('nivel_cliente')
        if (nivel && !/^[ABC]$/i.test(nivel)) {
          this.registrarErro(numeroLinha, 'nivel_cliente', `Nível inválido: "${nivel}". Use A, B ou C.`, 'padrao')
        } else if (nivel && nivel !== nivel.toUpperCase()) {
          this.registrarErro(numeroLinha, 'nivel_cliente', `Nível deve estar em maiúscula: "${nivel}".`, 'padronizacao')
        }

        const telefone = texto('telefone')
        if (telefone && ![10, 11].includes(telefone.replace(/\D/g, '').length)) {
          this.registrarErro(numeroLinha, 'telefone', `Telefone deve ter DDD + 8 ou 9 dígitos: "${telefone}".`, 'padrao')
        }

        const faturamento = linha.faturamento
        if (faturamento !== undefined && faturamento !== '') {
          // ponytail: assume formato brasileiro (1.234,56) quando vier como texto
          const valor = typeof faturamento === 'number'
            ? faturamento
            : Number(String(faturamento).replace(/[R$\s.]/g, '').replace(',', '.'))
          if (Number.isNaN(valor) || valor < 0) {
            this.registrarErro(numeroLinha, 'faturamento', `Faturamento inválido: "${faturamento}".`, 'padrao')
          }
        }

        // Duplicado = mesmo nome + e-mail, ignorando maiúsculas e espaços.
        if (nome || email) {
          const chave = `${nome.toLowerCase()}|${email.toLowerCase()}`
          if (vistos.has(chave)) {
            this.registrarErro(numeroLinha, 'nome/email', `Registro duplicado da linha ${vistos.get(chave)}.`, 'duplicado')
          } else {
            vistos.set(chave, numeroLinha)
          }
        }
      })

      this.validado = true
    },

    atualizarArquivo(id, patch) {
      const item = this.arquivosEmUpload.find((a) => a.id === id)
      Object.assign(item, patch)
    },
    
    adicionarArquivo(file){
      const id = crypto.randomUUID()
      const novoItem = { id: id, file: file, progress:0, status:'uploading' }
      this.arquivosEmUpload = [...this.arquivosEmUpload, novoItem]
    },

    removerArquivo(id){
      this.arquivosEmUpload = this.arquivosEmUpload.filter((a) => a.id !== id)
     
    },

    tratarDados() {
      // Tratamento leve apenas para aula de Front-end.
      // A Ciência de Dados completa ficará em Python/Pandas.
      this.dadosTratados = this.dadosOriginais.map((linha) => {
        const novaLinha = {}

        for (const [chave, valor] of Object.entries(linha)) {
          if (typeof valor === 'string') {
            novaLinha[chave] = valor.trim()
          } else {
            novaLinha[chave] = valor
          }
        }

        if (typeof novaLinha.segmento === 'string') {
          novaLinha.segmento = padronizarSegmento(novaLinha.segmento) || novaLinha.segmento
        }

        if (typeof novaLinha.nivel_cliente === 'string') {
          novaLinha.nivel_cliente = novaLinha.nivel_cliente.toUpperCase()
        }

        return novaLinha
      })
    },

    limpar() {
      this.arquivo = null
      this.dadosOriginais = []
      this.dadosTratados = []
      this.erro = ''
      this.errosDadosPlanilha = []
      this.validado = false
    }

    // FUTURO:
    // async enviarParaBackend() {
    //   Aqui entrará Axios para enviar a planilha/dados ao Spring Boot.
    // }
  }
})
