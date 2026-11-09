// =====================================================================
// TREINO DE JS + PINIA  (baseado no uploadStore.js do projeto)
// =====================================================================
// COMO USAR
//   1. Na pasta Frontend, rode:   node treino/treino.js
//      (ou deixe rodando:         node --watch treino/treino.js)
//   2. Cada exercício tem uma descrição e um "// TODO". Escreva seu código no lugar.
//   3. Os testes no final mostram ✓ (passou) ou ✗ (falhou, com o motivo).
//   4. Use console.log à vontade para ver o que está acontecendo.
//   5. Não copie do uploadStore.js. Tente escrever primeiro, depois compare.
//
// Dica: as funções começam sem retorno (devolvem undefined), por isso tudo começa ✗.
// =====================================================================

import assert from 'node:assert/strict'
import { createPinia, defineStore, setActivePinia } from 'pinia'

// =====================================================================
// PARTE 1: FUNDAMENTOS DE JAVASCRIPT
// =====================================================================

// ---------------------------------------------------------------------
// EX 1: Funções e template string
// Uma função recebe valores (parâmetros) e devolve um resultado com `return`.
// Template string usa crases e ${...} para colocar variáveis dentro do texto:
//   const nome = 'Ana'
//   `Olá, ${nome}!`   // "Olá, Ana!"

// TAREFA: devolva "Arquivo <nome> tem <linhas> linhas"
// Ex: descricao('clientes.xlsx', 10) -> "Arquivo clientes.xlsx tem 10 linhas"
// ---------------------------------------------------------------------

export function descricao(nome, linhas) {
return `Arquivo ${nome} tem ${linhas} linhas`
}
// ---------------------------------------------------------------------
// EX 2: Arrow function (jeito curto de escrever função)
//   function dobro(n) { return n * 2 }
//   const dobro = (n) => n * 2          // mesma coisa; sem { } o return é implícito
// No uploadStore: const semAcento = (texto) => texto.normalize(...).replace(...)
//
// TAREFA: escreva `ehPar` como arrow function. Deve devolver true/false.
// Dica: o operador % devolve o resto da divisão.
// ---------------------------------------------------------------------
export const ehPar = (n) => {
    return n % 2 == 0
}

// ---------------------------------------------------------------------
// EX 3: Objetos, ?. e ??
// Objeto = pares chave: valor. Acesso: obj.chave
// `?.` (optional chaining) evita erro quando o objeto pode ser null/undefined:
//   null.name      -> ERRO       |   null?.name  -> undefined
// `??` dá um valor padrão quando o da esquerda é null/undefined:
//   undefined ?? 'x' -> 'x'
// No uploadStore: nomeArquivo: (state) => state.arquivo?.name ?? ''
//
// TAREFA: devolva arquivo.name, ou '' se o arquivo for null.
// ---------------------------------------------------------------------
export function nomeDoArquivo(arquivo) {
  return nomeDoArquivo?.arquivo ?? ''
}

// ---------------------------------------------------------------------
// EX 4: Métodos de array: map, filter, find
//   [1,2,3].map(n => n * 2)        -> [2,4,6]     (transforma cada item)
//   [1,2,3].filter(n => n > 1)     -> [2,3]       (mantém só os que dão true)
//   [1,2,3].find(n => n > 1)       -> 2           (primeiro que dá true, ou undefined)
// No uploadStore: arquivosEmUpload.find((a) => a.id === id)
//
// TAREFA: dado um array de clientes { id, nome, ativo }, faça 3 funções:
// ---------------------------------------------------------------------
export const nomesDosClientes = (clientes) => {
  // TODO: só os nomes -> ['Ana', 'Bruno']
nomesDosClientes = ['Ana', 'Bruno']
nomesDosClientes.map((n) => n + 1)
nomesDosClientes.filter((n) => n.lenght > 3)
nomesDosClientes.find((n) => n.lenght > 3)


}
export const soAtivos = (clientes) => {
  // TODO: só os clientes com ativo === true
}
export const acharPorId = (clientes, id) => {
  // TODO: o cliente com esse id (ou undefined)
}

// ---------------------------------------------------------------------
// EX 5: Object.entries / Object.fromEntries
// Transformam objeto <-> lista de pares:
//   Object.entries({ a: 1, b: 2 })          -> [['a', 1], ['b', 2]]
//   Object.fromEntries([['a', 1], ['b', 2]]) -> { a: 1, b: 2 }
// Desestruturação no parâmetro: ([chave, valor]) => ...  (pega os dois do par)
// No uploadStore: normalizarLinha() e tratarDados() usam isso.
//
// TAREFA: devolva um novo objeto onde todo valor que for string tem espaços
// das pontas removidos (.trim()). Números e outros tipos ficam iguais.
// Ex: { nome: '  Ana ', idade: 30 } -> { nome: 'Ana', idade: 30 }
// Dica: typeof valor === 'string'
// ---------------------------------------------------------------------
export function trimValores(linha) {
  // TODO
}

// ---------------------------------------------------------------------
// EX 6: Spread (...) e imutabilidade
// Spread copia o conteúdo de um array/objeto para um novo:
//   const a = [1, 2];   const b = [...a, 3]    // b = [1,2,3], a continua [1,2]
//   const o = { x: 1 }; const p = { ...o, y: 2, x: 9 }  // { x: 9, y: 2 }
// Depois do spread, o que vem por último vence (x: 9 sobrescreveu x: 1).
// No uploadStore: this.arquivosEmUpload = [...this.arquivosEmUpload, novoItem]
//
// TAREFA: 3 funções que NÃO alteram o original (não use push nem atribuição direta).
// ---------------------------------------------------------------------
export const adicionar = (lista, item) => {
  // TODO: devolve uma NOVA lista com o item no final
}
export const remover = (lista, id) => {
  // TODO: devolve uma NOVA lista sem o item que tem esse id (dica: filter)
}
export const atualizar = (obj, patch) => {
  // TODO: devolve um NOVO objeto com os campos de patch aplicados
}

// ---------------------------------------------------------------------
// EX 7: Strings
//   'a.b.csv'.split('.')     -> ['a', 'b', 'csv']
//   ['a','b'].pop()          -> 'b'  (último item)
//   'ABC'.toLowerCase()      -> 'abc'
//   'São'.normalize('NFD')   -> separa a letra do acento; depois dá para tirar o acento com:
//                               .replace(/[̀-ͯ]/g, '')
// No uploadStore: const extensao = file.name.split('.').pop()?.toLowerCase()
//
// TAREFA A: extensao('Clientes.XLSX') -> 'xlsx'
// TAREFA B: semAcento('Indústria') -> 'Industria'
// ---------------------------------------------------------------------
export const extensao = (nomeArquivo) => {
  // TODO
}
export const semAcento = (texto) => {
  // TODO
}

// ---------------------------------------------------------------------
// EX 8: Regex e .test()
// Regex é um padrão de texto entre barras. `regex.test(texto)` -> true/false.
//   /^\d+$/      só dígitos       \d = dígito, ^ = início, $ = fim, + = 1 ou mais
//   /^[ABC]$/i   uma letra A, B ou C (o i ignora maiúscula/minúscula)
//   \s espaço, \S não-espaço, @ e . (o ponto precisa de \. para ser ponto literal)
// No uploadStore: REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// (`[^\s@]` = qualquer coisa que não seja espaço nem @)
//
// TAREFA A: nivelValido('a') true; nivelValido('D') false; nivelValido('AB') false
// TAREFA B: emailValido('a@b.com') true; emailValido('a@b') false; emailValido('a b@c.com') false
//           (pode escrever seu próprio regex, sem copiar)
// ---------------------------------------------------------------------
export const nivelValido = (nivel) => {
  // TODO
}
export const emailValido = (email) => {
  // TODO
}

// ---------------------------------------------------------------------
// EX 9: Objeto como dicionário + Set
//   const SEG = { COMERCIO: 'Comércio' }
//   SEG['COMERCIO'] -> 'Comércio'   |   SEG['xxx'] -> undefined
//   new Set([1, 1, 2]).size -> 2    (Set não guarda repetidos)
// No uploadStore: SEGMENTOS[...] e new Set(erros.map(e => e.linha)).size
//
// TAREFA A: padronizarSegmento('  indústria ') -> 'Indústria'; desconhecido -> undefined
//   Use o dicionário abaixo; para achar a chave: tire acento, maiúscula e trim.
// TAREFA B: linhasComErro(erros) -> quantas linhas DIFERENTES têm erro
//   erros = [{linha:2}, {linha:2}, {linha:5}] -> 2
// ---------------------------------------------------------------------
const SEGMENTOS = { 'IND.': 'Indústria', INDUSTRIA: 'Indústria', COMERCIO: 'Comércio', SERVICOS: 'Serviços' }
export const padronizarSegmento = (valor) => {
  // TODO
}
export const linhasComErro = (erros) => {
  // TODO
}

// ---------------------------------------------------------------------
// EX 10: Loops e Map (nível desafio)
//   for (const item of lista) { ... }         percorre valores
//   lista.forEach((item, indice) => { ... })  percorre com índice
//   const m = new Map(); m.set('k', 1); m.has('k'); m.get('k')
// No uploadStore: validarDados() acha duplicados guardando o que já viu.
//
// TAREFA: acharDuplicados(emails) devolve os índices (0, 1, 2...) dos itens que
// já apareceram antes, ignorando maiúsculas.
// Ex: ['a@x.com', 'b@x.com', 'A@x.com', 'a@x.com'] -> [2, 3]
// ---------------------------------------------------------------------
export function acharDuplicados(emails) {
  // TODO
}

// ---------------------------------------------------------------------
// EX 11: Async / await / try-catch
// Uma função `async` devolve uma Promise. `await` espera ela terminar.
// No uploadStore: await file.text(), await file.arrayBuffer() dentro de try/catch.
//   const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
//   await esperar(100)   // pausa 100ms sem travar o programa
//
// TAREFA: lerComSeguranca(fn) chama `await fn()` e devolve o resultado.
// Se fn lançar erro (throw), NÃO deixe estourar: devolva a string 'erro'.
// ---------------------------------------------------------------------
export async function lerComSeguranca(fn) {
  // TODO
}

// =====================================================================
// PARTE 2: PINIA (STORE)
// =====================================================================
// Uma store é um objeto global que guarda ESTADO e pode ser usado por várias
// telas ao mesmo tempo. Tem 3 partes:
//   state   -> os dados                       (como as variáveis)
//   getters -> valores calculados do state    (como propriedades só de leitura)
//   actions -> funções que mudam o state      (dentro delas, `this` é a store)
//
//   export const useXStore = defineStore('x', {
//     state:   () => ({ lista: [] }),                   // função que devolve objeto
//     getters: { total: (state) => state.lista.length },
//     actions: { adicionar(i) { this.lista.push(i) } }
//   })
//
// Uso (numa tela Vue): const store = useXStore(); store.adicionar(1); store.total
// Aqui no Node não há tela, então criamos o Pinia na mão (veja `novaStore` abaixo).
// Em getter que usa outro getter, use função normal e `this`:  total() { return this.outro }
// ---------------------------------------------------------------------

// ---------------------------------------------------------------------
// EX 12: Sua primeira store (igual à authStore, só que mais simples)
// TAREFA: complete a store `contador`:
//   state:   count começa em 0
//   getters: dobro -> count * 2
//   actions: incrementar() soma 1 | resetar() volta para 0
// ---------------------------------------------------------------------
export const useContadorStore = defineStore('contador', {
  state: () => ({
    // TODO
  }),
  getters: {
    // TODO
  },
  actions: {
    // TODO
  }
})

// ---------------------------------------------------------------------
// EX 13: Lista de arquivos (adicionarArquivo / removerArquivo / atualizarArquivo)
// TAREFA: complete `arquivos`:
//   state:   lista = []
//   getters: total -> quantidade de itens
//            enviando -> só os itens com status 'uploading'
//   actions: adicionar(nome) -> cria { id: crypto.randomUUID(), nome, progress: 0, status: 'uploading' }
//                               e coloca no fim (use spread, como no uploadStore)
//            remover(id)     -> tira o item com esse id
//            atualizar(id, patch) -> acha o item e aplica patch (Object.assign(item, patch))
// ---------------------------------------------------------------------
export const useArquivosStore = defineStore('arquivos', {
  state: () => ({
    // TODO
  }),
  getters: {
    // TODO
  },
  actions: {
    // TODO
  }
})

// ---------------------------------------------------------------------
// EX 14: Erros da planilha (registrarErro + getters do uploadStore)
// TAREFA: complete `erros`:
//   state:   lista = []
//   getters: totalErros -> quantidade de erros
//            registrosComErro -> linhas DIFERENTES com erro (Set!)
//            porTipo -> objeto contando por tipo, ex: { vazio: 2, email: 1 }
//   actions: registrar(linha, campo, mensagem, tipo) -> adiciona { linha, campo, mensagem, tipo }
//            limpar() -> esvazia a lista
// Dica do porTipo: percorra a lista e faça  contagem[e.tipo] = (contagem[e.tipo] ?? 0) + 1
// ---------------------------------------------------------------------
export const useErrosStore = defineStore('erros', {
  state: () => ({
    // TODO
  }),
  getters: {
    // TODO
  },
  actions: {
    // TODO
  }
})

// ---------------------------------------------------------------------
// EX 15 (DESAFIO): Mini lerArquivo
// TAREFA: complete `planilha`:
//   state:   arquivo = null, erro = '', linhas = []
//   actions: async carregar(file, lerLinhas)
//     - limpa erro e linhas, guarda o arquivo
//     - se file for null, só retorna
//     - extensão fora de ['xlsx','xls','csv'] -> erro = 'Formato inválido. Use XLSX, XLS ou CSV.' e retorna
//     - senão: try { this.linhas = await lerLinhas(file) } catch { this.erro = 'Não foi possível ler a planilha.' }
//   (lerLinhas é uma função que o teste passa; no projeto real ela seria o XLSX)
// ---------------------------------------------------------------------
export const usePlanilhaStore = defineStore('planilha', {
  state: () => ({
    // TODO
  }),
  actions: {
    // TODO
  }
})

// =====================================================================
// TESTES (não precisa mexer daqui para baixo)
// =====================================================================
const novaStore = (useStore) => {
  setActivePinia(createPinia()) // Pinia novo = store zerada para cada teste
  return useStore()
}
const teste = async (nome, fn) => {
  try {
    await fn()
    console.log('✓', nome)
  } catch (e) {
    console.log('✗', nome, '→', e.message.split('\n')[0])
  }
}

console.log('\n--- PARTE 1: JS ---')
await teste('EX1 descricao', () => assert.equal(descricao('a.xlsx', 10), 'Arquivo a.xlsx tem 10 linhas'))
await teste('EX2 ehPar', () => { assert.equal(ehPar(4), true); assert.equal(ehPar(7), false) })
await teste('EX3 nomeDoArquivo', () => {
  assert.equal(nomeDoArquivo({ name: 'a.csv' }), 'a.csv')
  assert.equal(nomeDoArquivo(null), '')
})
const clientes = [{ id: 1, nome: 'Ana', ativo: true }, { id: 2, nome: 'Bruno', ativo: false }]
await teste('EX4 nomesDosClientes', () => assert.deepEqual(nomesDosClientes(clientes), ['Ana', 'Bruno']))
await teste('EX4 soAtivos', () => assert.deepEqual(soAtivos(clientes), [clientes[0]]))
await teste('EX4 acharPorId', () => { assert.equal(acharPorId(clientes, 2).nome, 'Bruno'); assert.equal(acharPorId(clientes, 9), undefined) })
await teste('EX5 trimValores', () => assert.deepEqual(trimValores({ nome: '  Ana ', idade: 30 }), { nome: 'Ana', idade: 30 }))
await teste('EX6 adicionar (sem mutar)', () => {
  const l = [1]; const r = adicionar(l, 2)
  assert.deepEqual(r, [1, 2]); assert.deepEqual(l, [1])
})
await teste('EX6 remover (sem mutar)', () => {
  const l = [{ id: 1 }, { id: 2 }]; const r = remover(l, 1)
  assert.deepEqual(r, [{ id: 2 }]); assert.equal(l.length, 2)
})
await teste('EX6 atualizar (sem mutar)', () => {
  const o = { x: 1 }; const r = atualizar(o, { x: 9, y: 2 })
  assert.deepEqual(r, { x: 9, y: 2 }); assert.deepEqual(o, { x: 1 })
})
await teste('EX7 extensao', () => assert.equal(extensao('Clientes.XLSX'), 'xlsx'))
await teste('EX7 semAcento', () => assert.equal(semAcento('Indústria ção'), 'Industria cao'))
await teste('EX8 nivelValido', () => {
  assert.equal(nivelValido('a'), true); assert.equal(nivelValido('D'), false); assert.equal(nivelValido('AB'), false)
})
await teste('EX8 emailValido', () => {
  assert.equal(emailValido('a@b.com'), true); assert.equal(emailValido('a@b'), false); assert.equal(emailValido('a b@c.com'), false)
})
await teste('EX9 padronizarSegmento', () => {
  assert.equal(padronizarSegmento('  indústria '), 'Indústria'); assert.equal(padronizarSegmento('xyz'), undefined)
})
await teste('EX9 linhasComErro', () => assert.equal(linhasComErro([{ linha: 2 }, { linha: 2 }, { linha: 5 }]), 2))
await teste('EX10 acharDuplicados', () => assert.deepEqual(acharDuplicados(['a@x.com', 'b@x.com', 'A@x.com', 'a@x.com']), [2, 3]))
await teste('EX11 lerComSeguranca', async () => {
  assert.equal(await lerComSeguranca(async () => 42), 42)
  assert.equal(await lerComSeguranca(async () => { throw new Error('x') }), 'erro')
})

console.log('\n--- PARTE 2: PINIA ---')
await teste('EX12 contador', () => {
  const s = novaStore(useContadorStore)
  assert.equal(s.count, 0); s.incrementar(); s.incrementar()
  assert.equal(s.count, 2); assert.equal(s.dobro, 4)
  s.resetar(); assert.equal(s.count, 0)
})
await teste('EX13 arquivos', () => {
  const s = novaStore(useArquivosStore)
  s.adicionar('a.csv'); s.adicionar('b.csv')
  assert.equal(s.total, 2); assert.equal(s.lista[0].status, 'uploading')
  const id = s.lista[0].id
  s.atualizar(id, { status: 'done', progress: 100 })
  assert.equal(s.enviando.length, 1); assert.equal(s.lista[0].progress, 100)
  s.remover(id); assert.equal(s.total, 1)
})
await teste('EX14 erros', () => {
  const s = novaStore(useErrosStore)
  s.registrar(2, 'nome', 'vazio', 'vazio'); s.registrar(2, 'email', 'ruim', 'email'); s.registrar(5, 'nome', 'vazio', 'vazio')
  assert.equal(s.totalErros, 3); assert.equal(s.registrosComErro, 2)
  assert.deepEqual(s.porTipo, { vazio: 2, email: 1 })
  s.limpar(); assert.equal(s.totalErros, 0)
})
await teste('EX15 planilha', async () => {
  const s = novaStore(usePlanilhaStore)
  await s.carregar({ name: 'a.txt' }, async () => [])
  assert.equal(s.erro, 'Formato inválido. Use XLSX, XLS ou CSV.')
  await s.carregar({ name: 'a.csv' }, async () => [{ nome: 'Ana' }])
  assert.equal(s.erro, ''); assert.equal(s.linhas.length, 1)
  await s.carregar({ name: 'a.csv' }, async () => { throw new Error('x') })
  assert.equal(s.erro, 'Não foi possível ler a planilha.'); assert.equal(s.linhas.length, 0)
})
console.log()
