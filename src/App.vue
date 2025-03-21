<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem } from 'element-plus'
import { ref } from 'vue'
import { Guide } from '@element-plus/icons-vue'; // 导入图标

const error = ref<string | null>(null)
</script>

<template>
  <el-container class="app-container">
    <el-header>
      <div class="header-content">
        <router-link to="/" class="logo">
        <!-- 使用 Element Plus 图标 -->
        <el-icon :size="60" color="#000">
          <Guide />
        </el-icon>
        <span class="logo-text">旅游商城</span>
        </router-link>
        <el-menu
          mode="horizontal"
          router
          :ellipsis="false"
          class="nav-menu"
          :default-active="$route.path"
        >
          <el-menu-item index="/users">用户管理</el-menu-item>
          <el-menu-item index="/users/create">注册</el-menu-item>
          <!-- <el-menu-item index="/lab1/users">Users</el-menu-item> -->
        </el-menu>
      </div>
    </el-header>

    <el-main>
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </el-main>

    <!-- 错误提示 -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </el-container>
</template>

<style scoped>
.app-container {
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header-content {
  max-width: 100%;
  margin: 0 auto;
  height: 100%;
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  padding: 0 40px;
  background-color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  color: #0f5526;
  text-decoration: none;
  white-space: nowrap;
  letter-spacing: 1px;
}

.logo-image {
  height: 52px;
  margin-right: 40px;
}

.logo-text {
  font-size: 40px;
  font-weight: 900;
  color: #000;
  margin-left: 10px;
  letter-spacing: 3px;
  white-space: nowrap;
  font-family: 'Microsoft YaHei', sans-serif;
}

.nav-menu {
  border-bottom: none;
  background-color: transparent;
  border-radius: 0;
  margin-left: 40px;
  white-space: nowrap;
}

.el-menu-item {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 20px; /* 设置字体大小 */
  font-weight: bold; /* 设置字体粗细 */
  color: #000; /* 设置字体颜色 */
  padding: 0 20px; /* 设置内边距 */
  line-height: 80px; /* 设置行高 */
  border-bottom: 0px solid transparent; /* 设置底部边框 */
  transition: border-bottom-color 1.3s; /* 设置过渡效果 */ 
}

.el-header {
  background-color: #fff;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  padding: 0;
  height: 80px;
  line-height: 80px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1); /* 设置阴影 */
}

.main-content {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px 40px;
  height: 80vh;
  width: 100vw;
  position: relative;
}

.error-message {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--el-color-danger);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}
</style>

<style>
/* 全局样式 */
body {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 16px;
  line-height: 1.6;
}

#app {
  height: 100vh;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    padding: 10px;
  }

  .logo {
    margin-bottom: 10px;
  }

  .nav-menu {
    width: 100%;
  }

  .el-main {
    padding: 100px 10px 20px;
  }
}
</style>
