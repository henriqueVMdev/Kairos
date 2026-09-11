import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  // STATE = dados que ficam guardados enquanto a aplicação está em uso.
  state: () => ({
    logado: localStorage.getItem('cti_logado') === 'true',
    usuario: localStorage.getItem('cti_usuario') || ''
  }),

  // GETTERS = valores calculados a partir do state.
  getters: {
    nomeExibicao: (state) => state.usuario || 'Usuário'
  },

  // ACTIONS = ações que alteram o state.
  actions: {
    login(usuario, senha) {
      // Aula de front-end: qualquer usuário e senha preenchidos são aceitos.
      if (!usuario || !senha) {
        return false
      }

      this.logado = true
      this.usuario = usuario

      localStorage.setItem('cti_logado', 'true')
      localStorage.setItem('cti_usuario', usuario)

      return true
    },

    logout() {
      this.logado = false
      this.usuario = ''

      localStorage.removeItem('cti_logado')
      localStorage.removeItem('cti_usuario')
    }
  }
})
