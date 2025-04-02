<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { User } from '@/types/user'
import { getUserRoleLabel } from '@/types/user'
import { useUserStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'

const userStore = useUserStore()
const authStore = useAuthStore()
const user = ref<User | null>(null)

onMounted(async () => {
  await userStore.fetchSelf()
  user.value = userStore.userSelf
})

watch(() => userStore.userSelf, (newUser) => {
  user.value = newUser
})

watch(() => authStore.token, async () => {
  await userStore.fetchSelf()
})

</script>

<template>
    <div class="user-profile">
        <!-- 顶部背景 -->
        <div class="header">
            <div class="avatar">
                <img src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" alt="User Avatar" />
            </div>
            <div class="bio">
                <h2>{{ user?.userName || '未知用户' }}</h2>
                <p>{{ user?.bio || '暂无个人简介' }}</p>
            </div>
        </div>

        <!-- 下方个人信息 -->
        <div class="info-section">
            <el-form label-width="120px" class="form">
                <el-form-item label="角色">
                    <span>{{ getUserRoleLabel(user?.userRole || 'CUSTOMER') }}</span>
                </el-form-item>
                <el-form-item label="手机号">
                    <span>{{ user?.userTel || '未提供' }}</span>
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
    width: 72vw;
    height: 28vh;
    /* background: linear-gradient(135deg, #205684, #92bae4); */
    background-color: #275f94;
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
    margin: 0 0 4px;
    font-size: 40px;
    font-weight: bold;
    color: #ffffff;
}

.bio p {
    margin: 0;
    font-size: 20px;
    color: #d0d0d0;
}

.info-section {
    min-width: 72vw;
    min-height: 20vh;
    max-height: 40vh;
    margin-top: 24px;
    padding: 30px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    /* 使用 flex 布局 */
    flex-direction: column;
}

.form {
    display: flex;
    /* 使用 flex 布局 */
    flex-direction: column;
    /* 改为单列布局 */
    gap: 2vh;
    /* 表单项之间的间距 */
}

.el-form-item {
    margin-bottom: 0;
}

:deep(.el-form-item__label) {
    font-size: 20px;
    font-weight: 600;
    margin-right: 0.6vw;
    color: #275f94;
}

span {
    font-size: 20px;  /* 调整内容字体大小 */
}
</style>
