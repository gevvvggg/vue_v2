import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Vue from 'vue'
import Router from 'vue-router'
const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
        path: '/home', component: Home
    }
]
const router = new Router({
    routes
})
Vue.use(Router)
router.beforeEach((to, from, next) => {
    if (to.path === '/login') return next()
    const tokenStr = window.sessionStorage.getItem('token')
    if (!tokenStr) return next('/login')
    next()
})
export default router