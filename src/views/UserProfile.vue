<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { useAccountStore } from '@/stores/accounts'
import type { User, UpdateUserDTO } from '@/types/user'
import type { Account, AccountBalanceUpdateDTO } from '@/types/account'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/BaseButton.vue'

const userStore = useUserStore()
const authStore = useAuthStore()
const accountStore = useAccountStore()
const loading = ref(true)
const editing = ref(false) // 是否处于编辑模式
const recharging = ref(false) // 是否处于充值模式

const user = ref<User>({
    userId: 0,
    userName: '',
    userEmail: '',
    userRole: '',
    userTel: '',
    userBio: '',
})

const account = ref<Account>({
    accountStatus: '',
    accountBalance: 0
})

const userFormData = ref<UpdateUserDTO>({
    userName: '',
    userEmail: '',
    userTel: '',
})

const accountFormData = ref({
    accountStatus: '',
    accountBalance: 0
})

const accountBalanceFormData = ref<AccountBalanceUpdateDTO>({
    amountIncrement: 0
})

// 获取用户信息
const fetchUserProfile = async () => {
    loading.value = true
    try {
        const response = await userStore.fetchCurrentUser()
        await accountStore.fetchCurrentAccount()
        user.value = userStore.currentUser
        account.value = accountStore.currentAccount
        userFormData.value = {
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
        // 检查哪些字段未修改，未修改的字段设置为 null
        const payload = {
            userName: userFormData.value.userName !== user.value.userName ? userFormData.value.userName : null,
            userEmail: userFormData.value.userEmail !== user.value.userEmail ? userFormData.value.userEmail : null,
            userTel: userFormData.value.userTel !== user.value.userTel ? userFormData.value.userTel : null,
        }
        await userStore.updateUser(payload)
        ElMessage.success('用户信息更新成功')
        editing.value = false
        fetchUserProfile()
    } catch (error: any) {
        console.error('用户信息更新失败:', error)
        ElMessage.error(error.message || '用户信息更新失败')
    } finally {
        loading.value = false
    }
}

// 保存账户余额
const saveAccountBalance = async () => {
    try {
        loading.value = true
        await accountStore.updateAccountBalance(accountBalanceFormData.value)
        ElMessage.success('充值成功')
        recharging.value = false
        account.value = accountStore.currentAccount
    } catch (error: any) {
        console.error('充值失败:', error)
        ElMessage.error(error.message || '充值失败')
    } finally {
        loading.value = false
    }
}

// 监听用户变化，切换用户重新加载数据

watch(() => authStore.user, () => {
    if (authStore.token && !authStore.isAdmin) {
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
                <p>ID: {{ user.userId }} | {{ user.userRole === 'MERCHANT' ? '商户' :
                    user.userRole === 'ADMIN' ? '管理员' : '普通用户' }}</p>
            </div>
        </div>

        <!-- 下方个人信息 -->
        <div class="info-grid">
            <div class="info-section">
                <el-form v-if="!editing" class="form">
                    <el-form-item label="用户名">
                        <span>{{ user.userName }}</span>
                    </el-form-item>
                    <el-form-item label="手机号">
                        <span>{{ user.userTel || '未提供' }}</span>
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <span>{{ user?.userEmail || '未提供' }}</span>
                    </el-form-item>
                    <el-form-item class="center-content">
                        <BaseButton type="primary" @click="editing = true">
                            编辑用户信息
                        </BaseButton>
                    </el-form-item>
                </el-form>

                <el-form v-else :model="userFormData" class="form">
                    <el-form-item label="用户名">
                        <el-input v-model="userFormData.userName" />
                    </el-form-item>
                    <el-form-item label="手机号">
                        <el-input v-model="userFormData.userTel" />
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="userFormData.userEmail" />
                    </el-form-item>
                    <el-form-item class="center-content">
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
            <div class="account-section">
                <el-form class="form">
                    <el-form-item label="账户余额">
                        <span>{{ account?.accountBalance || 0 }}</span>
                    </el-form-item>
                    <el-form-item label="账户状态">
                        <span :style="{ color: account?.accountStatus === 'active' ? 'green' : 'red' }">
                            {{ account?.accountStatus }}
                        </span>
                    </el-form-item>
                    <el-form-item
                        v-if="!recharging && account?.accountStatus === 'active' && user.userRole === 'CUSTOMER'"
                        class="center-content1">
                        <BaseButton type="primary" @click="recharging = true">
                            充值账户余额
                        </BaseButton>
                    </el-form-item>

                    <el-form v-else-if="recharging" :model="accountFormData" class="form">
                        <el-form-item label="充值金额">
                            <el-input-number v-model="accountBalanceFormData.amountIncrement" :min="0" :step="1000" />
                        </el-form-item>
                        <el-form-item class="center-content">
                            <BaseButton type="primary" @click="saveAccountBalance">
                                保存
                            </BaseButton>
                            <BaseButton type="default" @click="recharging = false">
                                取消
                            </BaseButton>
                        </el-form-item>
                    </el-form>
                </el-form>
            </div>

            <!-- TODO: 充值账户余额功能 -->
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
    width: 56vw;
    height: 24vh;
    margin-bottom: 2vh;
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
    grid-template-columns: 45% 45%;
    gap: 10%;
    width: 56vw;
    margin-top: 2vh;
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
    gap: 1.8vh;
}

.el-form-item {
    margin-bottom: 0;
    margin-left: 0;
}

span {
    font-size: 2vh;
}

:deep(.el-form-item__label) {
    width: 35%;
    font-size: 2vh;
    font-weight: 550;
    color: #275f94;
}

:deep(.el-form-item__content) {
    justify-content: flex-start;
}

:deep(.el-radio__label),
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
    font-family: "Noto Sans SC", sans-serif;
    font-size: 2vh;
    height: 3vh;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
    border-color: #275f94;
}

::v-deep(.center-content .el-form-item__content) {
    justify-content: center;
    display: flex;
}

::v-deep(.center-content1 .el-form-item__content) {
    margin-top: 5vh;
    justify-content: center;
    display: flex;
}
</style>
