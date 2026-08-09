import { createApp } from 'vue'
import './styles/main.css'

const pathname = window.location.pathname.replace(/\/+$/, '') || '/'
const loadRootComponent = pathname === '/login'
  ? () => import('./LoginPage.vue')
  : () => import('./App.vue')

async function mountRoot() {
  const { default: RootComponent } = await loadRootComponent()
  createApp(RootComponent).mount('#app')
}

mountRoot()
