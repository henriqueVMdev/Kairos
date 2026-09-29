
CTI PROVEDOR / CTI INSIGHTS
GUIA DIDÁTICO — PINIA (STATE, GETTER E ACTION)
======================================================

======================================================
1. STATE
======================================================

O QUE É STATE
-------------
State é a parte da Store que guarda os dados que a aplicação
precisa acompanhar enquanto o usuário está usando a tela.

No nosso projeto, o State pode guardar:
- arquivo selecionado;
- nome do arquivo;
- data do upload;
- tamanho do arquivo;
- dados brutos da planilha;
- dados válidos;
- dados inválidos;
- mensagens de erro;
- status da validação;
- status de carregamento.

Esses dados ficam temporariamente no front-end.
Eles NÃO são gravados de forma permanente só porque estão no Pinia.


CÓDIGO
------

const arquivo = ref(null) // Guarda temporariamente o arquivo selecionado.

const nomeArquivo = ref('') // Guarda o nome do arquivo.

const dataUpload = ref(null) // Guarda a data e a hora do upload.

const tamanhoArquivo = ref(0) // Guarda o tamanho do arquivo em bytes.

const dadosBrutos = ref([]) // Guarda as linhas lidas diretamente da planilha.

const dadosValidos = ref([]) // Guarda as linhas que passaram na validação.

const dadosInvalidos = ref([]) // Guarda as linhas que apresentaram problemas.

const erros = ref([]) // Guarda mensagens de erro para mostrar ao usuário.

const statusValidacao = ref('Aguardando arquivo') // Guarda o estado atual da validação.

const carregando = ref(false) // Informa se o sistema está processando alguma etapa.


EXEMPLO
-------
Depois que o usuário carregar a planilha:

nomeArquivo.value = 'dados.xlsx'

dataUpload.value = new Date()

statusValidacao.value = 'Dados lidos'

carregando.value = false


======================================================
2. GETTER
======================================================

O QUE É GETTER
--------------
Getter é usado para calcular informações a partir do State.

O Getter não precisa salvar outro valor manualmente.
Quando o State muda, o resultado calculado também pode mudar.

No nosso projeto, o Getter pode calcular:
- quantidade total de linhas;
- quantidade de dados válidos;
- quantidade de dados inválidos;
- quantidade de clientes únicos;
- quantidade de serviços;
- quantidade de contratos;
- percentual de validade;
- faturamento total;
- faturamento médio.


CÓDIGO
------

const quantidadeLinhas = computed(() => dadosBrutos.value.length
 // Conta quantas linhas foram recebidas.
)

const quantidadeValidas = computed(() =>dadosValidos.value.length
 // Conta quantas linhas passaram na validação.
)

const quantidadeInvalidas = computed(() => dadosInvalidos.value.length 
// Conta quantas linhas apresentaram erro.
)

const quantidadeClientes = computed(() => {

  const codigos = dadosBrutos.value
    .map(linha => linha.codigo_cliente) // Pega o código de cada cliente.
    .filter(Boolean) // Remove códigos vazios.

  return new Set(codigos).size // Elimina duplicados e conta os clientes únicos.
})

const percentualValido = computed(() => {

  if (quantidadeLinhas.value === 0) return 0 // Evita divisão por zero.

  return (
    (quantidadeValidas.value / quantidadeLinhas.value) * 100
  ).toFixed(1) // Calcula a porcentagem de linhas válidas.
})


EXEMPLO
-------
Se tivermos:

38 linhas recebidas
32 linhas válidas
6 linhas inválidas

Então:

quantidadeLinhas = 38
quantidadeValidas = 32
quantidadeInvalidas = 6
percentualValido = 84,2%


======================================================
3. ACTION
======================================================

O QUE É ACTION
--------------
Action é usada quando precisamos executar uma ação
que altera o State ou aplica alguma lógica.

No nosso projeto, a Action pode:
- registrar o arquivo;
- guardar as linhas lidas;
- validar campos;
- padronizar texto;
- identificar duplicidades;
- separar dados válidos e inválidos;
- criar mensagens para o usuário;
- limpar o upload;
- atualizar o status da validação.


O QUE VAMOS VALIDAR ANTES DO ETL
--------------------------------
Antes de enviar os dados para o Python/Pandas, podemos fazer
uma validação inicial para ajudar o usuário a corrigir problemas simples.

Podemos verificar:

1. CAMPO OBRIGATÓRIO VAZIO
   - código do cliente;
   - nome do cliente;
   - consultor;
   - segmento;
   - serviço;
   - cidade;
   - UF;
   - faturamento.

2. CÓDIGO DUPLICADO
   - o mesmo codigo_cliente não deve aparecer duas vezes.

3. PADRONIZAÇÃO DE TEXTO
   - remover espaços extras;
   - transformar UF em maiúsculo;
   - transformar nível em maiúsculo;
   - padronizar segmento.

4. SEGMENTO
   Podemos transformar:
   - industria
   - INDÚSTRIA
   - ind.
   em:
   - Indústria

5. FATURAMENTO
   Podemos validar:
   - se está vazio;
   - se é numérico;
   - se é negativo.

6. NÍVEL
   Podemos limitar:
   - A
   - B
   - C

7. MENSAGEM PARA O USUÁRIO
   Exemplo:
   "Linha 8: Nome do cliente está vazio"
   "Linha 15: Código duplicado"
   "Linha 21: Faturamento inválido"


CÓDIGO
------

function texto(valor) { // Cria uma função auxiliar para tratar textos.
  return String(valor ?? '').trim() // Converte em texto e remove espaços extras.
}

function normalizarUF(valor) { // Cria uma função para padronizar a UF.
  return texto(valor).toUpperCase() // Ex.: sp vira SP.
}

function normalizarNivel(valor) { // Cria uma função para padronizar o nível.
  return texto(valor).toUpperCase() // Ex.: a vira A.
}

function normalizarSegmento(valor) { // Cria uma função para padronizar o segmento.

  const original = texto(valor).toLowerCase() // Converte para minúsculo para facilitar a comparação.

  if (['ind.', 'industria', 'indústria'].includes(original)) {
    return 'Indústria' // Todas essas variações passam a ser Indústria.
  }

  if (['comercio', 'comércio'].includes(original)) {
    return 'Comércio' // Padroniza para Comércio.
  }

  if (['servicos', 'serviços'].includes(original)) {
    return 'Serviços' // Padroniza para Serviços.
  }

  if (['saude', 'saúde'].includes(original)) {
    return 'Saúde' // Padroniza para Saúde.
  }

  return texto(valor) // Se não houver regra, mantém o valor tratado.
}


function validarDados() { // Inicia a validação de todas as linhas.

  dadosValidos.value = [] // Limpa os dados válidos anteriores.

  dadosInvalidos.value = [] // Limpa os dados inválidos anteriores.

  erros.value = [] // Limpa as mensagens de erro anteriores.

  const codigosEncontrados = new Set() // Guarda os códigos já encontrados.

  dadosBrutos.value.forEach((linha, indice) => { // Percorre cada linha da planilha.

    const problemas = [] // Cria uma lista de problemas para a linha atual.

    const codigo = texto(linha.codigo_cliente) // Lê e limpa o código.

    const nome = texto(linha.nome_cliente) // Lê e limpa o nome.

    const consultor = texto(linha.consultor) // Lê e limpa o consultor.

    const segmento = normalizarSegmento(linha.segmento) // Padroniza o segmento.

    const nivel = normalizarNivel(linha.nivel_cliente) // Padroniza o nível.

    const uf = normalizarUF(linha.uf) // Padroniza a UF.

    const faturamento = linha.faturamento_anual // Lê o faturamento.

    if (!codigo) {
      problemas.push('Código do cliente está vazio') // Valida campo obrigatório.
    }

    if (!nome) {
      problemas.push('Nome do cliente está vazio') // Valida campo obrigatório.
    }

    if (!consultor) {
      problemas.push('Consultor está vazio') // Valida campo obrigatório.
    }

    if (!segmento) {
      problemas.push('Segmento está vazio') // Valida campo obrigatório.
    }

    if (!uf) {
      problemas.push('UF está vazia') // Valida campo obrigatório.
    }

    if (!['A', 'B', 'C'].includes(nivel)) {
      problemas.push('Nível deve ser A, B ou C') // Valida os valores permitidos.
    }

    if (
      faturamento === null ||
      faturamento === undefined ||
      faturamento === ''
    ) {
      problemas.push('Faturamento anual está vazio') // Verifica ausência de valor.
    }

    else if (Number.isNaN(Number(faturamento))) {
      problemas.push('Faturamento anual deve ser numérico') // Verifica se é número.
    }

    else if (Number(faturamento) < 0) {
      problemas.push('Faturamento anual não pode ser negativo') // Verifica valor negativo.
    }

    if (codigo && codigosEncontrados.has(codigo)) {
      problemas.push('Código do cliente duplicado') // Verifica código repetido.
    }

    if (codigo) {
      codigosEncontrados.add(codigo) // Guarda o código para comparar com as próximas linhas.
    }

    const linhaPadronizada = {
      ...linha, // Copia os campos originais.
      codigo_cliente: codigo, // Usa o código tratado.
      nome_cliente: nome, // Usa o nome tratado.
      consultor: consultor, // Usa o consultor tratado.
      segmento: segmento, // Usa o segmento padronizado.
      nivel_cliente: nivel, // Usa o nível padronizado.
      uf: uf, // Usa a UF padronizada.
      faturamento_anual:
        faturamento === '' ? null : Number(faturamento) // Converte o faturamento para número.
    }

    if (problemas.length === 0) {
      dadosValidos.value.push(linhaPadronizada) // Coloca a linha na lista de válidos.
    }

    else {
      dadosInvalidos.value.push({
        numeroLinha: indice + 2, // Soma 2 porque o Excel tem cabeçalho.
        codigo_cliente: codigo || '(sem código)', // Identifica a linha.
        problemas: problemas // Guarda todos os problemas encontrados.
      })

      erros.value.push(
        `Linha ${indice + 2}: ${problemas.join('; ')}`
      ) // Cria uma mensagem pronta para mostrar ao usuário.
    }
  })

  statusValidacao.value =
    dadosInvalidos.value.length === 0
      ? 'Arquivo válido'
      : 'Arquivo possui inconsistências'
  // Atualiza o status final da validação.
}


EXEMPLO
-------
Linha recebida:

codigo_cliente = CTI010
nome_cliente = ''
segmento = industria
nivel_cliente = a
uf = sp
faturamento_anual = 100000

Depois da padronização:

segmento = Indústria
nivel_cliente = A
uf = SP

Mas existe um problema:

nome_cliente está vazio

Então essa linha será colocada em:

dadosInvalidos

E o usuário poderá receber:

"Linha 11: Nome do cliente está vazio"


======================================================
5. RESUMO DA RESPONSABILIDADE DE CADA PARTE
======================================================

LEITURA DO EXCEL
- lê o arquivo;
- transforma a planilha em objetos JavaScript.

STATE
- guarda temporariamente os dados usados pela tela.

GETTER
- calcula totais, quantidades e percentuais.

ACTION
- executa validações;
- padroniza dados;
- separa válidos e inválidos;
- gera mensagens para o usuário.

PYTHON / ETL
- continuará fazendo o tratamento mais completo;
- análise de dados;
- transformações;
- estatística;
- preparação final dos dados.

POSTGRESQL
- será responsável por armazenar os dados permanentemente.


