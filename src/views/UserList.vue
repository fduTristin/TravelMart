<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/users'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { User } from '@/types/user'
import PageContainer from '@/components/PageContainer.vue'
import { Plus, View, Edit, Delete } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const error = ref<string | null>(null)

// 加载数据
const loadData = async () => {
  error.value = null
  try {
    await userStore.fetchUsers()
  } catch (err) {
    error.value = 'Failed to load data. Please refresh the page.'
    console.error('Failed to load users:', err)
  }
}

// 监听路由变化
watch(
  () => route.fullPath,
  (newPath) => {
    console.log('Route changed:', newPath)
    if (route.name === 'lab1/users') {
      loadData()
    }
  }
)

// 组件挂载时加载数据
onMounted(() => {
  console.log('Component mounted')
  loadData()
})

</script>


<template>
  <PageContainer title="User Management">

    <div class="table-wrapper" v-loading="userStore.loading">
      <el-table 
        v-if="userStore.users.length > 0"
        :data="userStore.users"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="Name" min-width="80" />
        <el-table-column prop="email" label="E-mail" min-width="100" />
      </el-table>

      <div v-else-if="!userStore.loading" class="empty-state">
        <el-empty description="No users found"> </el-empty>
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

:deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-bg-color: #f8f9fc;
}

:deep(.el-button-group) {
  display: flex;
  gap: 4px;
}
</style> 