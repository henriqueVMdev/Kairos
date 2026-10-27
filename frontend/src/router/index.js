import { createRouter, createWebHistory } from 'vue-router';

import Home from '../Views/Home.vue'
import LoginPage from '../Views/LoginPage.vue'
import Upload from '../Views/Upload.vue'

const routes = [ 
    {path: '/', name: 'home', component: Home},
    {path: '/login', name: 'login', component: LoginPage},
    {path: '/upload', name: 'upload', component: Upload},
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const logado = localStorage.getItem('cti_logado') === 'true'

    if (to.meta.requerLogin && !logado){
        return '/login'
    }
})

export default router