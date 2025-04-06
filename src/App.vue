<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ElContainer, ElAside, ElHeader, ElMain, ElMenu, ElMenuItem, ElIcon, ElDivider } from 'element-plus'
import { ref, onMounted } from 'vue'
import { Guide, User, Edit, House, Setting, Tickets } from '@element-plus/icons-vue'
import Sidebar from './components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'

const error = ref<string | null>(null)
const authStore = useAuthStore()

// 初始化时从 localStorage 恢复 token
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    authStore.setToken(token)
  }
})
</script>

<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <template v-if="!$route.meta.hideSidebar">
      <Sidebar />
    </template>
    <!-- 主内容区 -->
    <el-container>
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </el-container>
</template>

<style scoped>
.app-container {
  height: inherit;
  overflow: hidden;
  background: rgb(245, 245, 245);
}

.header {
  height: 10vh;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: inherit;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 0 2vw;
}

.header-right {
  display: flex;
  align-items: center;
}

.welcome {
  font-size: 20px;
  color: #666;
}

.error-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  background-color: #f56c6c;
  color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.main-content {
  padding: 2vh 2vw;
}
</style>
