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
      <el-menu-item index="/profile" class="menu-item">
        <el-icon>
          <Tickets />
        </el-icon>
        <span>个人信息</span>
      </el-menu-item>
      <el-menu-item index="/Stores" class="menu-item">
        <el-icon>
          <Setting />
        </el-icon>
        <span>店铺管理</span>
      </el-menu-item>
    </el-menu>
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
</style>