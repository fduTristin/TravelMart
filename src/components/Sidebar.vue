<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ElAside, ElMenu, ElMenuItem, ElIcon, ElDivider } from 'element-plus'
import { House, User, Edit, Tickets, Setting } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
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
      <el-menu-item index="/users" class="menu-item">
        <el-icon>
          <User />
        </el-icon>
        <span>用户管理</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<style scoped>
.sidebar {
  background: linear-gradient(135deg, #dde4ec 0%, #0a3aa3 100%);
  height: 95vh;
  width: 15vw;
  border-radius: 8px 8px 8px 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
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
  justify-content: center; /* 添加居中 */
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
  font-family: "Noto Sans SC";
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
  padding: 0;
  align-items: center; /* 使菜单项居中 */
}

.menu-item {
  height: 56px;
  line-height: 56px;
  font-size: 19px;
  font-weight: 500;
  font-family: "Noto Sans SC";
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: 1vw;
  margin-right: 1vw;
  margin-bottom: 1vh;
  border-radius: 6px;
  color: #0a4a82;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 内容从左侧开始 */
  width: 90%; /* 设置固定宽度 */
  padding: 0 16px;
}

.menu-item .el-icon {
  color: inherit;
  font-size: 20px;
  width: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.menu-item span {
  flex-grow: 1;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

/* Interaction states */
.menu-item:not(.is-active):hover {
  background-color: rgba(7, 27, 45, 0.2);
  color: #fff;
}

.menu-item.is-active {
  background-color: #1890ff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}
</style>