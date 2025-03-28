import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

// 定义路由元数据类型
declare module 'vue-router' {
  interface RouteMeta {
    title: string
    requiresAuth?: boolean
    keepAlive?: boolean
    hideSidebar?: boolean
  }
}

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/UserLogin.vue'),
    meta: {
      title: '用户登录',
      hideSidebar: true
    }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Travel',
      keepAlive: true,
      requiresAuth: true
    }
  },
  {
    path: '/items',
    name: 'items',
    component: () => import('@/views/ItemList.vue'),
    meta: {
      title: 'Task Management',
      keepAlive: true
    }
  },
  {
    path: '/register',
    name: 'user-create',
    component: () => import('@/views/UserCreate.vue'),
    meta: {
      title: 'Register',
      hideSidebar: true
    }
  },
  {
    path: '/items/:id',
    name: 'item-detail',
    component: () => import('@/views/ItemDetail.vue'),
    meta: {
      title: 'Task Details'
    },
    // 添加 props 支持，使组件可以直接接收路由参数
    props: route => ({
      id: parseInt(route.params.id as string)
    })
  },
  {
    path: '/items/:id/edit',
    name: 'item-edit',
    component: () => import('@/views/ItemEdit.vue'),
    meta: {
      title: 'Edit Task'
    },
    props: route => ({
      id: parseInt(route.params.id as string)
    })
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('@/views/UserList.vue'),
    meta: {
      title: 'User Management',
      keepAlive: true
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/UserProfile.vue'),
    meta: {
      title: 'User Profile'
    },
    props: true
  },
  {
    path: '/stores',
    name: 'stores',
    component: () => import('@/views/StoreList.vue'),
    meta: {
      title: 'Store Management',
      keepAlive: true
    }
  },
  {
    path: '/store/:id',
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
  // 获取token
  const token = localStorage.getItem('token')

  // 如果需要登录且没有token
  if (to.meta.requiresAuth && !token) {
    // 保存原本要去的页面
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    // 设置页面标题
    document.title = `${to.meta.title} - Travel`
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加导航完成后的逻辑
  // 例如：关闭加载动画、记录访问日志等
})

export default router
