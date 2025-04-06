<script setup lang="ts">
import type { User } from '@/types/user'

defineProps<{
  user: User & { bio?: string }
}>()
</script>

<template>
  <div class="user-card">
    <div class="left-section">
      <el-form label-width="120px" class="form">
        <el-form-item label="用户名">
          <span>{{ user.userName }}</span>
        </el-form-item>
        <el-form-item label="邮箱">
          <span>{{ user.userEmail }}</span>
        </el-form-item>
      </el-form>
    </div>
    <div class="right-section">
      <div class="avatar">
        <img src="https://via.placeholder.com/80" alt="User Avatar" />
      </div>
      <p class="bio">{{ user.bio || '暂无个人简介' }}</p>
    </div>
  </div>
</template>

<style scoped>
.user-card {
  display: flex;
  justify-content: space-between;
  background: linear-gradient(135deg, #f0f4ff, #d9e6ff);
  border-radius: 1vh;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  max-width: 50vw;
  margin: 16px auto;
  transition: transform 0.3s, box-shadow 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.left-section {
  flex: 1;
  padding-right: 16px;
  border-right: 1px solid #ccc;
}

.form {
  background: white;
  padding: 16px;
  border-radius: 1vh;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.el-form-item__label {
  font-weight: 500;
  color: #2b3a67;
}

.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-left: 16px;
}

.avatar {
  margin-bottom: 16px;
}

.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #2b3a67;
}

.bio {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}
</style>
