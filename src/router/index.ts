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
      keepAlive: true,
      requiresAuth: true // 添加 requiresAuth
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
      keepAlive: true,
      requiresAuth: true // 添加 requiresAuth
    }
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: () => import('@/views/UserDetail.vue'),
    meta: {
      title: '用户详情',
      requiresAuth: true // 添加 requiresAuth
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
      title: '用户档案',
      requiresAuth: true // 添加 requiresAuth
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
        return authStore.isMerchant ? '我的店铺' : authStore.isAdmin ? '店铺管理' : '店铺列表'
      },
      keepAlive: true,
      requiresAuth: true // 添加 requiresAuth
    }
  },
  {
    path: '/stores/create',
    name: 'store-create',
    component: () => import('@/views/StoreCreate.vue'),
    meta: {
      title: '开设新店铺',
      keepAlive: false,
      requiresAuth: true // 添加 requiresAuth
    }
  },
  {
    path: '/stores/:id',
    name: 'store-detail',
    component: () => import('@/views/StoreDetail.vue'),
    meta: {
      title: '店铺详情',
      keepAlive: true,
      requiresAuth: true // 添加 requiresAuth
    },
    props: route => ({
      id: parseInt(route.params.id as string)
    })
  },
  {
    path: '/products/:productId', // 使用 :productId 作为参数
    name: 'ProductDetail',
    component: () => import('@/views/product/ProductDetail.vue'),
    meta: {
      title: '商品详情', // 页面标题
      requiresAuth: false, // 通常商品详情页不需要登录即可查看，除非有特殊业务需求
      // keepAlive: false, // 通常详情页不需要keep-alive
    },
    props: true // 这会将路由参数 :productId 作为 prop 传递给组件，但我们这里用 useRoute() 更灵活
  },
  {
    // 假设你的店铺详情页路径是 /stores/:storeId
    // 那么添加商品可以在其子路径下
    path: '/stores/:storeId/products/apply', // :storeId 是关键
    name: 'product-apply-for-store', // 给一个清晰的路由名称
    component: () => import('@/views/product/ProductApplicationForm.vue'),
    meta: {
      title: '申请上架商品',
      requiresAuth: true,
      // 你可能还需要一个自定义的 meta 字段来校验用户是否有权访问此 storeId
      // 例如: requiresMerchantOwner: true (然后在路由守卫中处理)
    },
    props: true // 这会将路由参数作为 props 传递给组件，但我们这里用 useRoute() 更灵活
  },
  {
    //   path: '/stores/:storeId/product-applications', // 带 storeId 的路径，查看对应店铺下的申请（这个不需要就删了？）
    path: '/product-applications',
    name: 'ProductApplicationList', // 路由名
    component: () => import('@/views/product/ProductApplicationList.vue'),
    meta: {
      title: () => {
        const authStore = useAuthStore()
        return authStore.isMerchant ? '商品申请历史' : '商品申请管理'
      },
      requiresAuth: true,
      // 可能需要权限控制，例如仅商户或Admin可访问
    },
    // props: true, // 如果组件直接通过props接收storeId
  },
  {
    path: '/products/:productId/edit', // 和我们规划的一致
    name: 'ProductEdit', // 确保这个名称与 ProductDetail.vue 中跳转时使用的名称一致
    component: () => import('@/views/product/ProductEditForm.vue'),
    meta: {
      title: '修改商品信息',
      requiresAuth: true, // 通常需要商户登录
      // 可能还需要权限校验，确保是该商品的拥有者才能编辑
    },
    props: true // 这使得 :productId 可以作为 prop 注入，但我们用 useRoute() 获取
  },
  {
    // 404 页面
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: {
      title: 'Page Not Found',
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
  } else if (to.path === '/profile' && authStore.isAdmin) {
    // 限制管理员访问 /profile
    next({ path: '/' })
  } else {
    const title = typeof to.meta.title === 'function' ? to.meta.title() : to.meta.title
    document.title = `${title} - 旅游商城`
    next()
  }
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 可以在这里添加导航完成后的逻辑
  // 例如：关闭加载动画、记录访问日志等
})

export default router
