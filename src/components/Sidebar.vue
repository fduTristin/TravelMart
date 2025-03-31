<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { ElAside, ElMenu, ElMenuItem, ElIcon, ElDivider, ElAvatar } from 'element-plus'
import { House, User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import CustomDropdown from '@/components/CustomDropdown.vue'

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
      <el-menu-item v-if="authStore.isMerchant" index="/stores" class="menu-item">
        <el-icon>
          <Setting />
        </el-icon>
        <span>店铺管理</span>
      </el-menu-item>
    </el-menu>

    <!-- 用户信息区域 -->
    <div class="user-info">
      <custom-dropdown>
        <template #trigger>
          <div class="user-info-content">
            <el-avatar :src="'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" class="custom-avatar" />
            <span class="username">{{ authStore.user?.sub }}</span>
          </div>
        </template>
        <template #menu>
          <div @click="handleCommand('profile')">
            <el-icon><User /></el-icon>
            个人信息
          </div>
          <div @click="handleCommand('logout')">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </div>
        </template>
      </custom-dropdown>
    </div>
  </el-aside>
</template>

<style scoped>
.sidebar {
  background: inherit;
  height: inherit;
  width: 16vw;
  display: flex;
  flex-direction: column;
  align-items: center; /* 横向居中 */
  overflow: hidden;
}

.logo-container {
  padding: 15px;
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
  width: 4.5vw;
  height: 4.5vw;
  object-fit: contain;
}

.logo-text {
  font-size: 30px;
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
  flex-direction: column; /* 竖向排列 */
  background-color: inherit;
  padding: 0;
  align-items: center; /* 横向居中 */
  justify-content: flex-start; /* 自上而下排列 */
}

.menu-item {
  height: 6vh;
  font-size: 15px;
  font-weight: 500;
  font-family: "Noto Sans SC";
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1.5vh;
  border-radius: 12px;
  color: #275f94;
  display: flex;
  align-items: center;
  justify-content: center; /* 横向居中 */
  width: 14vw;
  padding: 0 16px;
}

.menu-item .el-icon {
  color: #275f94;
  font-size: 22px;
  width: 2.5vw;
  height: 2.5vw;
  margin-right: 1.2vw;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(162, 163, 164, 0.25);
  transition: background-color 0.3s;
}

.menu-item span {
  flex-grow: 1;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.menu-item.is-active .el-icon {
  background-color: #275f94;
  color: #fff;
}

.menu-item:not(.is-active):hover {
  background-color: #275f94;
  color: #fff;
}

.menu-item:not(.is-active):hover .el-icon {
  color: #275f94;
}

.menu-item.is-active {
  background-color: #fff;
  color: #275f94;
  box-shadow: 0 4px 12px rgba(237, 238, 239, 0.25);
}

.user-info {
  position: relative; /* 确保子元素的绝对定位基于 user-info */
  padding: 1vh;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  display: flex;
  justify-content: center; /* 横向居中 */
  width: 100%;
}

.user-info-content {
  display: flex;
  align-items: center;
  justify-content: center; /* 居中显示 */
  min-width: 10vw;
  cursor: pointer;
  padding: 0.8vw;
  border-radius: 1vh;
  transition: all 0.3s ease;
  background-color: inherit;
  gap: 1.2vw; /* 自定义间隔 */
}

.user-info-content:hover {
  background-color: #275f94;
  /* transform: translateY(-2px); */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-info-content:hover .username {
  color: #fff;
}

.username {
  color: #275f94;
  font-size: 20px;
  font-weight: 700;
  transition: color 0.3s ease;
  text-align: center;
}

.custom-avatar {
  width: 3.5vw;
  height: 3.5vw;
  border: 2px solid #275f94;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 1vh; /* 设置为方形 */
}

.custom-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}
</style>
