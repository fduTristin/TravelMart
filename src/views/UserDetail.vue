<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { User } from '@/types/user'
import { userService } from '@/services/userService'

const route = useRoute()
const user = ref<User & { bio?: string; phone?: string; userType?: string; gender?: string } | null>(null)

const fetchUser = async () => {
  const userId = route.params.id
  if (!userId) return
  try {
    const response = await userService.getById(Number(userId))
    user.value = response.data
  } catch (error) {
    console.error('Failed to fetch user:', error)
  }
}

onMounted(() => {
  fetchUser()
})
</script>

<template>
  <div class="user-profile" v-if="user">
    <!-- 顶部背景 -->
    <div class="header">
      <div class="avatar">
        <img src="https://via.placeholder.com/100" alt="User Avatar" />
      </div>
      <div class="bio">
        <h2>{{ user.userName }}</h2>
        <p>{{ user.bio || '暂无个人简介' }}</p>
      </div>
    </div>

    <!-- 下方个人信息 -->
    <div class="info-section">
      <el-form label-width="120px" class="form">
        <el-form-item label="性别">
          <span>{{ user.gender || '未知' }}</span>
        </el-form-item>
        <el-form-item label="商户类型">
          <span>{{ user.userType || '普通用户' }}</span>
        </el-form-item>
        <el-form-item label="手机号">
          <span>{{ user.phone || '未提供' }}</span>
        </el-form-item>
        <el-form-item label="邮箱">
          <span>{{ user.userEmail }}</span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: inherit;
  height: inherit;
}

.header {
  width: 72vw;
  height: 28vh;
  background: linear-gradient(135deg, #097ee5, #92bae4);
  color: white;
  display: flex;
  align-items: center;
  padding: 36px;
  box-sizing: border-box;
  border-radius: 12px;
}

.avatar {
  flex-shrink: 0;
  margin-right: 16px;
}

.avatar img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid white;
}

.bio {
  flex: 1;
}

.bio h2 {
  margin: 0 0 8px;
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
}

.bio p {
  margin: 0;
  font-size: 1.2rem;
  color: #d0d0d0;
}

.info-section {
  min-width: 72vw;
  min-height: 20vh;
  max-height: 40vh;
  margin-top: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2vh;
}

.el-form-item {
  margin-bottom: 0;
}

span {
  font-size: 15px;
}
</style>
