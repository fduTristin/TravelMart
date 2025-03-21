<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { User } from '@/types/user'
import PageContainer from '@/components/PageContainer.vue'
// import { Plus, View, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { Plus, Refresh } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const error = ref<string | null>(null)

// 加载数据
const loadData = async () => {
  error.value = null
  try {
    await userStore.fetchUsers()
    ElMessage.success('User list refreshed successfully')
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
      <el-button @click="loadData" :loading="userStore.loading">
        <el-icon><Refresh /></el-icon>
        <div class="button-text">刷新</div>
      </el-button>
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        <div class="button-text">新建用户</div>
      </el-button>
    </template>

    <div class="table-wrapper" v-loading="userStore.loading">
      <el-table
        v-if="userStore.users.length > 0"
        :data="userStore.users"
        style="width: 100%"
      >
        <el-table-column prop="userId" label="ID" width="80" />
        <el-table-column prop="userName" label="Name" min-width="80" />
        <el-table-column prop="userEmail" label="E-mail" min-width="100" />
        <!-- <el-table-column label="Actions" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button
                size="small"
                @click="handleView(row)"
                title="View Details"
              >
                <el-icon><View /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="handleEdit(row)"
                title="Edit User"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(row)"
                title="Delete User"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-button-group>
          </template>
        </el-table-column> -->
      </el-table>

      <div v-else-if="!userStore.loading" class="empty-state">
        <el-empty description="用户列表为空">
        </el-empty>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped>
.empty-state {
  padding: 60px 0;
  text-align: center;
}

.table-wrapper {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.button-text {
  font-size: 15px;
  font-weight: 700;
  margin-left: 4px;
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;;
}

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: #f8f9fc;
}

:deep(.el-button-group) {
  display: flex;
  gap: 4px;
}
</style>