<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useUserStore } from '@/stores/users'
import type { User } from '@/types/user'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const userStore = useUserStore()
const authStore = useAuthStore()
const loading = ref(true)
const user = ref<User>({
    userId: 0,
    userName: '',
    userEmail: '',
    userRole: '',
    userTel: '',
    userBio: '',
})

// 获取用户信息
const fetchUserProfile = async () => {
    loading.value = true
    try {
        const response = await userStore.fetchCurrentUser()
        user.value = response.data
    } catch (error) {
        console.error('Failed to fetch user profile:', error)
        ElMessage.error('获取用户信息失败')
    } finally {
        loading.value = false
    }
}

const route = useRoute()

// 监听token变化，切换用户重新加载数据
watch(
    () => authStore.token,
    fetchUserProfile,
    { immediate: true }
)

// 路由更新时重新获取数据
onBeforeRouteUpdate(() => {
    fetchUserProfile()
})

// 组件挂载时获取用户信息
onMounted(() => {
    fetchUserProfile()
})
</script>

<template>
    <div v-loading.fullscreen.lock="loading" class="user-profile">
        <!-- 顶部背景 -->
        <div class="header">
            <div class="avatar">
                <img src="/avatar.png" alt="User Avatar" />
            </div>
            <div class="bio">
                <h2>{{ user.userName }}</h2>
                <p>{{ user.userBio || '暂无个人简介' }}</p>
            </div>
        </div>

        <!-- 下方个人信息 -->
        <div class="info-section">
            <el-form label-width="8vw" class="form">
                <el-form-item label="ID">
                    <span>{{ user.userId }}</span>
                </el-form-item>
                <el-form-item label="用户类型">
                    <span>{{ user.userRole === 'MERCHANT' ? '商户' :
                        user.userRole === 'ADMIN' ? '管理员' : '普通用户' }}</span>
                </el-form-item>
                <el-form-item label="手机号">
                    <span>{{ user.userTel || '未提供' }}</span>
                </el-form-item>
                <el-form-item label="邮箱">
                    <span>{{ user?.userEmail || '未提供' }}</span>
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
