<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { ElContainer, ElAside, ElHeader, ElMain, ElMenu, ElMenuItem, ElIcon, ElDivider } from 'element-plus'
import { ref } from 'vue'
import { Guide, User, Edit, House, Setting, Tickets } from '@element-plus/icons-vue'

const error = ref<string | null>(null)
</script>

<template>
  <el-container class="app-container">
    <el-aside width="240px" class="sidebar">
      <div class="logo-container">
        <router-link to="/" class="logo">
          <img src="https://www.logosc.cn/oss/icons/2021/12/10/i_1qm0jc_8MlgUS.png" alt="logo" class="logo-img" />
          <span class="logo-text">TravelMart</span>
        </router-link>
        <el-divider class="logo-divider" />
      </div>

      <el-menu router :default-active="$route.path" class="nav-menu" background-color="#001529" text-color="#b7c0cd"
        active-text-color="#fff">
        <el-menu-item index="/">
          <el-icon>
            <House />
          </el-icon>
          <span>Dashboard</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon>
            <User />
          </el-icon>
          <span>User Management</span>
        </el-menu-item>
        <!-- <el-menu-item index="/users/create">
          <el-icon>
            <Edit />
          </el-icon>
          <span>用户注册</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon>
            <Tickets />
          </el-icon>
          <span>旅游产品</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon>
            <Setting />
          </el-icon>
          <span>系统设置</span>
        </el-menu-item> -->
      </el-menu>
    </el-aside>

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
  height: 95vh;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #a9c9e9;
  height: 95vh;
  min-width: 16vw;
  border-radius: 8px 8px 8px 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-container {
  padding: 20px 20px 20px 20px;
  position: relative;
  margin-bottom: 20px;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  height: 100%;
}

.logo-img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.logo-text {
  font-size: 25px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  color: #fff;
  margin-left: 15px;
  white-space: nowrap;
}

.logo-divider {
  margin: 16px 0 8px 0;
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-menu {
  border-right: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: inherit;
  padding: 0 12px;
}

.el-menu-item {
  height: 56px;
  line-height: 56px;
  font-size: 15px;
  font-weight: 500;
  font-family: 'Poppins', sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 4px 0;
  border-radius: 6px;
  color: #0a4a82;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.el-menu-item .el-icon {
  color: inherit;
  font-size: 20px;
  width: 24px;
  margin-left: 10px;
  margin-right: 16px;
  flex-shrink: 0;
}

.el-menu-item span {
  flex-grow: 1;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

/* 交互状态 */
.el-menu-item:not(.is-active):hover {
  background-color: rgba(7, 27, 45, 0.2);
  color: #fff;
}

.el-menu-item.is-active {
  background-color: #1890ff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}

.header {
  height: 60px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  padding: 0 24px;
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
</style>