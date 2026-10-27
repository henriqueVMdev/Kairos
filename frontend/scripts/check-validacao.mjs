// Roda a validação da store sobre docs/exemplo-clientes.csv: node scripts/check-validacao.mjs
import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { createPinia, setActivePinia } from 'pinia'
import { useUploadStore } from '../src/Stores/uploadStore.js'

setActivePinia(createPinia())
const store = useUploadStore()
const conteudo = readFileSync(new URL('../../docs/exemplo-clientes.csv', import.meta.url), 'utf8')
await store.lerArquivo({ name: 'exemplo-clientes.csv', text: async () => conteudo })

const porTipo = Object.fromEntries(store.errosPorTipo.map((e) => [e.tipo, e.quantidade]))
assert.deepStrictEqual(porTipo, { vazio: 2, espacos: 1, duplicado: 1, email: 1, padrao: 5, padronizacao: 4 })
assert.strictEqual(store.totalLinhas, 7)
assert.strictEqual(store.registrosValidos, 1)
assert.strictEqual(store.registrosComErro, 6)
console.log('ok')
