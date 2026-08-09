---
name: Kairos
description: Inteligência visual para transformar sinais complexos em decisões claras.
colors:
  ink: "#050505"
  ink-soft: "#0b0b0b"
  panel: "#101010"
  white: "#f4f2ed"
  paper: "#ebe9e3"
  muted: "#9a9995"
  muted-dark: "#65645f"
  signal-blush: "#fec8c8"
  line: "rgba(255, 255, 255, 0.14)"
  line-dark: "rgba(5, 5, 5, 0.16)"
typography:
  display:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(3.4rem, 7vw, 7.4rem)"
    fontWeight: 500
    lineHeight: 0.93
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(2.3rem, 4vw, 3.6rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "clamp(1.55rem, 3vw, 2.35rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  accent:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.25rem, 2.3vw, 1.85rem)"
    fontWeight: 400
  subtitle:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "1.3rem"
    fontWeight: 500
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "DM Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
  label-sm:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "0.68rem"
    fontWeight: 400
  label-xs:
    fontFamily: "DM Mono, monospace"
    fontSize: "0.56rem"
    fontWeight: 400
    letterSpacing: "0.1em"
  micro:
    fontFamily: "DM Mono, monospace"
    fontSize: "0.5rem"
    fontWeight: 400
    letterSpacing: "0.08em"
rounded:
  control: "0.25rem"
  frame: "0.7rem"
  surface: "1rem"
  pill: "100px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 4.5rem)"
  section: "clamp(6rem, 10vw, 11rem)"
components:
  button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 0.9rem 0 1.35rem"
    height: "3.55rem"
  frame-dark:
    backgroundColor: "{colors.ink-soft}"
    textColor: "{colors.white}"
    rounded: "{rounded.frame}"
  input-dark:
    backgroundColor: "rgba(255, 255, 255, 0.055)"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "0 1rem"
    height: "3.4rem"
---

# Design System: Kairos

## Overview

**Creative North Star: "Instrumento de Decisão"**

Kairos se apresenta como um instrumento preciso: superfícies escuras, informação organizada por linhas finas e uma tipografia que alterna objetividade técnica com momentos editoriais. A expressão vem de dados em movimento, relações espaciais e contraste controlado, não de ornamento gratuito.

**Key Characteristics:**

- Alto contraste e paleta quase monocromática.
- Estruturas modulares marcadas por linhas discretas.
- Movimento lento e informativo em visualizações.
- Alternância entre Manrope funcional, Playfair Display editorial e DM Mono para dados.

## Colors

A base é preto profundo e branco levemente aquecido, com cinzas neutros para hierarquia e bordas translúcidas para estrutura.

### Primary

- **Ink** (`#050505`): fundo dominante e contraste dos controles claros.
- **Signal White** (`#f4f2ed`): texto principal e ações de maior prioridade.

### Secondary

- **Signal Blush** (`#fec8c8`): anomalias, erros e confirmações pontuais; nunca como cor decorativa dominante.

### Neutral

- **Ink Soft** (`#0b0b0b`): painéis e superfícies internas.
- **Panel** (`#101010`): planos secundários.
- **Paper** (`#ebe9e3`): seções claras e estados de alto contraste.
- **Muted** (`#9a9995`): texto secundário em fundo escuro.
- **Muted Dark** (`#65645f`): texto secundário em fundo claro.
- **Line** (`rgba(255, 255, 255, 0.14)`): divisores em superfícies escuras.

**The Signal Rarity Rule.** Cor de sinal aparece apenas quando comunica um estado ou dado específico; a interface permanece majoritariamente neutra.

## Typography

**Display Font:** Manrope (com Arial como fallback)
**Accent Font:** Playfair Display (com Georgia como fallback)
**Body Font:** Manrope (com Arial como fallback)
**Label/Mono Font:** DM Mono

**Character:** Manrope sustenta legibilidade e precisão. Playfair Display entra apenas como contraste editorial, geralmente em itálico. DM Mono identifica dados, índices e metainformação.

### Hierarchy

- **Display** (500, responsivo, `0.93`): títulos principais com tracking apertado, nunca menor que `-0.04em` em novas superfícies.
- **Accent** (400, itálico quando necessário): uma frase ou palavra de contraste dentro do display.
- **Body** (400–600, `1rem`, `1.5–1.7`): explicações e conteúdo funcional, preferencialmente até 70 caracteres por linha.
- **Label** (400, `0.5–0.64rem`, tracking amplo): dados, estados e metadados; caixa alta somente quando a função pede leitura técnica.

## Layout

O sistema usa um container máximo de `90rem`, gutters fluidos e grids que se tornam fluxos lineares abaixo de `900px`. Divisores e alinhamentos carregam a hierarquia; blocos importantes recebem espaço generoso acima. Em mobile, ações permanecem acessíveis, elementos decorativos recuam e painéis complexos se reorganizam em uma coluna.

## Elevation & Depth

A interface é plana por padrão. A profundidade vem de camadas tonais, recorte, linhas e escala; sombras amplas aparecem apenas em frames relevantes, como a demonstração do produto, para separá-los do fundo.

**The Flat-By-Default Rule.** Controles e cartões não recebem sombras cosméticas; borda, contraste e estado bastam na maior parte da interface.

## Shapes

Frames principais usam cantos discretamente arredondados, próximos de `0.7rem`. Controles internos são mais técnicos, com raio em torno de `0.25rem`. Pílulas ficam reservadas para ações compactas e botões de maior prioridade. Círculos identificam estados e pequenos controles de navegação.

## Components

### Buttons

- **Shape:** pílula para CTAs editoriais; retângulo técnico para ações internas.
- **Primary:** fundo claro, texto escuro e altura mínima confortável.
- **Hover / Focus:** inversão de contraste e outline visível, com transição curta e desaceleração natural.

### Cards / Containers

- **Corner Style:** raio moderado apenas nos frames externos.
- **Background:** planos `ink-soft` e `panel`.
- **Shadow Strategy:** sem sombra por padrão.
- **Border:** linha branca translúcida de `1px`.

### Inputs / Fields

- **Style:** fundo branco translúcido, linha fina, raio técnico e altura mínima de `3.4rem`.
- **Focus:** borda clara e outline externo visível.
- **Error:** `Signal Blush` na borda, outline e mensagem de recuperação.
- **Disabled:** contraste reduzido sem remover o rótulo ou o significado do estado.

### Navigation

Marca à esquerda, ação principal à direita e navegação móvel em tela cheia. Links usam contraste moderado no repouso e ficam claros no hover ou foco.

### Data Visuals

Grades, varreduras e partículas expressam relações ou estados reais da demonstração. Animações devem pausar fora da tela e respeitar `prefers-reduced-motion`.

## Do's and Don'ts

### Do:

- **Do** preservar alto contraste, linhas finas e hierarquia tipográfica direta.
- **Do** usar Playfair Display como contraponto raro, não como fonte funcional.
- **Do** fazer movimento comunicar sinal, foco ou mudança de estado.
- **Do** manter formulários e controles totalmente navegáveis por teclado.

### Don't:

- **Don't** preencher a interface com cores de destaque sem significado.
- **Don't** usar sombras suaves e cartões arredondados como decoração genérica.
- **Don't** transformar todos os rótulos em monospace ou caixa alta.
- **Don't** esconder conteúdo ou função essenciais atrás de animação.
