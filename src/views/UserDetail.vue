<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageContainer from '@/components/PageContainer.vue'
import { useUserStore } from '@/stores/users'
import type { User } from '@/types/user'

const route = useRoute()
const userStore = useUserStore()

// 用户数据
const user = ref<User | null>(null)
const loading = ref(true)
const error = ref(false)

// 获取用户数据
const fetchUser = async () => {
  const userId = Number(route.params.id)
  loading.value = true
  error.value = false

  try {
    // 确保用户列表已加载
    if (userStore.users.length === 0) {
      await userStore.fetchUsers()
    }
    // 查找用户
    user.value = userStore.users.find(u => u.userId === userId) || null
    if (!user.value) {
      throw new Error('用户未找到')
    }
  } catch (err) {
    console.error('Failed to fetch user:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// 加载用户数据
onMounted(() => {
  fetchUser()
})

// 监听路由参数变化
watch(
  () => route.params.id,
  () => {
    fetchUser()
  }
)
</script>

<template>
  <PageContainer>
    <div v-if="loading" class="loading-placeholder">加载中...</div>
    <div v-else-if="error" class="error-placeholder">加载用户数据失败</div>
    <div v-else class="user-profile">
      <!-- 用户基本信息 -->
      <div class="header">
        <div class="avatar">
          <img src="/avatar.png" alt="User Avatar" />
        </div>
        <div class="bio">
          <h2>{{ user?.userName }}</h2>
          <p>{{ user?.bio || '暂无个人简介' }}</p>
        </div>
      </div>

      <!-- 用户详细信息 -->
      <div class="info-section">
        <el-form label-width="120px" class="form">
          <el-form-item label="性别">
            <span>{{ user?.gender || '未知' }}</span>
          </el-form-item>
          <el-form-item label="商户类型">
            <span>{{ user?.userRole === 'MERCHANT' ? '商户' : user?.userRole === 'ADMIN' ? '管理员' : '普通用户' }}</span>
          </el-form-item>
          <el-form-item label="手机号">
            <span>{{ user?.userTel || '未提供' }}</span>
          </el-form-item>
          <el-form-item label="邮箱">
            <span>{{ user?.userEmail || '未提供'}}</span>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </PageContainer>
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
    width: 66vw;
    height: 28vh;
    /* background: linear-gradient(135deg, #205684, #92bae4); */
    background-color: #275f94;
    color: white;
    display: flex;
    align-items: center;
    padding: 3vh 4vw;
    box-sizing: border-box;
    border-radius: 1vh;
}

.avatar {
    flex-shrink: 0;
    margin-right: 16px;
}

.avatar img {
    width: 7vw;
    height: 7vw;
    border-radius: 50%;
    border: 3px solid white;
}

.bio {
    flex: 1;
}

.bio h2 {
    margin: 0 0 0.5vh;
    font-size: 4vh;
    font-weight: bold;
    color: #ffffff;
}

.bio p {
    margin: 0;
    font-size: 2vh;
    color: #d0d0d0;
}

.info-section {
    min-width: 66vw;
    min-height: 20vh;
    max-height: 40vh;
    margin-top: 2vh;
    padding: 3vh 3vw;
    background: white;
    border-radius: 1vh;
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
    margin-left: 0;
}

span {
    font-size: 2vh;
}

:deep(.el-form-item__label) {
    font-size: 2vh;
    font-weight: 600;
    color: #275f94;
}
</style>
