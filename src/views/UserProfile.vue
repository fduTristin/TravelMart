<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useUserStore } from '@/stores/users'
import type { User, UpdateUserForm } from '@/types/user'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/BaseButton.vue'

const userStore = useUserStore()
const authStore = useAuthStore()
const loading = ref(true)
const editing = ref(false) // 是否处于编辑模式
const user = ref<User>({
    userId: 0,
    userName: '',
    userEmail: '',
    userRole: '',
    userTel: '',
    userBio: '',
})
const formData = ref<UpdateUserForm>({
    userName: '',
    userEmail: '',
    userTel: '',
})

// 获取用户信息
const fetchUserProfile = async () => {
    loading.value = true
    try {
        const response = await userStore.fetchCurrentUser()
        user.value = response.data
        formData.value = {
            userName: user.value.userName,
            userEmail: user.value.userEmail,
            userTel: user.value.userTel,
        }
    } catch (error) {
        console.error('Failed to fetch user profile:', error)
        ElMessage.error('获取用户信息失败')
    } finally {
        loading.value = false
    }
}

// 保存用户信息
const saveUserProfile = async () => {
    try {
        loading.value = true
        await userStore.updateUser(user.value.userId, formData.value)
        ElMessage.success('用户信息更新成功')
        editing.value = false
        fetchUserProfile()
    } catch (error) {
        console.error('Failed to update user profile:', error)
        ElMessage.error('更新用户信息失败')
    } finally {
        loading.value = false
    }
}

const route = useRoute()

// 监听用户变化，切换用户重新加载数据

watch(() => authStore.user, () => {
  if (authStore.token) {
    fetchUserProfile()
  }
}, { deep: true })


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
        <div class="info-grid" :class="{ 'single-column': user.userRole === 'ADMIN' }">
            <div class="info-section">
                <el-form v-if="!editing" label-width="10vh" class="form">
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
                    <el-form-item v-if="user.userRole === 'MERCHANT' || user.userRole === 'CUSTOMER'">
                        <BaseButton type="primary" @click="editing = true">
                            编辑用户信息
                        </BaseButton>
                    </el-form-item>
                </el-form>

                <el-form v-else :model="formData" label-width="10vh" class="form">
                    <el-form-item label="用户名">
                        <el-input v-model="formData.userName" />
                    </el-form-item>
                    <el-form-item label="手机号">
                        <el-input v-model="formData.userTel" />
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="formData.userEmail" />
                    </el-form-item>
                    <el-form-item>
                        <BaseButton type="primary" @click="saveUserProfile">
                            保存
                        </BaseButton>
                        <BaseButton type="default" @click="editing = false">
                            取消
                        </BaseButton>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 新增账户信息，仅非ADMIN用户显示 -->
            <div v-if="user.userRole !== 'ADMIN'" class="account-section">
                <el-form label-width="10vh" class="form">
                    <el-form-item label="账户状态">
                        <span>{{ user.userRole === 'MERCHANT' ? '活跃' : '正常' }}</span>
                    </el-form-item>
                    <el-form-item label="注册时间">
                        <span>2023-01-01</span>
                    </el-form-item>
                    <el-form-item label="最后登录">
                        <span>2023-10-01</span>
                    </el-form-item>
                </el-form>
            </div>
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

.info-grid {
    display: grid;
    grid-template-columns: 48% 48%;
    gap: 4%;
    width: 66vw;
    margin-top: 2vh;
}

.info-grid.single-column {
    grid-template-columns: 100%;
}

.info-section,
.account-section {
    padding: 4vh 4vw;
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

:deep(.el-radio__label),
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  font-family: "Noto Sans SC", sans-serif;
  font-size: 2vh;
  height: 3.5vh;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  border-color: #275f94;
}
</style>
