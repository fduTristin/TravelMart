import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

// 定义路由元数据类型
declare module 'vue-router' {
  interface RouteMeta {
    title: string | (() => string)
    requiresAuth?: boolean
    keepAlive?: boolean
    hideSidebar?: boolean
    needRefresh?: boolean
  }
}

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/UserLogin.vue'),
    meta: {
      title: '登录',
      hideSidebar: true
    }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: '首页',
      keepAlive: true
    }
  },
  {
    path: '/register',
    name: 'user-create',
    component: () => import('@/views/UserCreate.vue'),
    meta: {
      title: '注册',
      hideSidebar: true
    }
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UserList.vue'),
    meta: {
      title: '用户管理',
      keepAlive: true
    }
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: () => import('@/views/UserDetail.vue'),
    meta: {
      title: 'User Detail'
    },
    props: route => ({
      id: parseInt(route.params.id as string),
    }),
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/UserProfile.vue'),
    meta: {
      title: '用户档案'
    },
    props: true
  },
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoreList.vue'),
    meta: {
      title: () => {
        const authStore = useAuthStore()
        return authStore.isMerchant ? '我的店铺' : authStore.isAdmin?'店铺管理':'店铺列表'
      },
      keepAlive: true
    }
  },
  {
    path: '/stores/create',
    name: 'store-create',
    component: () => import('@/views/StoreCreate.vue'),
    meta: {
      title: '开设新店铺',
      keepAlive: false
    }
  },
  {
    path: '/stores/:id',
    name: 'store-detail',
    component: () => import('@/views/StoreDetail.vue'),
    meta: {
      title: 'Store Detail',
      keepAlive: true
    },
    props: route => ({
      id: parseInt(route.params.id as string)
    })
  },
  {
    // 404 页面
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Page Not Found'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// 路由导航守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const authStore = useAuthStore()

  // 如果需要登录且没有token
  if (to.meta.requiresAuth && !token) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/users' && !authStore.isAdmin) {
    // 限制非管理员访问 /users
    next({ path: '/' })
  } else {
    const title = typeof to.meta.title === 'function' ? to.meta.title() : to.meta.title
    document.title = `${title} - 旅游商城`
    next()
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 如果是导航到个人资料页面，添加一个标记表明需要刷新数据
  if (to.name === 'profile' || to.name === 'stores') {
    to.meta.needRefresh = true
  }

  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加导航完成后的逻辑
  // 例如：关闭加载动画、记录访问日志等
})

export default router
