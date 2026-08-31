---
version: 1
slug: "src-loginpage-vue"
primary_target: "src/LoginPage.vue"
related_targets: ["src/main.js","src/App.vue"]
---

## Scope and mode

- Surface: `/login`
- Primary target: `src/LoginPage.vue`
- Visitor mode: Operate

## Audience, job, and action

- Audience: pessoas que precisam acessar a experiência Kairos.
- Job: informar credenciais, entender qualquer erro e concluir o envio sem distração.
- Primary action: `Entrar`.

## Content and constraints

- Login demonstrativo no front-end; não há backend de autenticação nesta etapa.
- Formulário com e-mail, senha, visibilidade da senha, validação e feedback de envio.
- Recuperação de senha e criação de conta permanecem como fluxos demonstrativos claramente sinalizados.
- Preservar identidade, componente de marca, acessibilidade e preferências de movimento do Kairos.
- Usar a referência fornecida pelo usuário como base estrutural, sem copiar a marca Databuddy.

## Chosen direction

- `Split Signal` (opção A aprovada pelo usuário): frame equilibrado em duas partes, campo de sinais monocromático à esquerda e formulário calmo à direita.
- Memorable moment: fios de dados convergem em um sinal rosado discreto enquanto o formulário permanece estável e imediatamente utilizável.

## Unresolved decisions

- Endpoint, sessão e regras reais de autenticação.
- Rotas definitivas de recuperação de senha e criação de conta.
- Provedores externos de autenticação, se houver.
