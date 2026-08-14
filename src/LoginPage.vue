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
  <main
    class="grid min-h-dvh place-items-center overflow-x-hidden bg-[#19191d] p-[clamp(1rem,3vw,3rem)] text-[var(--white)] [--login-signal:#fec8c8] [&_:is(a,button,input):focus-visible]:outline-[2px] [&_:is(a,button,input):focus-visible]:outline-offset-[3px] [&_:is(a,button,input):focus-visible]:outline-[var(--white)] max-[840px]:p-4 max-[560px]:block max-[560px]:p-0 [@media(max-height:760px)_and_(min-width:841px)]:py-4"
  >
    <a
      class="fixed top-3 left-3 z-20 translate-y-[-160%] bg-[var(--white)] px-4 py-3 text-[0.75rem] text-[var(--black)] transition-transform duration-200 ease-[ease] [font-family:var(--font-mono)] focus:translate-y-0"
      href="#formulario-login"
    >
      Pular para o formulário
    </a>

    <section
      class="grid min-h-[min(55rem,calc(100dvh-clamp(2rem,6vw,6rem)))] w-[min(75rem,100%)] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] overflow-hidden rounded-[1rem] border border-[rgba(255,255,255,0.16)] bg-[var(--black-soft)] shadow-[0_2.4rem_7rem_rgba(0,0,0,0.42)] max-[840px]:min-h-[calc(100dvh-2rem)] max-[840px]:grid-cols-1 max-[560px]:min-h-dvh max-[560px]:rounded-none max-[560px]:border-0 max-[560px]:shadow-none [@media(max-height:760px)_and_(min-width:841px)]:min-h-[calc(100dvh-2rem)]"
      aria-labelledby="login-title"
    >
      <aside
        class="relative z-0 flex min-w-0 flex-col overflow-hidden border-r border-[var(--line)] bg-[#070707] p-[clamp(1.5rem,3vw,3rem)] [isolation:isolate] after:pointer-events-none after:absolute after:inset-0 after:z-[-1] after:bg-[linear-gradient(180deg,rgba(7,7,7,0.08)_0%,rgba(7,7,7,0.12)_48%,rgba(7,7,7,0.94)_100%)] after:content-[''] max-[840px]:min-h-[17rem] max-[840px]:border-r-0 max-[840px]:border-b max-[840px]:border-b-[var(--line)] max-[560px]:min-h-[14rem] max-[560px]:p-5"
        aria-label="Kairos — campo de sinais"
      >
        <div
          class="absolute inset-0 z-[-3] [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:4rem_4rem] [mask-image:linear-gradient(to_bottom,transparent,#000_18%,#000_82%,transparent)]"
          aria-hidden="true"
        />
        <WebThreads
          v-if="!reduceMotion"
          class="absolute! z-[-2] h-auto! w-auto! opacity-[0.78] [inset:-8%_-35%_-4%_-45%] [transform-origin:center] [transform:rotate(-7deg)_scale(1.08)] max-[840px]:[inset:-40%_-15%_-35%]"
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
        <span
          class="login-signal absolute top-[52%] left-[58%] z-[-1] size-2 rounded-full bg-[var(--login-signal)] before:absolute before:inset-[-0.7rem] before:rounded-[inherit] before:border before:border-[rgba(254,200,200,0.4)] before:content-[''] max-[840px]:top-[56%] max-[840px]:left-[62%]"
          aria-hidden="true"
        />

        <a
          class="group relative z-2 inline-flex min-h-11 self-start items-center gap-[0.65rem] text-[0.75rem] font-semibold text-[rgba(244,242,237,0.68)] transition-colors duration-250 ease-[ease] hover:text-[var(--white)]"
          href="/"
        >
          <span
            class="text-base [transition:transform_0.3s_var(--ease-out)] group-hover:[transform:translateX(-0.22rem)]"
            aria-hidden="true"
          >←</span>
          Voltar ao início
        </a>

        <div
          class="relative z-2 mt-6 flex justify-between text-[0.5rem] tracking-[0.08em] text-[rgba(244,242,237,0.42)] [font-family:var(--font-mono)] max-[560px]:hidden"
          aria-hidden="true"
        >
          <span>SIGNAL FIELD</span>
          <span>ACCESS / 01</span>
        </div>

        <div class="relative z-2 mt-auto max-w-[25rem]">
          <p class="m-0 text-[clamp(1.55rem,3vw,2.35rem)] leading-[1.15] font-medium tracking-[-0.035em] max-[560px]:text-[1.3rem]">
            Transformamos sinais complexos<br />em direção clara.
          </p>
          <em
            class="mt-[0.55rem] block text-[clamp(1.25rem,2.3vw,1.85rem)] font-normal text-[rgba(244,242,237,0.62)] [font-family:var(--font-display)] max-[840px]:text-[1.3rem] max-[560px]:mt-[0.3rem] max-[560px]:text-base"
          >
            Decisões no tempo certo.
          </em>
        </div>

        <div
          class="relative z-2 mt-12 flex justify-between border-t border-[rgba(255,255,255,0.1)] pt-4 text-[0.5rem] tracking-[0.08em] text-[rgba(244,242,237,0.42)] [font-family:var(--font-mono)] max-[840px]:hidden"
          aria-hidden="true"
        >
          <span>CAMPO ATIVO</span>
          <span>LAT —23.5505</span>
        </div>
      </aside>

      <section
        class="grid min-w-0 grid-rows-[auto_1fr_auto] bg-[#0f0f12] [padding:clamp(1.5rem,3vw,3rem)_clamp(1.5rem,5vw,5rem)_clamp(1.25rem,2vw,2rem)] max-[840px]:min-h-[42rem] max-[560px]:min-h-[calc(100dvh-14rem)] max-[560px]:[padding:1.5rem_1.25rem_1.25rem]"
      >
        <a
          class="justify-self-center text-[var(--white)] max-[560px]:justify-self-start"
          href="/"
          aria-label="Kairos — página inicial"
        >
          <KairosMark />
        </a>

        <div
          class="mx-auto grid w-full min-w-0 max-w-[27rem] content-center py-[clamp(3rem,7vh,6rem)] max-[840px]:py-[4.5rem] max-[560px]:py-16 [@media(max-height:760px)_and_(min-width:841px)]:py-8"
        >
          <div class="mb-10 max-[560px]:mb-[2.15rem] [@media(max-height:760px)_and_(min-width:841px)]:mb-7">
            <span
              class="inline-flex items-center gap-[0.55rem] text-[0.56rem] tracking-[0.1em] text-[var(--muted)] [font-family:var(--font-mono)]"
            >
              <i class="size-[0.38rem] rounded-full bg-current" />
              ACESSO KAIROS
            </span>
            <h1
              id="login-title"
              class="mt-[1.15rem] mb-0 text-[clamp(2.3rem,4vw,3.6rem)] leading-none font-medium tracking-[-0.04em] [@media(max-height:760px)_and_(min-width:841px)]:text-[2.3rem]"
            >
              Bem-vindo de
              <em class="font-normal text-[rgba(244,242,237,0.72)] [font-family:var(--font-display)]">volta.</em>
            </h1>
            <p
              class="mt-4 mb-0 max-w-[38ch] text-[0.85rem] leading-[1.65] text-[#b0afaa] [@media(max-height:760px)_and_(min-width:841px)]:mt-3"
            >
              Acesse o Kairos para continuar sua jornada entre sinais, cenários e decisões.
            </p>
          </div>

          <form
            id="formulario-login"
            class="grid min-w-0 gap-[1.35rem] [@media(max-height:760px)_and_(min-width:841px)]:gap-4"
            novalidate
            @submit.prevent="submitLogin"
          >
            <div class="grid min-w-0 gap-[0.55rem]">
              <label class="text-[0.75rem] font-semibold text-[rgba(244,242,237,0.88)]" for="login-email">E-mail</label>
              <input
                id="login-email"
                ref="emailInput"
                class="h-[3.4rem] w-full rounded-sm border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.055)] px-4 py-0 text-[0.85rem] text-[var(--white)] outline-[1px] outline-offset-2 outline-transparent transition-[border-color,background,outline-color] duration-200 ease-[ease] placeholder:text-[var(--muted)] placeholder:opacity-100 hover:border-[rgba(255,255,255,0.24)] focus:border-[rgba(244,242,237,0.68)] focus:bg-[rgba(255,255,255,0.075)] focus:outline-[rgba(244,242,237,0.26)] aria-[invalid=true]:border-[var(--login-signal)] aria-[invalid=true]:outline-[rgba(254,200,200,0.24)] aria-[invalid=true]:focus:border-[var(--login-signal)] aria-[invalid=true]:focus:outline-[rgba(254,200,200,0.24)] max-[560px]:text-base"
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
              <span
                v-if="errors.email"
                id="login-email-error"
                class="text-[0.68rem] leading-[1.4] text-[var(--login-signal)]"
              >
                {{ errors.email }}
              </span>
            </div>

            <div class="grid min-w-0 gap-[0.55rem]">
              <div class="flex items-center justify-between gap-4 max-[560px]:flex-wrap max-[560px]:items-start">
                <label class="text-[0.75rem] font-semibold text-[rgba(244,242,237,0.88)]" for="login-password">Senha</label>
                <button
                  class="inline-flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-[0.68rem] text-[var(--muted)] underline decoration-transparent underline-offset-[0.25rem] transition-[color,text-decoration-color] duration-200 ease-[ease] hover:text-[var(--white)] hover:decoration-current"
                  type="button"
                  @click="announcePendingFlow('A recuperação de senha')"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div class="relative">
                <input
                  id="login-password"
                  ref="passwordInput"
                  class="h-[3.4rem] w-full rounded-sm border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.055)] py-0 pr-[3.4rem] pl-4 text-[0.85rem] text-[var(--white)] outline-[1px] outline-offset-2 outline-transparent transition-[border-color,background,outline-color] duration-200 ease-[ease] placeholder:text-[var(--muted)] placeholder:opacity-100 hover:border-[rgba(255,255,255,0.24)] focus:border-[rgba(244,242,237,0.68)] focus:bg-[rgba(255,255,255,0.075)] focus:outline-[rgba(244,242,237,0.26)] aria-[invalid=true]:border-[var(--login-signal)] aria-[invalid=true]:outline-[rgba(254,200,200,0.24)] aria-[invalid=true]:focus:border-[var(--login-signal)] aria-[invalid=true]:focus:outline-[rgba(254,200,200,0.24)] max-[560px]:text-base"
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
                  class="absolute top-1/2 right-[0.55rem] grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-[var(--muted)] transition-[color,background] duration-200 ease-[ease] hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--white)]"
                  type="button"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  :aria-pressed="showPassword"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="!showPassword"
                    class="w-[1.1rem] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M2.8 12s3.4-5 9.2-5 9.2 5 9.2 5-3.4 5-9.2 5-9.2-5-9.2-5Z" />
                    <circle cx="12" cy="12" r="2.4" />
                  </svg>
                  <svg
                    v-else
                    class="w-[1.1rem] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:1.5]"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="m4 4 16 16M9.8 7.3A9.8 9.8 0 0 1 12 7c5.8 0 9.2 5 9.2 5a14 14 0 0 1-2.3 2.7M14.3 16.7A9 9 0 0 1 12 17c-5.8 0-9.2-5-9.2-5a14 14 0 0 1 2.4-2.8" />
                  </svg>
                </button>
              </div>
              <span
                v-if="errors.password"
                id="login-password-error"
                class="text-[0.68rem] leading-[1.4] text-[var(--login-signal)]"
              >
                {{ errors.password }}
              </span>
            </div>

            <button
              class="mt-[0.35rem] inline-flex min-h-[3.55rem] w-full cursor-pointer items-center justify-between rounded-sm border border-[var(--white)] bg-[var(--white)] px-[1.15rem] py-0 text-[0.75rem] font-bold text-[var(--black)] transition-[background,color,border-color] duration-250 ease-[ease] enabled:hover:bg-[var(--black)] enabled:hover:text-[var(--white)] disabled:cursor-wait disabled:border-[#8c8b87] disabled:bg-[#8c8b87] disabled:text-[#2b2b2b]"
              type="submit"
              :disabled="submitState === 'submitting'"
            >
              <span>{{ submitLabel }}</span>
              <span
                v-if="submitState === 'submitting'"
                class="login-spinner size-[0.95rem] rounded-full border border-current border-r-transparent"
                aria-hidden="true"
              />
              <span v-else aria-hidden="true">↗</span>
            </button>

            <p
              class="mt-[0.15rem] mb-0 flex flex-wrap items-center justify-center gap-1 text-center text-[0.68rem] text-[#8f8e89]"
            >
              Ainda não tem acesso?
              <button
                class="inline-flex min-h-11 cursor-pointer items-center border-0 bg-transparent p-0 text-[0.68rem] text-[var(--white)] underline decoration-transparent underline-offset-[0.25rem] transition-[color,text-decoration-color] duration-200 ease-[ease] hover:text-[var(--white)] hover:decoration-current"
                type="button"
                @click="announcePendingFlow('A criação de conta')"
              >
                Criar conta
              </button>
            </p>

            <p
              class="m-0 items-start gap-[0.6rem] border-t border-[var(--line)] pt-[0.8rem] text-[0.68rem] leading-normal text-[var(--muted)]"
              :class="statusMessage ? 'flex' : 'hidden'"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <i
                v-if="statusMessage"
                class="mt-[0.33rem] size-[0.38rem] flex-none rounded-full bg-current text-[var(--login-signal)]"
                aria-hidden="true"
              />
              {{ statusMessage }}
            </p>
          </form>
        </div>

        <footer
          class="flex items-center justify-between gap-4 border-t border-[rgba(255,255,255,0.08)] pt-4 text-[0.5rem] tracking-[0.08em] text-[#8f8e89] [font-family:var(--font-mono)] max-[560px]:justify-start max-[560px]:leading-normal"
        >
          <span>DEMONSTRAÇÃO — AUTENTICAÇÃO NÃO CONECTADA</span>
          <span class="flex items-center gap-[0.45rem] max-[560px]:hidden">
            <i class="size-[0.38rem] rounded-full bg-current text-[var(--white)]" aria-hidden="true" />
            INTERFACE PRONTA
          </span>
        </footer>
      </section>
    </section>
  </main>
</template>

<style scoped>
.login-signal {
  animation: login-signal-pulse 2.4s var(--ease-smooth) infinite;
}

@keyframes login-signal-pulse {
  0%, 100% { opacity: 0.65; transform: scale(0.86); }
  50% { opacity: 1; transform: scale(1.25); }
}

.login-spinner {
  animation: login-spin 0.7s linear infinite;
}

@keyframes login-spin { to { transform: rotate(360deg); } }

@media (prefers-reduced-motion: reduce) {
  .login-signal,
  .login-spinner {
    animation: none;
  }

  .login-signal { opacity: 0.9; transform: none; }
}
</style>
