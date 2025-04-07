<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { User } from '@/types/user'
import PageContainer from '@/components/PageContainer.vue'
// import { Plus, View, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import BaseButton from '@/components/BaseButton.vue'
import UserTable from '@/components/UserTable.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const error = ref<string | null>(null)

// 加载数据
const loadData = async () => {
  error.value = null
  try {
    await userStore.fetchUsers()
    // ElMessage.success('User list refreshed successfully')
  } catch (err) {
    error.value = 'Failed to load data. Please refresh the page.'
    ElMessage.error('Failed to load data. Please refresh the page.')
    console.error('Failed to load users:', err)
  }
}

// 监听路由变化
watch(
  () => route.fullPath,
  (newPath) => {
    console.log('Route changed:', newPath)
    if (route.name === 'users') {
      loadData()
    }
  }
)

// 组件挂载时加载数据
onMounted(() => {
  console.log('Component mounted')
  loadData()
})

// 查看详情
const handleView = (user: User) => {
  router.push(`/users/${user.userId}`)
}

// // 编辑用户
// const handleEdit = (user: User) => {
//   router.push(`/users/${user.userId}`)
// }

// // 删除用户
// const handleDelete = async (user: User) => {
//   try {
//     await ElMessageBox.confirm(
//       'Are you sure you want to delete this user?',
//       'Warning',
//       {
//         confirmButtonText: 'Confirm',
//         cancelButtonText: 'Cancel',
//         type: 'warning',
//       }
//     )
//     await userStore.deleteUser(user.userId)
//     ElMessage.success('Deleted successfully')
//   } catch (e) {
//     if (e !== 'cancel') {
//       ElMessage.error('Failed to delete')
//     }
//   }
// }

// 创建新用户
const handleCreate = () => {
  router.push('/users/create')
}

</script>

<template>
  <PageContainer title="">
    <template #actions>
      <BaseButton 
        type="primary" 
        @click="loadData" 
        :loading="userStore.loading"
        :icon="Refresh"
      >
        刷新
      </BaseButton>
    </template>

    <UserTable
      :users="userStore.users"
      :loading="userStore.loading"
      empty-text="用户列表为空"
      @row-click="handleView"
    >
      <!-- 如需添加操作列 -->
      <!-- <template #actions>
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click.stop="handleView(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </template> -->
    </UserTable>
  </PageContainer>
</template>
