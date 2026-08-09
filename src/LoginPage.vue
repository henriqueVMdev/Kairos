<!--
THESIS: O acesso ao Kairos acontece no limiar entre sinal e decisão; recusa o cartão de login genérico isolado.
OWN-WORLD: Preto profundo, branco aquecido, linhas técnicas finas, dados monocromáticos e um único sinal rosado.
STORY: A pessoa reconhece o Kairos, informa as credenciais e entende que a autenticação ainda é demonstrativa.
FIRST VIEWPORT: Um frame 46/54 ocupa a tela; campo de sinais e mensagem à esquerda, marca e formulário centrado à direita.
FORM: Split Signal, 1º de três estudos; composição A aprovada pelo usuário; staging e seed: reference-pinned.
-->
<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import KairosMark from './components/KairosMark.vue'
import WebThreads from './components/WebThreads.vue'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const submitState = ref('idle')
const statusMessage = ref('')
const reduceMotion = ref(true)
const emailInput = ref(null)
const passwordInput = ref(null)
const errors = reactive({ email: '', password: '' })

let submitTimer
let motionQuery
let previousTitle = ''

const submitLabel = computed(() => submitState.value === 'submitting' ? 'Validando…' : 'Entrar')

function validateEmail() {
  const value = email.value.trim()
  if (!value) errors.email = 'Informe seu e-mail.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Digite um e-mail válido.'
  else errors.email = ''
  return !errors.email
}

function validatePassword() {
  errors.password = password.value ? '' : 'Informe sua senha.'
  return !errors.password
}

function onEmailInput() {
  if (errors.email) validateEmail()
}

function onPasswordInput() {
  if (errors.password) validatePassword()
}

function submitLogin() {
  statusMessage.value = ''
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  if (!isEmailValid || !isPasswordValid) {
    statusMessage.value = 'Revise os campos indicados para continuar.'
    nextTick(() => {
      if (!isEmailValid) emailInput.value?.focus()
      else passwordInput.value?.focus()
    })
    return
  }

  submitState.value = 'submitting'
  window.clearTimeout(submitTimer)
  submitTimer = window.setTimeout(() => {
    submitState.value = 'idle'
    statusMessage.value = 'Formulário validado. A autenticação será concluída quando o backend estiver conectado.'
  }, reduceMotion.value ? 0 : 700)
}

function announcePendingFlow(flow) {
  statusMessage.value = `${flow} estará disponível quando o backend de autenticação estiver conectado.`
}

function syncMotionPreference(event) {
  reduceMotion.value = event.matches
}

onMounted(() => {
  previousTitle = document.title
  document.title = 'Entrar — Kairos'
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduceMotion.value = motionQuery.matches
  motionQuery.addEventListener('change', syncMotionPreference)
})

onBeforeUnmount(() => {
  window.clearTimeout(submitTimer)
  motionQuery?.removeEventListener('change', syncMotionPreference)
  document.title = previousTitle
})
</script>

<template>
  <main class="login-page">
    <a class="login-skip" href="#formulario-login">Pular para o formulário</a>

    <section class="login-shell" aria-labelledby="login-title">
      <aside class="login-visual" aria-label="Kairos — campo de sinais">
        <div class="login-visual__grid" aria-hidden="true" />
        <WebThreads
          v-if="!reduceMotion"
          class="login-threads"
          color1="#3a3a3a"
          color2="#f4f2ed"
          color3="#fec8c8"
          :speed="0.11"
          :thread-count="7"
          :frequency="4.2"
          :spread="0.14"
          :taper="1.15"
          :position="0.53"
          fan-mode="left"
          :glow="0.015"
          :falloff="0.62"
          :thickness="1.2"
          :brightness="0.62"
          :opacity="0.9"
          :mirror="true"
          :shimmer="false"
          :grain="true"
          :grain-intensity="0.025"
          :mouse-interaction="true"
          :mouse-strength="0.12"
          aria-hidden="true"
        />
        <span class="login-signal" aria-hidden="true" />

        <a class="login-back" href="/">
          <span aria-hidden="true">←</span>
          Voltar ao início
        </a>

        <div class="login-visual__meta" aria-hidden="true">
          <span>SIGNAL FIELD</span>
          <span>ACCESS / 01</span>
        </div>

        <div class="login-visual__copy">
          <p>Transformamos sinais complexos<br />em direção clara.</p>
          <em>Decisões no tempo certo.</em>
        </div>

        <div class="login-visual__status" aria-hidden="true">
          <span>CAMPO ATIVO</span>
          <span>LAT —23.5505</span>
        </div>
      </aside>

      <section class="login-panel">
        <a class="login-panel__brand" href="/" aria-label="Kairos — página inicial">
          <KairosMark />
        </a>

        <div class="login-content">
          <div class="login-heading">
            <span class="login-kicker"><i /> ACESSO KAIROS</span>
            <h1 id="login-title">Bem-vindo de <em>volta.</em></h1>
            <p>Acesse o Kairos para continuar sua jornada entre sinais, cenários e decisões.</p>
          </div>

          <form id="formulario-login" class="login-form" novalidate @submit.prevent="submitLogin">
            <div class="login-field" :class="{ 'login-field--error': errors.email }">
              <label for="login-email">E-mail</label>
              <input
                id="login-email"
                ref="emailInput"
                v-model="email"
                type="email"
                name="email"
                autocomplete="email"
                inputmode="email"
                placeholder="voce@empresa.com"
                :aria-invalid="Boolean(errors.email)"
                :aria-describedby="errors.email ? 'login-email-error' : undefined"
                @blur="validateEmail"
                @input="onEmailInput"
              />
              <span v-if="errors.email" id="login-email-error" class="login-error">{{ errors.email }}</span>
            </div>

            <div class="login-field" :class="{ 'login-field--error': errors.password }">
              <div class="login-field__label-row">
                <label for="login-password">Senha</label>
                <button type="button" @click="announcePendingFlow('A recuperação de senha')">Esqueci minha senha</button>
              </div>
              <div class="login-password">
                <input
                  id="login-password"
                  ref="passwordInput"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  name="password"
                  autocomplete="current-password"
                  placeholder="Digite sua senha"
                  :aria-invalid="Boolean(errors.password)"
                  :aria-describedby="errors.password ? 'login-password-error' : undefined"
                  @blur="validatePassword"
                  @input="onPasswordInput"
                />
                <button
                  class="login-password__toggle"
                  type="button"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  :aria-pressed="showPassword"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.8 12s3.4-5 9.2-5 9.2 5 9.2 5-3.4 5-9.2 5-9.2-5-9.2-5Z" />
                    <circle cx="12" cy="12" r="2.4" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m4 4 16 16M9.8 7.3A9.8 9.8 0 0 1 12 7c5.8 0 9.2 5 9.2 5a14 14 0 0 1-2.3 2.7M14.3 16.7A9 9 0 0 1 12 17c-5.8 0-9.2-5-9.2-5a14 14 0 0 1 2.4-2.8" />
                  </svg>
                </button>
              </div>
              <span v-if="errors.password" id="login-password-error" class="login-error">{{ errors.password }}</span>
            </div>

            <button class="login-submit" type="submit" :disabled="submitState === 'submitting'">
              <span>{{ submitLabel }}</span>
              <span v-if="submitState === 'submitting'" class="login-spinner" aria-hidden="true" />
              <span v-else aria-hidden="true">↗</span>
            </button>

            <p class="login-account">
              Ainda não tem acesso?
              <button type="button" @click="announcePendingFlow('A criação de conta')">Criar conta</button>
            </p>

            <p class="login-status" :class="{ 'login-status--visible': statusMessage }" role="status" aria-live="polite" aria-atomic="true">
              <i v-if="statusMessage" aria-hidden="true" />
              {{ statusMessage }}
            </p>
          </form>
        </div>

        <footer class="login-panel__footer">
          <span>DEMONSTRAÇÃO — AUTENTICAÇÃO NÃO CONECTADA</span>
          <span><i aria-hidden="true" /> INTERFACE PRONTA</span>
        </footer>
      </section>
    </section>
  </main>
</template>

<style scoped>
.login-page {
  --login-signal: #fec8c8;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: clamp(1rem, 3vw, 3rem);
  overflow-x: hidden;
  background: #19191d;
  color: var(--white);
}

.login-skip {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 20;
  padding: 0.75rem 1rem;
  background: var(--white);
  color: var(--black);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  transform: translateY(-160%);
  transition: transform 0.2s ease;
}

.login-skip:focus { transform: translateY(0); }

.login-shell {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  width: min(75rem, 100%);
  min-height: min(55rem, calc(100dvh - clamp(2rem, 6vw, 6rem)));
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 1rem;
  background: var(--black-soft);
  box-shadow: 0 2.4rem 7rem rgba(0, 0, 0, 0.42);
}

.login-visual {
  position: relative;
  z-index: 0;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: clamp(1.5rem, 3vw, 3rem);
  overflow: hidden;
  border-right: 1px solid var(--line);
  background: #070707;
  isolation: isolate;
}

.login-visual::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(180deg, rgba(7, 7, 7, 0.08) 0%, rgba(7, 7, 7, 0.12) 48%, rgba(7, 7, 7, 0.94) 100%);
  pointer-events: none;
}

.login-visual__grid {
  position: absolute;
  inset: 0;
  z-index: -3;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
  background-size: 4rem 4rem;
  mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
}

.login-threads {
  position: absolute;
  inset: -8% -35% -4% -45%;
  z-index: -2;
  width: auto;
  height: auto;
  opacity: 0.78;
  transform: rotate(-7deg) scale(1.08);
  transform-origin: center;
}

.login-signal {
  position: absolute;
  top: 52%;
  left: 58%;
  z-index: -1;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--login-signal);
  animation: login-signal-pulse 2.4s var(--ease-smooth) infinite;
}

.login-signal::before {
  content: '';
  position: absolute;
  inset: -0.7rem;
  border: 1px solid rgba(254, 200, 200, 0.4);
  border-radius: inherit;
}

@keyframes login-signal-pulse {
  0%, 100% { opacity: 0.65; transform: scale(0.86); }
  50% { opacity: 1; transform: scale(1.25); }
}

.login-back {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.65rem;
  min-height: 2.75rem;
  color: rgba(244, 242, 237, 0.68);
  font-size: 0.75rem;
  font-weight: 600;
  transition: color 0.25s ease;
}

.login-back span {
  font-size: 1rem;
  transition: transform 0.3s var(--ease-out);
}

.login-back:hover { color: var(--white); }
.login-back:hover span { transform: translateX(-0.22rem); }

.login-visual__meta,
.login-visual__status {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  color: rgba(244, 242, 237, 0.42);
  font-family: var(--font-mono);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
}

.login-visual__meta { margin-top: 1.5rem; }

.login-visual__copy {
  position: relative;
  z-index: 2;
  margin-top: auto;
  max-width: 25rem;
}

.login-visual__copy p {
  margin: 0;
  font-size: clamp(1.55rem, 3vw, 2.35rem);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1.15;
}

.login-visual__copy em {
  display: block;
  margin-top: 0.55rem;
  color: rgba(244, 242, 237, 0.62);
  font-family: var(--font-display);
  font-size: clamp(1.25rem, 2.3vw, 1.85rem);
  font-weight: 400;
}

.login-visual__status {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.login-panel {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-width: 0;
  padding: clamp(1.5rem, 3vw, 3rem) clamp(1.5rem, 5vw, 5rem) clamp(1.25rem, 2vw, 2rem);
  background: #0f0f12;
}

.login-panel__brand {
  justify-self: center;
  color: var(--white);
}

.login-content {
  display: grid;
  align-content: center;
  width: 100%;
  max-width: 27rem;
  min-width: 0;
  margin-inline: auto;
  padding-block: clamp(3rem, 7vh, 6rem);
}

.login-heading { margin-bottom: 2.5rem; }

.login-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--muted);
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
}

.login-kicker i,
.login-panel__footer i,
.login-status i {
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 50%;
  background: currentColor;
}

.login-heading h1 {
  margin: 1.15rem 0 0;
  font-size: clamp(2.3rem, 4vw, 3.6rem);
  font-weight: 500;
  letter-spacing: -0.04em;
  line-height: 1;
}

.login-heading h1 em {
  color: rgba(244, 242, 237, 0.72);
  font-family: var(--font-display);
  font-weight: 400;
}

.login-heading > p {
  max-width: 38ch;
  margin: 1rem 0 0;
  color: #b0afaa;
  font-size: 0.85rem;
  line-height: 1.65;
}

.login-form {
  display: grid;
  min-width: 0;
  gap: 1.35rem;
}

.login-field {
  display: grid;
  min-width: 0;
  gap: 0.55rem;
}

.login-field label {
  color: rgba(244, 242, 237, 0.88);
  font-size: 0.75rem;
  font-weight: 600;
}

.login-field__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.login-field__label-row button,
.login-account button {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 0.68rem;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 0.25rem;
  transition: color 0.2s ease, text-decoration-color 0.2s ease;
}

.login-field__label-row button:hover,
.login-account button:hover {
  color: var(--white);
  text-decoration-color: currentColor;
}

.login-field input {
  width: 100%;
  height: 3.4rem;
  padding: 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.25rem;
  outline: 1px solid transparent;
  outline-offset: 2px;
  background: rgba(255, 255, 255, 0.055);
  color: var(--white);
  font-size: 0.85rem;
  transition: border-color 0.2s ease, background 0.2s ease, outline-color 0.2s ease;
}

.login-field input::placeholder { color: var(--muted); opacity: 1; }

.login-field input:hover { border-color: rgba(255, 255, 255, 0.24); }

.login-field input:focus {
  border-color: rgba(244, 242, 237, 0.68);
  outline-color: rgba(244, 242, 237, 0.26);
  background: rgba(255, 255, 255, 0.075);
}

.login-field--error input,
.login-field--error input:focus {
  border-color: var(--login-signal);
  outline-color: rgba(254, 200, 200, 0.24);
}

.login-error {
  color: var(--login-signal);
  font-size: 0.68rem;
  line-height: 1.4;
}

.login-password { position: relative; }

.login-password input { padding-right: 3.4rem; }

.login-password__toggle {
  position: absolute;
  top: 50%;
  right: 0.55rem;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transform: translateY(-50%);
  transition: color 0.2s ease, background 0.2s ease;
}

.login-password__toggle:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--white);
}

.login-password__toggle svg {
  width: 1.1rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.login-submit {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 3.55rem;
  margin-top: 0.35rem;
  padding: 0 1.15rem;
  border: 1px solid var(--white);
  border-radius: 0.25rem;
  background: var(--white);
  color: var(--black);
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
}

.login-submit:hover:not(:disabled) {
  background: var(--black);
  color: var(--white);
}

.login-submit:disabled {
  border-color: #8c8b87;
  background: #8c8b87;
  color: #2b2b2b;
  cursor: wait;
}

.login-spinner {
  width: 0.95rem;
  height: 0.95rem;
  border: 1px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

@keyframes login-spin { to { transform: rotate(360deg); } }

.login-account {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0.15rem 0 0;
  color: #8f8e89;
  font-size: 0.68rem;
  text-align: center;
}

.login-account button { color: var(--white); }

.login-status {
  display: none;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  padding: 0.8rem 0 0;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.68rem;
  line-height: 1.5;
}

.login-status--visible { display: flex; }

.login-status i {
  flex: 0 0 auto;
  margin-top: 0.33rem;
  color: var(--login-signal);
}

.login-panel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  color: #8f8e89;
  font-family: var(--font-mono);
  font-size: 0.5rem;
  letter-spacing: 0.08em;
}

.login-panel__footer span:last-child {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.login-panel__footer i { color: var(--white); }

.login-page :is(a, button, input):focus-visible {
  outline: 2px solid var(--white);
  outline-offset: 3px;
}

@media (max-width: 840px) {
  .login-page { padding: 1rem; }

  .login-shell {
    grid-template-columns: 1fr;
    min-height: calc(100dvh - 2rem);
  }

  .login-visual {
    min-height: 17rem;
    border-right: 0;
    border-bottom: 1px solid var(--line);
  }

  .login-threads { inset: -40% -15% -35%; }
  .login-signal { top: 56%; left: 62%; }
  .login-visual__copy p { font-size: clamp(1.55rem, 3vw, 2.35rem); }
  .login-visual__copy em { font-size: 1.3rem; }
  .login-visual__status { display: none; }

  .login-panel { min-height: 42rem; }
  .login-content { padding-block: 4.5rem; }
}

@media (max-width: 560px) {
  .login-page { display: block; padding: 0; }

  .login-shell {
    min-height: 100dvh;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .login-visual {
    min-height: 14rem;
    padding: 1.25rem;
  }

  .login-visual__meta { display: none; }
  .login-visual__copy p { font-size: 1.3rem; }
  .login-visual__copy em { margin-top: 0.3rem; font-size: 1rem; }

  .login-panel {
    min-height: calc(100dvh - 14rem);
    padding: 1.5rem 1.25rem 1.25rem;
  }

  .login-panel__brand { justify-self: start; }
  .login-content { padding-block: 4rem; }
  .login-heading { margin-bottom: 2.15rem; }
  .login-heading h1 { font-size: clamp(2.3rem, 4vw, 3.6rem); }
  .login-heading > p { font-size: 0.85rem; }
  .login-field input { font-size: 1rem; }
  .login-field__label-row { align-items: flex-start; flex-wrap: wrap; }
  .login-panel__footer span:last-child { display: none; }
  .login-panel__footer { justify-content: flex-start; line-height: 1.5; }
}

@media (max-height: 760px) and (min-width: 841px) {
  .login-shell { min-height: calc(100dvh - 2rem); }
  .login-page { padding-block: 1rem; }
  .login-content { padding-block: 2rem; }
  .login-heading { margin-bottom: 1.75rem; }
  .login-heading h1 { font-size: 2.3rem; }
  .login-heading > p { margin-top: 0.75rem; }
  .login-form { gap: 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  .login-signal,
  .login-spinner {
    animation: none;
  }

  .login-signal { opacity: 0.9; transform: none; }
}
</style>
