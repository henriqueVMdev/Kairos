# Explicação completa — Validação de Planilha com Pinia

> Arquivo pessoal de estudo (está no `.gitignore`, não vai para o GitHub).
> Explica **tudo** o que foi feito na atividade "Pinia – Validação de Planilha", **linha por linha**, e **por quê**.

---

## Sumário

1. [O que a atividade pedia](#1-o-que-a-atividade-pedia)
2. [Como estava o código antes](#2-como-estava-o-código-antes)
3. [Visão geral do que mudou](#3-visão-geral-do-que-mudou)
4. [Conceitos que você precisa entender antes](#4-conceitos-que-você-precisa-entender-antes)
5. [`uploadStore.js` linha por linha](#5-uploadstorejs-linha-por-linha)
6. [`Upload.vue` linha por linha (o que mudou)](#6-uploadvue-linha-por-linha-o-que-mudou)
7. [`docs/exemplo-clientes.csv`, a planilha de teste](#7-docsexemplo-clientescsv--a-planilha-de-teste)
8. [`Frontend/scripts/check-validacao.mjs`, o teste automático](#8-frontendscriptscheck-validacaomjs--o-teste-automático)
9. [`docs/Relatorio-Validacao-Planilha.docx`, o documento de entrega](#9-docsrelatorio-validacao-planilhadocx--o-documento-de-entrega)
10. [Bugs que existiam e foram corrigidos](#10-bugs-que-existiam-e-foram-corrigidos)
11. [Decisões e limitações conhecidas](#11-decisões-e-limitações-conhecidas)
12. [Como testar tudo](#12-como-testar-tudo)
13. [Perguntas que o professor pode fazer (e as respostas)](#13-perguntas-que-o-professor-pode-fazer-e-as-respostas)

---

## 1. O que a atividade pedia

O PDF pedia uma funcionalidade que:

- **armazene temporariamente** os dados da planilha → isso é o **state** do Pinia;
- **registre os erros** encontrados → uma lista de erros no state + uma action que adiciona erro;
- **calcule informações** sobre os dados → isso são os **getters**;
- **execute as validações** → isso são as **actions**;
- **apresente os resultados** num relatório.

Validações mínimas: campos obrigatórios vazios, espaços desnecessários, registros duplicados, e-mails inválidos, dados fora do padrão, textos que precisam ser padronizados e outros problemas.

Relatório com: nome do arquivo, total de registros, válidos, com erro, quantidade por tipo de erro, linha, campo e descrição do erro.

Fluxo: **Planilha Excel → Tela de Upload → Pinia → Relatório**.

> **Mudança combinada:** o PDF fala em "Tela de Relatório", mas você pediu que os erros aparecessem **na própria tela de upload**. Então o relatório é um bloco dentro de `Upload.vue`, não uma rota/página separada. O fluxo continua o mesmo, só que o "relatório" aparece logo abaixo do upload.

---

## 2. Como estava o código antes

A store `uploadStore.js` já tinha:

- **state**: `arquivo`, `dadosOriginais`, `dadosTratados`, `erro`, `arquivosEmUpload`, e você tinha começado a adicionar `validado` e `errosDadosPlanilha`.
- **getters**: `totalLinhas`, `totalColunas`, `colunas`, e dois que você tinha começado: `totalErros` e `localErro`. **Esses dois estavam quebrados** (explico na seção 10).
- **actions**: `lerArquivo`, `registrarErro` (que você começou), `atualizarArquivo`, `adicionarArquivo`, `removerArquivo`, `tratarDados`, `limpar`.

**Não existia** nenhuma action que de fato validasse os dados, e a tela não mostrava nenhum erro.

---

## 3. Visão geral do que mudou

| Arquivo | O que aconteceu |
|---|---|
| `Frontend/src/Stores/uploadStore.js` | Constantes e funções auxiliares no topo; getters corrigidos e novos; action `validarDados()` criada; `registrarErro` simplificado; `lerArquivo` corrigido para CSV com acento e para chamar a validação; `tratarDados` usando o novo mapa de segmentos. |
| `Frontend/src/Views/Upload.vue` | Import de `computed`, `ref` e `TIPOS_ERRO`; filtro de erros; bloco "Relatório de validação" com cards, tabela de quantidades e tabela de detalhes. |
| `docs/exemplo-clientes.csv` | **Novo**: planilha de teste com erros de propósito. |
| `Frontend/scripts/check-validacao.mjs` | **Novo**: script que roda a validação e confere os números com `assert`. |
| `docs/Relatorio-Validacao-Planilha.docx` | **Novo**: o documento de entrega pedido no item 2 do PDF. |
| `EXPLICACAO.md` + `.gitignore` | Este arquivo, ignorado pelo git. |

---

## 4. Conceitos que você precisa entender antes

### 4.1 Pinia: state, getters, actions

```js
defineStore('upload', {
  state:   () => ({ ... }),  // DADOS. É uma função que devolve um objeto novo.
  getters: { ... },          // VALORES CALCULADOS a partir do state (como computed).
  actions: { ... },          // FUNÇÕES que fazem coisas e alteram o state.
})
```

- **State** é uma *função* (`() => ({...})`) e não um objeto direto porque cada instância do Pinia precisa do seu próprio objeto. Se fosse um objeto só, ele seria compartilhado entre testes/instâncias.
- **Getters** são recalculados automaticamente quando o state muda, e o resultado fica em cache. Se `errosDadosPlanilha` não mudar, `totalErros` não é recalculado.
- **Actions** podem ser `async`, podem chamar outras actions via `this.outraAction()` e alteram o state via `this.propriedade = ...`.

### 4.2 Getter com arrow function vs. função normal

```js
totalErros: (state) => state.errosDadosPlanilha.length   // arrow: recebe state
registrosValidos() { return this.totalLinhas - this.registrosComErro }  // normal: usa this
```

Arrow function **não tem `this` próprio**. Então, quando um getter precisa usar **outro getter**, ele tem que ser uma função normal, para que `this` aponte para a store. Por isso `registrosValidos` é o único getter escrito com `() {}` e não com `=>`.

### 4.3 A biblioteca `xlsx` (SheetJS)

- `XLSX.read(dados, { type })` abre o arquivo e devolve um **workbook** (a pasta de trabalho inteira, com todas as abas).
- `workbook.SheetNames` é a lista com os nomes das abas.
- `workbook.Sheets[nome]` é uma aba (worksheet).
- `XLSX.utils.sheet_to_json(aba, { defval: '' })` transforma a aba num **array de objetos**, onde cada objeto é uma linha e as chaves são os nomes do cabeçalho. `defval: ''` faz célula vazia virar `''` em vez de a chave sumir do objeto.

Exemplo: a planilha

| nome | email |
|---|---|
| Ana | ana@x.com |

vira `[{ nome: 'Ana', email: 'ana@x.com' }]`.

### 4.4 Regex (expressões regulares) usadas

| Regex | Significado |
|---|---|
| `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` | E-mail: algo sem espaço e sem @, depois `@`, depois algo, depois `.`, depois pelo menos 2 caracteres. |
| `/[̀-ͯ]/g` | Os "acentos soltos" do Unicode (explicado em 5.5). |
| `/-/g` | Todo hífen. |
| `/\s+/g` | Um ou mais espaços (ou tab, quebra de linha). |
| `/\s{2,}/` | Dois ou mais espaços seguidos. |
| `/\d/` | Qualquer dígito 0–9. |
| `/\D/g` | Tudo que **não** é dígito. |
| `/^[ABC]$/i` | Exatamente uma letra A, B ou C; o `i` ignora maiúscula/minúscula. |
| `/[R$\s.]/g` | Os caracteres `R`, `$`, espaço ou ponto. |

Símbolos: `^` = início do texto, `$` = fim, `[...]` = um dos caracteres, `[^...]` = nenhum desses caracteres, `+` = 1 ou mais, `{2,}` = 2 ou mais, `g` = todas as ocorrências.

### 4.5 `Set` e `Map`

- `Set` é uma coleção **sem repetição**. `new Set([2, 2, 3]).size` é `2`. Usado para contar **linhas diferentes** com erro.
- `Map` é um dicionário chave → valor. Usado para lembrar "já vi este nome+email na linha X".

---

## 5. `uploadStore.js` linha por linha

### Linhas 1–2: imports

```js
import { defineStore } from 'pinia'
import * as XLSX from 'xlsx'
```

- **L1**: `defineStore` é a função do Pinia que cria uma store.
- **L2**: importa **tudo** da biblioteca `xlsx` com o apelido `XLSX` (`XLSX.read`, `XLSX.utils...`). Já existia.

### Linha 4: campos obrigatórios

```js
const CAMPOS_OBRIGATORIOS = ['nome', 'email', 'segmento', 'nivel_cliente']
```

- Lista das colunas que **não podem** estar vazias.
- **Por que fora da store?** É uma constante que nunca muda. Não é "estado". Colocar no state seria errado: o state é para dados que mudam durante o uso.
- **Por que estes campos?** Vieram do model `Cliente.java` do backend: `nome` e `segmento` são `nullable = false` lá. `email` é obrigatório porque a atividade pede validação de e-mail e porque ele é usado para detectar duplicados. `nivel_cliente` já era tratado no `tratarDados` original.
- Nome em MAIÚSCULAS_COM_UNDERLINE é convenção para constantes.

### Linha 5: regex de e-mail

```js
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
```

Destrinchando:

| Pedaço | Significado |
|---|---|
| `^` | começo do texto |
| `[^\s@]+` | 1 ou mais caracteres que não são espaço nem `@` (o usuário, ex.: `ana.silva`) |
| `@` | o arroba literal |
| `[^\s@]+` | o domínio (ex.: `empresa`) |
| `\.` | um ponto literal (a `\` é porque `.` sozinho em regex significa "qualquer caractere") |
| `[^\s@]{2,}` | pelo menos 2 caracteres (ex.: `com`, `br`, `com.br`) |
| `$` | fim do texto |

- Aceita: `ana@empresa.com`, `x@y.com.br`.
- Rejeita: `padaria@central` (sem ponto depois do @), `ana @x.com` (espaço), `ana@@x.com`, `@x.com`.
- **Por que não uma regex "perfeita"?** A regex 100% fiel à especificação de e-mail é gigante e ilegível. Essa pega os erros reais de digitação, que é o que importa aqui.

### Linhas 7–13: mapa de segmentos

```js
// Chave = texto sem acento e em maiúsculas; valor = forma padronizada.
const SEGMENTOS = {
  'IND.': 'Indústria',
  INDUSTRIA: 'Indústria',
  COMERCIO: 'Comércio',
  SERVICOS: 'Serviços'
}
```

- **Para que serve:** transformar qualquer jeito de escrever o segmento no **jeito oficial**.
- **Como funciona:** antes de procurar no mapa, o texto é convertido para MAIÚSCULAS e **sem acento**. Então `indústria`, `Industria`, `INDÚSTRIA` e `industria` viram todos `INDUSTRIA`, que é a chave, e o resultado é `Indústria`.
- **Por que `'IND.'` entre aspas?** Porque tem ponto. Chaves de objeto só podem ficar sem aspas se forem nomes válidos de variável. `INDUSTRIA` pode ficar sem aspas; `IND.` não.
- **Por que só 4 chaves se o original tinha 11?** O original listava cada variação à mão (`'industria'`, `'indústria'`, `'INDUSTRIA'`, `'INDÚSTRIA'`...). Como agora tudo é normalizado antes, **uma chave cobre todas as variações**. E o original tinha um bug: ver seção 10.
- **Também serve para validar:** se o segmento **não está** no mapa, é "dado fora do padrão" (ex.: `Agro`).

### Linhas 15–22: tipos de erro

```js
export const TIPOS_ERRO = {
  vazio: 'Campos vazios',
  espacos: 'Espaços desnecessários',
  duplicado: 'Registros duplicados',
  email: 'E-mails inválidos',
  padrao: 'Dados fora do padrão',
  padronizacao: 'Textos a padronizar'
}
```

- Cada erro registrado tem um `tipo` curto (`'vazio'`, `'email'`...). Este objeto traduz o tipo para o **texto que aparece na tela**.
- **Por que `export`?** Porque o `Upload.vue` também precisa dele: para montar o `<select>` do filtro e para mostrar o nome do tipo em cada linha da tabela de detalhes. Exportando, existe **um lugar só** com esses nomes. Se mudar aqui, muda na tela inteira.
- **Por que um objeto e não vários `if`?** O getter `errosPorTipo` percorre esse objeto para contar cada tipo. Então a **ordem** das chaves aqui é a **ordem das linhas** na tabela do relatório.
- Os 6 tipos cobrem exatamente as validações mínimas do PDF:
  - campos obrigatórios vazios → `vazio`
  - espaços em branco desnecessários → `espacos`
  - registros duplicados → `duplicado`
  - e-mails inválidos → `email`
  - dados fora do padrão → `padrao`
  - textos que precisam ser padronizados → `padronizacao`

### Linha 24: `semAcento`

```js
const semAcento = (texto) => texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
```

Como tirar acento em JavaScript, passo a passo com `"Indústria"`:

1. `.normalize('NFD')` **separa** a letra do acento. O `ú` (um caractere) vira `u` + `´` (dois caracteres: a letra e um "acento combinante").
   `"Indústria"` → `"Indu´stria"` (visualmente igual, mas internamente o acento é um caractere à parte).
2. `.replace(/[̀-ͯ]/g, '')` apaga todos os caracteres da faixa Unicode `U+0300` a `U+036F`, que é exatamente onde ficam esses acentos combinantes (agudo, til, cedilha, circunflexo...).
   → `"Industria"`.

Funciona para `ç` → `c`, `ã` → `a`, `é` → `e` etc.

### Linhas 26–28: `normalizarChave`

```js
// "E-mail " -> "email", "Nível Cliente" -> "nivel_cliente"
const normalizarChave = (chave) =>
  semAcento(String(chave).trim().toLowerCase()).replace(/-/g, '').replace(/\s+/g, '_')
```

Normaliza o **nome da coluna** (o cabeçalho). Passo a passo com `" Nível Cliente "`:

| Passo | Resultado |
|---|---|
| `String(chave)` | garante que é texto (cabeçalho pode vir como número, ex.: `2024`) |
| `.trim()` | `"Nível Cliente"` (tira espaços das pontas) |
| `.toLowerCase()` | `"nível cliente"` |
| `semAcento(...)` | `"nivel cliente"` |
| `.replace(/-/g, '')` | remove hífens (`"e-mail"` → `"email"`) |
| `.replace(/\s+/g, '_')` | espaços viram `_` → `"nivel_cliente"` |

**Por que isso é necessário?** O código acessa `linha.email`, `linha.nivel_cliente` etc. Se a pessoa escreveu o cabeçalho como `E-mail` ou `Nível Cliente`, sem normalizar, `linha.email` seria `undefined` e **todas as linhas** dariam "campo obrigatório vazio", mesmo com o e-mail preenchido. Normalizando, a planilha funciona com qualquer jeito razoável de escrever o cabeçalho.

### Linhas 30–31: `normalizarLinha`

```js
const normalizarLinha = (linha) =>
  Object.fromEntries(Object.entries(linha).map(([chave, valor]) => [normalizarChave(chave), valor]))
```

Aplica `normalizarChave` em **todas as chaves** de uma linha, sem mexer nos valores.

Passo a passo com `{ 'E-mail': 'a@b.com', 'Nome': 'Ana' }`:

1. `Object.entries(linha)` → `[['E-mail', 'a@b.com'], ['Nome', 'Ana']]` (vira lista de pares).
2. `.map(([chave, valor]) => [normalizarChave(chave), valor])` → `[['email', 'a@b.com'], ['nome', 'Ana']]`.
   O `([chave, valor])` é **desestruturação**: pega o par e separa em duas variáveis.
3. `Object.fromEntries(...)` → `{ email: 'a@b.com', nome: 'Ana' }` (volta a ser objeto).

**Por que os valores não são alterados aqui?** Porque a validação precisa ver os valores **originais**, com os espaços errados, para conseguir apontar "espaços desnecessários". Se limpasse aqui, o erro sumiria antes de ser detectado.

### Linha 33: `padronizarSegmento`

```js
const padronizarSegmento = (valor) => SEGMENTOS[semAcento(valor.trim().toUpperCase())]
```

- Recebe o segmento como veio (ex.: `" comércio "`).
- `.trim()` → `"comércio"`, `.toUpperCase()` → `"COMÉRCIO"`, `semAcento` → `"COMERCIO"`.
- `SEGMENTOS["COMERCIO"]` → `"Comércio"`.
- Se não existir no mapa (ex.: `"AGRO"`), devolve `undefined`. Isso é usado para dizer "segmento desconhecido".
- **Por que virou uma função separada?** Porque é usada em **dois lugares**: em `tratarDados` (para corrigir o valor) e em `validarDados` (para detectar o erro). Uma função, uma regra, sem risco das duas ficarem diferentes.

### Linha 35: criação da store

```js
export const useUploadStore = defineStore('upload', {
```

- `'upload'` é o **id** da store. O Pinia usa esse id no DevTools do Vue e internamente.
- `useUploadStore` é a função que os componentes chamam (`const store = useUploadStore()`). Já existia.

### Linhas 36–45: STATE

```js
  state: () => ({
    validado: false,
    arquivo: null,
    dadosOriginais: [],
    dadosTratados: [],
    erro: '',
    arquivosEmUpload: [],
    errosDadosPlanilha: [],
  }),
```

| Propriedade | Tipo | Para que serve |
|---|---|---|
| `validado` | boolean | `true` depois que `validarDados()` roda. A tela usa isso (`v-if="store.validado"`) para só mostrar o relatório quando ele existe. Sem isso, apareceria um relatório "0 registros, 0 erros" antes de escolher um arquivo. |
| `arquivo` | `File` ou `null` | O arquivo escolhido. Guardado para mostrar o nome. |
| `dadosOriginais` | array de objetos | As linhas **como vieram** da planilha (só com as chaves normalizadas). A validação roda aqui. |
| `dadosTratados` | array de objetos | As linhas **limpas** (sem espaços, segmento e nível padronizados). Usadas na prévia e no futuro envio ao backend. |
| `erro` | string | Erro de **leitura** (arquivo inválido/corrompido). Diferente dos erros de **dados**. |
| `arquivosEmUpload` | array | Lista usada pelo card de upload (progresso/status). Já existia. |
| `errosDadosPlanilha` | array de `{ linha, campo, mensagem, tipo }` | **Todos os erros de dados encontrados.** É a base do relatório inteiro. |

**Por que guardar `dadosOriginais` E `dadosTratados`?** Porque são coisas diferentes: um serve para **encontrar** os problemas, o outro é o **resultado corrigido**. Se guardasse só o tratado, não daria para saber onde havia espaço sobrando.

`validado` e `errosDadosPlanilha` você já tinha adicionado; foram mantidos.

### Linhas 47–59: getters que já existiam

```js
    totalLinhas: (state) => state.dadosTratados.length,
```
- Quantidade de registros. É o "total de registros" do relatório.

```js
    totalColunas: (state) => {
      if (!state.dadosTratados.length) return 0
      return Object.keys(state.dadosTratados[0]).length
    },
    colunas: (state) => {
      if (!state.dadosTratados.length) return []
      return Object.keys(state.dadosTratados[0])
    },
```
- Quantas colunas e quais são, olhando as chaves da primeira linha. O `if` evita erro quando não há dados (`dadosTratados[0]` seria `undefined` e `Object.keys(undefined)` quebra). Usados na prévia. Não mexi.

### Linha 61: `nomeArquivo` (novo)

```js
    nomeArquivo: (state) => state.arquivo?.name ?? '',
```

- `?.` (optional chaining): se `arquivo` for `null`, não tenta ler `.name` (o que daria erro); devolve `undefined`.
- `??` (nullish coalescing): se o resultado for `null`/`undefined`, usa `''`.
- Resultado: o nome do arquivo, ou texto vazio. É o "nome do arquivo analisado" do relatório.

### Linha 63: `totalErros` (corrigido)

```js
    totalErros: (state) => state.errosDadosPlanilha.length,
```

- Quantidade total de erros encontrados.
- **Como estava antes:** `return Object.keys(state.errosDadosPlanilha[0])`, que devolvia os **nomes dos campos** do primeiro erro (`['linha','campo','mensagem','tipo']`), e não um número. Ver seção 10.

### Linhas 65–66: `registrosComErro` (substitui o `localErro`)

```js
    // Um registro com vários erros conta uma vez só.
    registrosComErro: (state) => new Set(state.errosDadosPlanilha.map((e) => e.linha)).size,
```

1. `.map((e) => e.linha)` → lista de números de linha de cada erro, ex.: `[3, 3, 4, 5, 5, 5]`.
2. `new Set(...)` → remove repetidos: `{3, 4, 5}`.
3. `.size` → `3`.

**Por que o Set?** A linha 5 pode ter 4 erros, mas é **1 registro** com erro. Sem o Set, contaria 4 e `registrosValidos` ficaria negativo em planilhas com muitos erros.

**Era isso que o seu `localErro` estava tentando fazer** (a ideia do `new Set` estava certa!), mas ele fazia `linhas.trim()` num objeto de erro, e objeto não tem `.trim()`, então quebrava. Ver seção 10.

### Linhas 68–70: `registrosValidos` (novo)

```js
    registrosValidos() {
      return this.totalLinhas - this.registrosComErro
    },
```

- Total de registros menos os que têm pelo menos um erro.
- É **função normal** (não arrow) porque usa `this` para acessar **outros getters**. Ver 4.2.
- **Por que calcular e não guardar no state?** Porque é derivado. Se ficasse no state, teria que lembrar de atualizar toda vez que os erros mudassem. Getter se atualiza sozinho. **Regra de ouro: o que dá para calcular a partir do state vira getter, não state.**

### Linhas 72–77: `errosPorTipo` (novo)

```js
    errosPorTipo: (state) =>
      Object.entries(TIPOS_ERRO).map(([tipo, descricao]) => ({
        tipo,
        descricao,
        quantidade: state.errosDadosPlanilha.filter((e) => e.tipo === tipo).length
      }))
```

1. `Object.entries(TIPOS_ERRO)` → `[['vazio', 'Campos vazios'], ['espacos', 'Espaços desnecessários'], ...]`.
2. Para cada `[tipo, descricao]`, monta um objeto:
   - `tipo` e `descricao` (forma curta de escrever `tipo: tipo`, `descricao: descricao`);
   - `quantidade`: filtra os erros daquele tipo e conta.
3. O `({ ... })` com parênteses é porque uma arrow function que devolve **objeto** precisa dos parênteses; senão o JS acha que `{` é o início do corpo da função.

Resultado, exemplo:
```js
[
  { tipo: 'vazio', descricao: 'Campos vazios', quantidade: 2 },
  { tipo: 'espacos', descricao: 'Espaços desnecessários', quantidade: 1 },
  ...
]
```

É exatamente a tabela "Validação realizada / Quantidade" do exemplo do PDF. **Tipos com zero erros também aparecem**, para mostrar que a validação foi feita e passou.

### Linhas 83–119: action `lerArquivo` (modificada)

```js
    async lerArquivo(file) {
```
- `async` porque ler o arquivo é **assíncrono** (o navegador demora para ler o disco). Dentro dela usamos `await`.

```js
      this.validado = false
      this.errosDadosPlanilha = []
      this.erro = ''
      this.arquivo = file
      this.dadosOriginais = []
      this.dadosTratados = []
```
- **Reseta tudo** antes de ler um novo arquivo. Se não resetasse, os erros da planilha anterior continuariam aparecendo misturados com os da nova.
- `validado = false` e `errosDadosPlanilha = []` foram adicionados por você e mantidos.

```js
      if (!file) return
```
- Se não veio arquivo (usuário cancelou a janela), para aqui.

```js
      const extensao = file.name.split('.').pop()?.toLowerCase()
```
- `"clientes.XLSX".split('.')` → `['clientes', 'XLSX']`; `.pop()` → `'XLSX'` (último pedaço); `.toLowerCase()` → `'xlsx'`.

```js
      if (!['xlsx', 'xls', 'csv'].includes(extensao)) {
        this.erro = 'Formato inválido. Use XLSX, XLS ou CSV.'
        return
      }
```
- Recusa qualquer formato que não seja planilha. Já existia.

```js
      try {
        // CSV é lido como texto para manter os acentos (UTF-8).
        const workbook = extensao === 'csv'
          ? XLSX.read(await file.text(), { type: 'string' })
          : XLSX.read(await file.arrayBuffer(), { type: 'array' })
```
- **Isto foi alterado.** Antes era sempre `XLSX.read(await file.arrayBuffer(), { type: 'array' })`.
- **O problema:** quando recebe **bytes crus** de um CSV, a biblioteca `xlsx` assume a codificação antiga do Windows (Latin-1), não UTF-8. CSVs salvos hoje são quase sempre UTF-8. Resultado: `Indústria` virava `IndÃºstria`, e a validação acusava "segmento desconhecido" em linhas corretas.
- **A correção:** para CSV, usamos `file.text()`, que é o **navegador** decodificando o arquivo como UTF-8, e entregamos o texto já pronto para a biblioteca (`type: 'string'`).
- Para XLSX/XLS continua `arrayBuffer`, porque esses formatos são **binários** (um `.xlsx` é na verdade um `.zip`) e guardam a codificação por dentro, então não têm esse problema.
- `condição ? A : B` é o operador ternário: "se CSV, faz A; senão, faz B".
- **Descobri esse bug testando** com a planilha de exemplo: a primeira execução deu 18 erros, sendo 4 deles falsos por causa dos acentos.

```js
        const nomePrimeiraAba = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[nomePrimeiraAba]
```
- Pega a **primeira aba** da planilha. Já existia.

```js
        this.dadosOriginais = XLSX.utils
          .sheet_to_json(worksheet, { defval: '' })
          .map(normalizarLinha)
```
- Converte a aba em array de objetos (ver 4.3) e **normaliza as chaves** de cada linha (`.map(normalizarLinha)`).
- **O `.map(normalizarLinha)` é novo**; o motivo está na explicação da linha 27.

```js
        this.tratarDados()
        this.validarDados()
```
- `tratarDados()` já existia: gera `dadosTratados`.
- **`validarDados()` é novo:** assim que a planilha é lida, ela já é validada. **Por que automático e sem botão?** Porque o fluxo do PDF é "Upload → Pinia → Relatório", sem passo intermediário, e um botão "validar" seria um clique a mais sem motivo: não existe caso em que você carregue a planilha e **não** queira saber se ela tem erro.

```js
      } catch (error) {
        console.error(error)
        this.erro = 'Não foi possível ler a planilha.'
      }
```
- Se o arquivo estiver corrompido, a biblioteca lança um erro; ele é mostrado no console (para o desenvolvedor) e numa mensagem amigável na tela (para o usuário). Já existia.

### Linhas 121–123: action `registrarErro` (simplificada)

```js
    registrarErro(linha, campo, mensagem, tipo) {
      this.errosDadosPlanilha.push({ linha, campo, mensagem, tipo })
    },
```

- Adiciona um erro na lista. `{ linha, campo, mensagem, tipo }` é a forma curta de `{ linha: linha, campo: campo, ... }`.
- **Como você tinha escrito:**
  ```js
  const erroProcessado = {linha, campo, mensagem, tipo}
  this.errosDadosPlanilha = [...this.errosDadosPlanilha, erroProcessado]
  ```
  Isso **funciona**, mas cria uma **cópia inteira** da lista a cada erro. Com 1.000 erros, são 1.000 cópias crescentes (cerca de 500 mil itens copiados no total). `push` só adiciona no fim.
- **"Mas no Vue não precisa criar array novo para a tela atualizar?"** No Vue 3 + Pinia, **não**. O state é reativo por *Proxy*, então o Vue percebe o `push` normalmente. A cópia com `[...]` é um hábito do React, onde é obrigatória.
- Os 4 campos (`linha`, `campo`, `mensagem`, `tipo`) são exatamente o que o PDF pede no relatório: **linha** do problema, **campo** do problema, **descrição** (mensagem) e o **tipo** para a contagem.

### Linhas 125–204: action `validarDados` (nova, o coração da atividade)

```js
    // Analisa os dados originais (antes do trim) e registra cada problema encontrado.
    validarDados() {
      this.errosDadosPlanilha = []
      const vistos = new Map()
```
- **L127**: zera os erros. Assim, se a validação rodar duas vezes, não duplica os erros.
- **L128**: `vistos` guarda `"nome|email"` → número da linha em que apareceu pela primeira vez. Serve para detectar duplicados.

```js
      this.dadosOriginais.forEach((linha, indice) => {
```
- Percorre **cada linha** da planilha. `indice` começa em 0.
- **Por que `dadosOriginais` e não `dadosTratados`?** Porque em `dadosTratados` os espaços já foram removidos e os segmentos já corrigidos; não daria para detectar esses problemas.

```js
        const numeroLinha = indice + 2 // linha 1 da planilha é o cabeçalho
```
- **Por que `+2`?** O índice começa em 0 (**+1**) e a linha 1 do Excel é o cabeçalho (**+1**). Então o primeiro registro (`indice 0`) está na **linha 2** do Excel. Assim o número mostrado no relatório é **o mesmo que a pessoa vê no Excel**, e ela vai direto na linha certa.

```js
        const texto = (campo) => String(linha[campo] ?? '').trim()
```
- Funçãozinha que pega o valor de um campo **como texto limpo**.
- `linha[campo] ?? ''`: se a coluna não existir (`undefined`), usa `''`.
- `String(...)`: o Excel pode entregar números (ex.: telefone `11987654321` vira número). `String` converte para texto para podermos usar `.trim()`, `.replace()`, etc.
- `.trim()`: remove espaços das pontas.
- **Por que declarar dentro do forEach?** Porque ela usa a `linha` atual. É uma *closure*: ela "lembra" da linha em que foi criada.

#### Validação 1: campos obrigatórios vazios (L134–138)

```js
        for (const campo of CAMPOS_OBRIGATORIOS) {
          if (!texto(campo)) {
            this.registrarErro(numeroLinha, campo, 'Campo obrigatório vazio.', 'vazio')
          }
        }
```
- Para cada campo obrigatório, se o texto limpo estiver vazio (`''` é "falsy", então `!''` é `true`), registra erro.
- **Pega também** células com **só espaços** (`"   "` → `trim` → `''`), que visualmente parecem preenchidas mas não são.
- Pega também a **coluna ausente** da planilha (`undefined` → `''`).

#### Validação 2: espaços desnecessários (L140–144)

```js
        for (const [campo, valor] of Object.entries(linha)) {
          if (typeof valor === 'string' && valor.trim() && (valor !== valor.trim() || /\s{2,}/.test(valor))) {
            this.registrarErro(numeroLinha, campo, `Espaços desnecessários em "${valor}".`, 'espacos')
          }
        }
```
- Olha **todas as colunas** (não só as conhecidas), porque espaço sobrando é problema em qualquer campo.
- A condição tem 3 partes ligadas por `&&` (todas precisam ser verdadeiras):
  1. `typeof valor === 'string'`: só texto tem espaço; números não.
  2. `valor.trim()`: o campo **não** é só espaços. Se fosse só espaços, já seria "vazio" (e só se for obrigatório); não faz sentido acusar dois erros.
  3. `(valor !== valor.trim() || /\s{2,}/.test(valor))`: **ou** tem espaço nas pontas (o valor muda quando faz trim), **ou** tem 2+ espaços seguidos no meio (`"Padaria  Central"`).
- A mensagem usa **template string** (crase `` ` `` com `${valor}`) para mostrar o valor com os espaços entre aspas, ficando visível onde estão.

#### Validação 3: e-mail (L146–151)

```js
        const email = texto('email')
        if (email && !REGEX_EMAIL.test(email)) {
          this.registrarErro(numeroLinha, 'email', `E-mail inválido: "${email}".`, 'email')
        } else if (email && email !== email.toLowerCase()) {
          this.registrarErro(numeroLinha, 'email', `E-mail deve estar em minúsculas: "${email}".`, 'padronizacao')
        }
```
- `email &&`: só valida se **tem** e-mail. Se estiver vazio, o erro "vazio" já foi registrado acima; não precisa acusar "inválido" também.
- `!REGEX_EMAIL.test(email)`: não bate com o formato → **inválido**.
- `else if` com maiúsculas: e-mail válido mas com maiúsculas (`Ana@Empresa.com`) → **padronização**. E-mail não diferencia maiúsculas, mas guardar misturado atrapalha buscas e duplicados.
- **Por que `else if`?** Se já é inválido, não adianta reclamar das maiúsculas também. Um erro por problema.

#### Validação 4: nome (L153–159)

```js
        const nome = texto('nome')
        if (nome && (nome === nome.toUpperCase() || nome === nome.toLowerCase())) {
          this.registrarErro(numeroLinha, 'nome', `Nome todo em maiúsculas/minúsculas: "${nome}".`, 'padronizacao')
        }
        if (/\d/.test(nome)) {
          this.registrarErro(numeroLinha, 'nome', `Nome contém números: "${nome}".`, 'padrao')
        }
```
- **Padronização:** se o nome é igual à versão toda maiúscula (`TECH SOLUÇÕES`) ou toda minúscula (`padaria central`), foi digitado sem padrão. O padrão esperado é `Tech Soluções`.
- **Fora do padrão:** nome de cliente com dígito (`Empresa 123`) é provavelmente erro de digitação ou coluna trocada.
- Aqui são dois `if` separados (não `else if`) porque são problemas **independentes**: um nome pode ter os dois.

#### Validação 5: segmento (L161–167)

```js
        const segmento = texto('segmento')
        const segmentoPadrao = segmento && padronizarSegmento(segmento)
        if (segmento && !segmentoPadrao) {
          this.registrarErro(numeroLinha, 'segmento', `Segmento desconhecido: "${segmento}". Use Indústria, Comércio ou Serviços.`, 'padrao')
        } else if (segmentoPadrao && segmento !== segmentoPadrao) {
          this.registrarErro(numeroLinha, 'segmento', `"${segmento}" deve ser escrito como "${segmentoPadrao}".`, 'padronizacao')
        }
```
- `segmentoPadrao`: a forma oficial (ex.: `"Comércio"`) ou `undefined` se não existir. O `segmento &&` evita chamar a função com texto vazio.
- **Três situações possíveis:**
  | Valor na planilha | `segmentoPadrao` | Resultado |
  |---|---|---|
  | `Agro` | `undefined` | **fora do padrão** (segmento não existe) |
  | `comercio` | `Comércio` | **padronizar** (existe, mas escrito diferente) |
  | `Comércio` | `Comércio` | ok, nenhum erro |
- **A diferença entre `padrao` e `padronizacao`:** "fora do padrão" = o dado está **errado** e precisa de uma pessoa para corrigir; "padronizar" = o dado está **certo mas mal escrito**, e o sistema já sabe corrigir sozinho (o `tratarDados` faz isso).

#### Validação 6: nível do cliente (L169–174)

```js
        const nivel = texto('nivel_cliente')
        if (nivel && !/^[ABC]$/i.test(nivel)) {
          this.registrarErro(numeroLinha, 'nivel_cliente', `Nível inválido: "${nivel}". Use A, B ou C.`, 'padrao')
        } else if (nivel && nivel !== nivel.toUpperCase()) {
          this.registrarErro(numeroLinha, 'nivel_cliente', `Nível deve estar em maiúscula: "${nivel}".`, 'padronizacao')
        }
```
- **Por que A, B ou C?** No backend, `Cliente.java` tem `Character nivel` com `@Column(length = 1)`, ou seja, **uma letra**. A, B, C é a classificação usual de cliente (curva ABC).
- `/^[ABC]$/i`: exatamente **uma** letra, A/B/C, aceitando minúscula (`i`). `D`, `AA`, `1` falham → fora do padrão.
- `else if`: se for `a`, `b` ou `c` minúsculo → padronizar (o `tratarDados` já converte para maiúscula).
- ⚠️ Se no projeto os níveis forem outros, mude a regex aqui.

#### Validação 7: telefone (L176–179)

```js
        const telefone = texto('telefone')
        if (telefone && ![10, 11].includes(telefone.replace(/\D/g, '').length)) {
          this.registrarErro(numeroLinha, 'telefone', `Telefone deve ter DDD + 8 ou 9 dígitos: "${telefone}".`, 'padrao')
        }
```
- `telefone.replace(/\D/g, '')`: remove tudo que não é dígito. `"(11) 98765-4321"` → `"11987654321"`.
- `.length`: conta os dígitos.
- Telefone brasileiro = DDD (2) + 8 dígitos (fixo) = **10**, ou DDD (2) + 9 dígitos (celular) = **11**.
- `![10, 11].includes(...)`: se não for 10 nem 11 → fora do padrão.
- **Telefone não é obrigatório** (não está em `CAMPOS_OBRIGATORIOS`). Por isso o `telefone &&`: vazio passa, preenchido errado não passa.
- **Aceita qualquer formatação** (`11987654321`, `(11) 98765-4321`, `11 98765 4321`) porque só conta dígitos.

#### Validação 8: faturamento (L181–190)

```js
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
```
- **Por que `linha.faturamento` e não `texto('faturamento')`?** Porque precisamos saber se o Excel entregou um **número** de verdade. `texto()` converteria para string e perderíamos essa informação.
- `!== undefined && !== ''`: faturamento é opcional; só valida se preenchido.
- **Se for número** (veio de célula numérica do Excel), usa direto.
- **Se for texto** (CSV, ou célula formatada como texto), converte no formato brasileiro:
  - `"R$ 1.234,56"` → remove `R`, `$`, espaços e pontos → `"1234,56"` → troca `,` por `.` → `"1234.56"` → `Number` → `1234.56`.
- `Number.isNaN(valor)`: se não virou número (`"abc"` → `NaN`) → erro.
- `valor < 0`: faturamento negativo não faz sentido → erro.
- **O comentário `ponytail:`** marca uma simplificação consciente: se alguém escrever no formato americano (`"1234.56"`), o ponto é tratado como separador de milhar e o valor vira `123456`. Para planilhas brasileiras é o comportamento certo; se aparecer planilha em formato americano, essa linha é a que precisa mudar.

#### Validação 9: registros duplicados (L192–200)

```js
        // Duplicado = mesmo nome + e-mail, ignorando maiúsculas e espaços.
        if (nome || email) {
          const chave = `${nome.toLowerCase()}|${email.toLowerCase()}`
          if (vistos.has(chave)) {
            this.registrarErro(numeroLinha, 'nome/email', `Registro duplicado da linha ${vistos.get(chave)}.`, 'duplicado')
          } else {
            vistos.set(chave, numeroLinha)
          }
        }
```
- `if (nome || email)`: linhas totalmente em branco não entram (senão todas as linhas vazias seriam "duplicadas" entre si).
- **A chave:** `"metalúrgica souza|contato@souza.com.br"`. O `|` separa os dois para não confundir (`"ab" + "c"` e `"a" + "bc"` seriam iguais sem separador).
- `.toLowerCase()` + o fato de `nome` e `email` já virem com `trim` (da função `texto`) → `" Ana "` e `"ana"` contam como o mesmo registro.
- **Primeira vez que vê a chave:** guarda no Map com o número da linha.
- **Já viu antes:** registra erro dizendo **qual linha é a original** (`"Registro duplicado da linha 2."`). A primeira ocorrência **não** é marcada como erro, só as repetições. Assim, ao apagar as linhas acusadas, sobra exatamente um de cada.
- **Por que nome + e-mail e não a linha inteira?** Porque se a mesma empresa aparece duas vezes com o telefone escrito diferente, ainda é duplicado. Comparar a linha inteira deixaria esse caso passar.
- **Por que `Map` e não um array com `.find()`?** `Map.has` é instantâneo; `.find` em array percorre tudo a cada linha, o que fica lento em planilhas grandes.

```js
      })

      this.validado = true
    },
```
- Depois de percorrer todas as linhas, marca como validado. A tela mostra o relatório.

### Linhas 206–220: actions de arquivos em upload

`atualizarArquivo`, `adicionarArquivo`, `removerArquivo`: **não mexi**. Controlam a lista do card de upload.

### Linhas 222–246: action `tratarDados` (modificada)

```js
    tratarDados() {
      this.dadosTratados = this.dadosOriginais.map((linha) => {
        const novaLinha = {}
        for (const [chave, valor] of Object.entries(linha)) {
          if (typeof valor === 'string') {
            novaLinha[chave] = valor.trim()
          } else {
            novaLinha[chave] = valor
          }
        }
```
- Copia cada linha, tirando espaços das pontas dos textos. Já existia.

```js
        if (typeof novaLinha.segmento === 'string') {
          novaLinha.segmento = padronizarSegmento(novaLinha.segmento) || novaLinha.segmento
        }
```
- **Mudou:** antes tinha o mapa de 11 entradas escrito aqui dentro (com bug). Agora usa `padronizarSegmento`.
- `|| novaLinha.segmento`: se o segmento não for conhecido (`undefined`), mantém como está. **Não apaga** dado que o sistema não entende; deixa para a pessoa corrigir (a validação já acusou "fora do padrão").

```js
        if (typeof novaLinha.nivel_cliente === 'string') {
          novaLinha.nivel_cliente = novaLinha.nivel_cliente.toUpperCase()
        }
        return novaLinha
      })
    },
```
- Nível em maiúscula. Já existia.

### Linhas 248–255: action `limpar`

Zera tudo, incluindo `errosDadosPlanilha` e `validado` (você já tinha adicionado essas duas). Assim, clicar em "Limpar" esconde o relatório.

---

## 6. `Upload.vue` linha por linha (o que mudou)

### Linhas 1–10: script

```js
import { computed, ref } from 'vue'
```
- **Novo.** `ref` cria uma variável reativa (o filtro); `computed` cria um valor calculado (a lista filtrada).

```js
import { useUploadStore, TIPOS_ERRO } from '../Stores/uploadStore.js'
```
- **Mudou:** agora importa também `TIPOS_ERRO` (aquele `export` da store) para usar no filtro e na tabela.

```js
const store = useUploadStore()
```
- Pega a store. Já existia.

```js
const filtroTipo = ref('')
```
- **Novo.** O tipo selecionado no `<select>`. `''` = "Todos os tipos".
- **Por que na tela e não na store?** Porque o filtro é **só visual**: não é dado da planilha nem resultado da validação. Se outra tela usasse a store, não faria sentido ela herdar o filtro desta. Estado que só interessa a um componente fica no componente.

```js
const errosFiltrados = computed(() =>
  store.errosDadosPlanilha.filter((e) => !filtroTipo.value || e.tipo === filtroTipo.value)
)
```
- **Novo.** Lista de erros a mostrar na tabela de detalhes.
- `!filtroTipo.value ||`: se o filtro está vazio (Todos), a condição é `true` para todos; nada é filtrado.
- Senão, só os erros daquele tipo.
- `.value` porque `filtroTipo` é um `ref` (dentro do `<script>` precisa de `.value`; no `<template>` não).
- `computed` recalcula sozinho quando o filtro **ou** os erros mudam.

```js
function escolherArquivo(files) { ... }
```
- Não mexi. Chama `store.lerArquivo(file)`, que agora já valida.

### Linhas 65–68: container do relatório

```html
<div
  v-if="store.validado"
  class="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-kairos-panel shadow-sm"
>
```
- `v-if="store.validado"`: o relatório **só aparece** depois da validação.
- As classes (`bg-kairos-panel`, `rounded-2xl`, `border-white/10`) são as **mesmas** dos outros blocos da tela, para o relatório parecer parte do sistema e não algo colado.

### Linhas 69–72: cabeçalho, com o nome do arquivo

```html
<h2 class="font-bold text-kairos-white">Relatório de validação</h2>
<p class="text-sm text-kairos-muted">Arquivo analisado: <strong>{{ store.nomeArquivo }}</strong></p>
```
- Item do PDF: **"nome do arquivo analisado"**. Usa o getter `nomeArquivo`.

### Linhas 74–91: 4 cards de resumo

```html
<div class="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
```
- Grade de 2 colunas no celular e 4 em telas maiores (`sm:`). Responsivo.

| Card | Getter | Item do PDF |
|---|---|---|
| registros | `totalLinhas` | total de registros |
| registros válidos (verde) | `registrosValidos` | quantidade de registros válidos |
| registros com erro (vermelho) | `registrosComErro` | quantidade de registros com erro |
| erros encontrados | `totalErros` | (extra) total de problemas |

- Cores verde/vermelho para leitura rápida: bateu o olho, sabe se está bom.

### Linhas 93–112: tabela "Validação realizada / Quantidade"

```html
<tr v-for="item in store.errosPorTipo" :key="item.tipo" ...>
  <td>{{ item.descricao }}</td>
  <td :class="item.quantidade ? 'text-red-500' : 'text-kairos-muted'">{{ item.quantidade }}</td>
</tr>
```
- Uma linha por tipo de erro, vindo do getter `errosPorTipo`. Item do PDF: **"quantidade de cada tipo de erro"**.
- `:key="item.tipo"`: o Vue precisa de uma chave única por item de `v-for` para atualizar a lista corretamente.
- `:class` com ternário: quantidade maior que 0 fica **vermelha**; 0 fica cinza. Destaca onde tem problema.

```html
<tr ...>
  <td>Registros válidos</td>
  <td class="... text-green-500">{{ store.registrosValidos }}</td>
</tr>
```
- Última linha fixa com os válidos. **Reproduz exatamente** a tabela de exemplo do PDF (que termina com "Registros válidos 86").

### Linhas 114–121: título e filtro

```html
<div v-if="store.totalErros" class="border-t border-white/10">
```
- A seção de detalhes só aparece **se houver erros**.

```html
<select v-model="filtroTipo" ...>
  <option value="">Todos os tipos</option>
  <option v-for="(descricao, tipo) in TIPOS_ERRO" :key="tipo" :value="tipo">{{ descricao }}</option>
</select>
```
- `v-model="filtroTipo"`: ligação nos dois sentidos. Escolher uma opção muda `filtroTipo`, que muda `errosFiltrados`, que muda a tabela.
- `v-for="(descricao, tipo) in TIPOS_ERRO"`: `v-for` num **objeto** entrega `(valor, chave)`, nessa ordem. Então cada opção tem `value="vazio"` e mostra "Campos vazios".
- **Por que ter filtro?** Uma planilha com 500 linhas pode ter centenas de erros. O filtro permite, por exemplo, ver só os duplicados e resolver um tipo de cada vez.

### Linhas 122–141: tabela de detalhes

```html
<div class="max-h-96 overflow-auto">
```
- Altura máxima com rolagem, para não empurrar a prévia dos dados para muito longe.

```html
<thead class="sticky top-0 bg-kairos-panel">
```
- Cabeçalho **grudado** no topo ao rolar. O `bg-kairos-panel` é necessário porque, sem fundo, as linhas apareceriam por trás do cabeçalho.

```html
<tr v-for="(e, i) in errosFiltrados" :key="i" ...>
  <td>{{ e.linha }}</td>
  <td>{{ e.campo }}</td>
  <td>{{ TIPOS_ERRO[e.tipo] }}</td>
  <td>{{ e.mensagem }}</td>
</tr>
```
- Uma linha por erro. Itens do PDF: **linha** em que o problema foi encontrado, **campo** que apresentou o problema, **descrição** do erro. O tipo vai junto para contexto.
- `TIPOS_ERRO[e.tipo]`: traduz `'padrao'` em `'Dados fora do padrão'`.
- `:key="i"` usa o índice porque um erro não tem id próprio (a mesma linha e campo podem ter dois erros diferentes).

### Linha 143: mensagem de sucesso

```html
<p v-else class="... text-green-500">Nenhum erro encontrado.</p>
```
- `v-else` pertence ao `v-if="store.totalErros"`: se não tem erro, mostra essa mensagem em vez da tabela vazia.

### Resto da tela

O card de upload, o resumo, a prévia dos dados tratados e o aviso "Próxima etapa" **continuam iguais**.

---

## 7. `docs/exemplo-clientes.csv`, a planilha de teste

```
nome,email,telefone,segmento,nivel_cliente,faturamento
```
Linha de cabeçalho (linha 1 do Excel).

Cada linha foi montada para disparar erros específicos:

| Linha Excel | Conteúdo | Erros esperados | Por quê |
|---|---|---|---|
| 2 | Metalúrgica Souza, tudo certo | **nenhum** | prova que registro correto passa |
| 3 | `comercio`, nível `b` | 2× padronizar | segmento sem acento/minúsculo; nível minúsculo |
| 4 | `"  Padaria Central "`, `padaria@central` | espaços + e-mail inválido | espaços nas pontas; e-mail sem `.com` |
| 5 | `TECH SOLUÇÕES`, sem e-mail, tel `1234`, nível `D`, faturamento `-500` | vazio + padronizar + 3× fora do padrão | vários erros numa linha só (testa que conta **1 registro**) |
| 6 | cópia exata da linha 2 | duplicado | aponta "duplicado da linha 2" |
| 7 | sem nome, segmento `Agro`, faturamento `abc` | vazio + 2× fora do padrão | segmento inexistente, faturamento não numérico |
| 8 | `SERVICOS` | padronizar | segmento em maiúsculas sem cedilha |

**Resultado:** 7 registros, **1 válido**, 6 com erro, 14 erros no total.

Serve para: (1) você demonstrar a funcionalidade na apresentação, (2) o teste automático da seção 8.

---

## 8. `Frontend/scripts/check-validacao.mjs`, o teste automático

**Por que existe:** a validação tem muita regra (regex, ifs, contagens). Se alguém mexer e quebrar uma regra, a tela não reclama; ela só mostra números errados. Este script prova que os números estão certos.

```js
import assert from 'node:assert'
```
- Módulo nativo do Node para verificações. `assert.strictEqual(a, b)` para o programa com erro se `a !== b`. Não precisa instalar nada.

```js
import { readFileSync } from 'node:fs'
```
- Para ler o CSV do disco.

```js
import { createPinia, setActivePinia } from 'pinia'
import { useUploadStore } from '../src/Stores/uploadStore.js'
```
- Fora do Vue não existe `app.use(createPinia())`. Então criamos uma instância do Pinia manualmente e a ativamos com `setActivePinia`. Depois disso, `useUploadStore()` funciona normalmente.

```js
setActivePinia(createPinia())
const store = useUploadStore()
```

```js
const conteudo = readFileSync(new URL('../../docs/exemplo-clientes.csv', import.meta.url), 'utf8')
```
- `import.meta.url` é o endereço **deste script**. O `new URL('../../docs/...', ...)` monta o caminho relativo a ele. Assim o script funciona **de qualquer pasta** em que você rode o comando.

```js
await store.lerArquivo({ name: 'exemplo-clientes.csv', text: async () => conteudo })
```
- `lerArquivo` espera um `File` do navegador, que não existe no Node. Mas ela só usa `file.name` e `file.text()`. Então passamos um **objeto falso** com só essas duas coisas. Isso se chama *mock* ou *dublê*.
- Isso roda **exatamente o mesmo código** que a tela usa: leitura, tratamento e validação.

```js
const porTipo = Object.fromEntries(store.errosPorTipo.map((e) => [e.tipo, e.quantidade]))
assert.deepStrictEqual(porTipo, { vazio: 2, espacos: 1, duplicado: 1, email: 1, padrao: 5, padronizacao: 4 })
```
- Transforma o getter em `{ vazio: 2, ... }` e compara com o esperado. `deepStrictEqual` compara objetos campo a campo.

```js
assert.strictEqual(store.totalLinhas, 7)
assert.strictEqual(store.registrosValidos, 1)
assert.strictEqual(store.registrosComErro, 6)
console.log('ok')
```
- Confere os três getters principais. Se tudo passar, imprime `ok`.

**Como rodar:**
```bash
cd Frontend
node scripts/check-validacao.mjs
```

**Por que não Vitest/Jest?** Seria uma dependência nova + configuração, para **um** teste. O `assert` do Node resolve com zero instalação. Se o projeto crescer e tiver vários testes, aí vale a pena um framework.

---

## 9. `docs/Relatorio-Validacao-Planilha.docx`, o documento de entrega

O item 2 do PDF pede um `.doc`/`.docx` explicando a–e. O documento tem:

- título, **nome (Henrique de Paula Valim Melo)** e **data (28 de setembro de 2026)**;
- introdução com o fluxo e os arquivos principais;
- **a)** tabela com cada propriedade do state;
- **b)** tabela com cada getter e o que calcula;
- **c)** tabela com cada action;
- **d)** tabela com cada tipo de validação e a regra;
- **e)** como o relatório aparece na tela;
- exemplo com os números da planilha de teste.

Foi gerado com a biblioteca Python `python-docx` (instalada num ambiente temporário, **não** faz parte do projeto). Se precisar editar, abra no Word/LibreOffice normalmente.

---

## 10. Bugs que existiam e foram corrigidos

### Bug 1: getter `totalErros` devolvia um array, não um número

```js
// ANTES
totalErros: (state) => {
  if (!state.errosDadosPlanilha.length) return 0
  return Object.keys(state.errosDadosPlanilha[0])
}
```
`Object.keys` do primeiro erro → `['linha', 'campo', 'mensagem', 'tipo']`. Na tela apareceria `linha,campo,mensagem,tipo` em vez de `14`.

```js
// DEPOIS
totalErros: (state) => state.errosDadosPlanilha.length,
```

### Bug 2: getter `localErro` quebrava a aplicação

```js
// ANTES
localErro: (state) => new Set(state.errosDadosPlanilha.map(linhas => linhas.trim())).size
```
Cada item de `errosDadosPlanilha` é um **objeto** `{ linha, campo, ... }`. Objeto não tem `.trim()` (só string tem). Assim que existisse **um** erro, isso lançaria `TypeError: linhas.trim is not a function`.

A intenção (contar linhas diferentes com Set) estava certa. Faltava pegar o **número da linha**:
```js
// DEPOIS (renomeado para deixar claro o que conta)
registrosComErro: (state) => new Set(state.errosDadosPlanilha.map((e) => e.linha)).size,
```

### Bug 3: mapa de segmentos com chaves que nunca batiam

```js
// ANTES
const segmento = novaLinha.segmento.trim().toUpperCase()   // sempre MAIÚSCULO
const mapaSegmentos = {
  'industria': 'Indústria',   // minúsculo: nunca bate
  'indústria': 'Indústria',   // minúsculo: nunca bate
  'comércio': 'Comércio',     // minúsculo: nunca bate
  'comercio': 'Comércio',     // minúsculo: nunca bate
  ...
}
```
O código convertia para maiúsculas e **depois** procurava chaves minúsculas. 4 das 11 chaves eram código morto. E faltava `SERVIÇOS` sem acento e com cedilha em outras combinações.

**Depois:** converte para maiúsculas **e tira acento**, e o mapa só tem as formas canônicas. 4 chaves cobrem todas as combinações.

### Bug 4: CSV com acento era lido errado

Explicado em detalhes nas linhas 101–104 da seção 5. `Indústria` virava `IndÃºstria`. Descoberto rodando o teste com a planilha de exemplo.

### Bug 5: cabeçalhos com maiúscula/acento/hífen não eram reconhecidos

Não era um bug no código antigo (ele não validava nada), mas seria um bug **na validação**: uma planilha com a coluna `E-mail` faria todas as linhas acusarem "e-mail vazio". Resolvido com `normalizarChave`.

---

## 11. Decisões e limitações conhecidas

| Decisão | Por quê | Limitação / quando mudar |
|---|---|---|
| Relatório na tela de upload, sem tela própria | Pedido seu | Se o professor exigir a tela separada: criar `Relatorio.vue`, mover o bloco `v-if="store.validado"` para lá e adicionar a rota em `router/index.js`. A store não muda nada. |
| Validação roda automaticamente ao ler o arquivo | Fluxo do PDF não tem passo intermediário | Nenhuma. |
| Colunas esperadas: nome, email, telefone, segmento, nivel_cliente, faturamento | Baseado no `Cliente.java` do backend | **Se a planilha oficial tiver outras colunas, ajuste `CAMPOS_OBRIGATORIOS` e as validações.** |
| Nível só A/B/C | `Character` de 1 letra no backend | Mude a regex `/^[ABC]$/i` se for outro padrão. |
| Faturamento texto = formato brasileiro | Planilhas daqui usam `1.234,56` | `"1234.56"` (americano) vira `123456`. Marcado com comentário `ponytail:` no código. |
| Duplicado = nome + e-mail | Pega a mesma empresa mesmo com outros campos diferentes | Duas empresas com mesmo nome e mesmo e-mail seriam acusadas (situação improvável). |
| Nome todo maiúsculo = padronizar | Pega `TECH SOLUÇÕES` digitado com Caps Lock | Siglas curtas legítimas (`IBM`) também são acusadas. Como é só "padronizar", não "erro grave", é aceitável. |
| Erros de padronização contam como "registro com erro" | O PDF lista "textos que precisam ser padronizados" como validação | Se quiser tratar como **aviso** (não reduzir os válidos), seria preciso separar avisos de erros no getter `registrosComErro`. |
| Só a 1ª aba da planilha é lida | Já era assim | Planilhas com várias abas: só a primeira é validada. |
| `filtroTipo` no componente, não na store | É estado visual, não dado | Nenhuma. |

---

## 12. Como testar tudo

**Teste automático:**
```bash
cd Frontend
node scripts/check-validacao.mjs
# deve imprimir: ok
```

**Build (garante que não tem erro de sintaxe no Vue):**
```bash
cd Frontend
npm run build
```

**Na tela:**
```bash
cd Frontend
npm run dev
```
1. Abra `http://localhost:5173/upload`.
2. Arraste `docs/exemplo-clientes.csv` para o card.
3. Confira: 7 registros, 1 válido, 6 com erro, 14 erros.
4. Use o filtro "Registros duplicados": deve aparecer só a linha 6.
5. Clique em "Limpar": o relatório some.

---

## 13. Perguntas que o professor pode fazer (e as respostas)

**"O que é state, getter e action?"**
State são os dados guardados (a planilha, os erros). Getter é um valor **calculado** a partir do state, que se atualiza sozinho (total de válidos, contagem por tipo). Action é uma **função que faz algo** e altera o state (ler o arquivo, validar, registrar erro).

**"Por que `registrosValidos` é getter e não está no state?"**
Porque ele é derivado de outros dados. Se estivesse no state, eu teria que lembrar de atualizá-lo toda vez que um erro fosse adicionado. Como getter, ele é sempre consistente.

**"Por que a validação usa `dadosOriginais` e não `dadosTratados`?"**
Porque o tratamento já remove espaços e corrige segmentos. Validando os dados tratados, esses problemas já teriam sumido e não seriam relatados.

**"Por que a linha do erro é `indice + 2`?"**
O índice do array começa em 0 e a linha 1 do Excel é o cabeçalho. Assim o número bate com o que o usuário vê no Excel.

**"Um registro com 3 erros conta como quantos registros com erro?"**
Um. O getter `registrosComErro` usa um `Set` com os números das linhas, e o Set não repete.

**"Qual a diferença entre 'fora do padrão' e 'a padronizar'?"**
Fora do padrão é dado **errado**, que precisa de uma pessoa (segmento `Agro`, nível `D`, telefone com 4 dígitos). A padronizar é dado **certo mas escrito diferente**, que o sistema sabe corrigir sozinho (`comercio` → `Comércio`); o `tratarDados` já faz essa correção.

**"Como você detecta duplicados?"**
Monto uma chave com nome + e-mail em minúsculas e sem espaços, e guardo num `Map` com a linha em que apareceu. Se a chave já existe, é duplicado, e a mensagem diz qual é a linha original.

**"Por que `push` e não `[...array, item]`?"**
No Vue 3 o state é reativo via Proxy, então o `push` já atualiza a tela. Criar um array novo a cada erro copia a lista inteira toda vez, o que é desnecessário.

**"Como você sabe que funciona?"**
Tem uma planilha de teste com erros conhecidos e um script que roda a store de verdade e confere cada número com `assert`.
