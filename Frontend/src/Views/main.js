import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '/App.vue'
import router from './router'
import './style.css'

const app = create(App)

app.use(createPinia())
app.use(router)

app.mount('#app')