import {
    createRouter,
    createWebHashHistory
    // createWebHistory
} from 'vue-router'
const Home = () => import('../components/Home.vue')
const Login = () => import('../components/Login.vue')
const Register = () => import('../components/Register.vue')
const Content = () => import('../components/content.vue')

const routes = [{
        path: '/',
        redirect: '/content'
    },
    {
        path: '/content',
        component: Content,
        meta: {
            auth: true
        }
    },
    {
        path: '/home',
        component: Home,
        children: [{
                path: '/home',
                redirect: 'home/login'
            },
            {
                path: 'login',
                component: Login
            },
            {
                path: 'register',
                component: Register
            }
        ]
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes: routes
})

router.beforeEach((to, from, next) => {
    if (to.meta.auth) {
        let token = localStorage.getItem("token");
        if (token) {
            next();
        } else {
            next({
                path: '/home/login',    
            })
        }
    } else {
        next();
    }
})

export default router;