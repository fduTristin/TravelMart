<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { ElAside, ElMenu, ElMenuItem, ElIcon, ElDivider, ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus'
import { House, User, Edit, Tickets, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 处理登出
const handleLogout = () => {
  // 保存用户名到 localStorage
  if (authStore.user?.sub) {
    localStorage.setItem('lastUsername', authStore.user.sub)
  }
  authStore.logout()
  router.push('/login')
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      handleLogout()
      break
  }
}
</script>

<template>
  <el-aside width="240px" class="sidebar">
    <div class="logo-container">
      <router-link to="/" class="logo">
        <img src="https://www.logosc.cn/oss/icons/2021/12/10/i_1qm0jc_8MlgUS.png" alt="logo" class="logo-img" />
        <span class="logo-text">旅游商城</span>
      </router-link>
      <el-divider class="logo-divider" />
    </div>

    <el-menu router :default-active="route.path" class="nav-menu" background-color="#001529" text-color="#b7c0cd"
      active-text-color="#fff">
      <el-menu-item index="/" class="menu-item">
        <el-icon>
          <House />
        </el-icon>
        <span>首页</span>
      </el-menu-item>
      <el-menu-item v-if="authStore.isAdmin" index="/users" class="menu-item">
        <el-icon>
          <User />
        </el-icon>
        <span>用户管理</span>
      </el-menu-item>
      <!-- <el-menu-item index="/profile" class="menu-item">
        <el-icon>
          <Tickets />
        </el-icon>
        <span>个人信息</span>
      </el-menu-item> -->
      <el-menu-item v-if="authStore.isMerchant" index="/stores" class="menu-item">
        <el-icon>
          <Setting />
        </el-icon>
        <span>店铺管理</span>
      </el-menu-item>
    </el-menu>

    <!-- 用户信息区域 -->
    <div class="user-info">
      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info-content">
          <el-avatar :size="40" :src="'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
          <span class="username">{{ authStore.user?.sub }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人信息
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-aside>
</template>

<style scoped>
.sidebar {
  background: inherit;
  height: inherit;
  width: 18vw;
  /* box-shadow: 0 0 15px rgba(0, 0, 0, 0.2); */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-container {
  padding: 20px;
  position: relative;
  margin-bottom: 20px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 添加居中 */
  text-decoration: none;
  height: 100%;
}

.logo-img {
  width: 4vw;
  height: 4vw;
  object-fit: contain;
}

.logo-text {
  font-size: 28px;
  font-weight: 600;
  font-family: "Noto Sans SC";
  color: #073c62;
  margin-left: 1vw;
}

.logo-divider {
  margin: 16px 0 8px 0;
  background-color: rgba(199, 20, 20, 0.1);
}

.nav-menu {
  border-right: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: inherit;
  padding: 0;
  align-items: center;
  /* 使菜单项居中 */
}

.menu-item {
  height: 6vh;
  font-size: 15px;
  font-weight: 500;
  font-family: "Noto Sans SC";
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 2vw;
  margin-right: 2vw;
  margin-bottom: 1.5vh;
  border-radius: 12px;
  color: #062a4a;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  /* 内容从左侧开始 */
  width: 90%;
  /* 设置固定宽度 */
  padding: 0 16px;
}

.menu-item .el-icon {
  color: inherit;
  font-size: 20px;
  width: 2.5vw;
  height: 2.5vw;
  margin-right: 1.6vw;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(162, 163, 164, 0.25);
  transition: background-color 0.3s;
}

.menu-item.is-active .el-icon {
  background-color: #275f94;
  color: #fff;
}

.menu-item span {
  flex-grow: 1;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

/* Interaction states */
.menu-item:not(.is-active):hover {
  background-color: inherit;
  color: #9dafe4;
}

.menu-item.is-active {
  background-color: #fff;
  color: inherit;
  box-shadow: 0 4px 12px rgba(237, 238, 239, 0.25);
}

.user-info {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
}

.user-info-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.05);
}

.user-info-content:hover {
  background-color: rgba(255, 255, 255, 0.1);
  /* transform: translateY(-2px); */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info-content:hover .username {
  color: #fff;
}

.username {
  margin-left: 12px;
  color: #000000;
  font-size: 14px;
  transition: color 0.3s ease;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 0;
}
</style>
