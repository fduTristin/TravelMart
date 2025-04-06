<template>
  <div class="user-table-container">
    <!-- 有数据时显示表格 -->
    <el-table 
      v-if="users.length > 0"
      :data="users" 
      v-loading="loading" 
      style="width: 100%" 
      :row-class-name="tableRowClassName" 
      @row-click="handleRowClick"
    >
      <el-table-column prop="userId" label="ID" min-width="30" sortable />
      <el-table-column 
        prop="userRole" 
        label="用户类型" 
        min-width="40" 
        :formatter="(row) => row.userRole === 'MERCHANT' ? '商户' : row.userRole === 'ADMIN' ? '管理员' : '普通用户'" 
        :show-overflow-tooltip="true" 
      /> 
      <el-table-column prop="userName" label="用户名" min-width="60" :show-overflow-tooltip="true" />
      <el-table-column prop="userEmail" label="邮箱" min-width="100" :show-overflow-tooltip="true" />
      <el-table-column prop="userTel" label="手机号" min-width="100" :show-overflow-tooltip="true" />
    </el-table>

    <!-- 无数据且不在加载状态时显示空状态 -->
    <div 
      v-if="users.length === 0 && !loading" 
      class="empty-state"
    >
      <el-empty :description="emptyText" />
    </div>

    <!-- 加载状态指示器（覆盖整个容器） -->
    <div 
      v-if="loading"
      class="loading-overlay"
    >
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>加载中</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@/types/user'

interface Props {
  users: User[]
  loading?: boolean
  emptyText?: string
  showEmpty?: boolean
  rowClassName?: string | ((row: User) => string)
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: " ",
  showEmpty: true,
  loading: false
})

const emit = defineEmits(['row-click'])

const tableRowClassName = ({ row }: { row: User }) => {
  return typeof props.rowClassName === 'function'
    ? props.rowClassName(row)
    : props.rowClassName
}

const handleRowClick = (row: User) => {
  emit('row-click', row)
}
</script>

<style scoped>
.user-table-container {
  background: white;
  border-radius: 1vh;
  padding: 2vh 3vw;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  width: 70vw;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

:deep(.el-table) {
  font-family: "Noto Sans SC";

  /* 表头样式 */
  .el-table__header-wrapper th {
    height: 5vh;

    .cell {
      font-weight: 600;
      font-size: 2vh;
    }
  }

  /* 数据行样式 */
  .el-table__body-wrapper td {
    height: 7vh;

    .cell {
      font-weight: 500;
      font-size: 2vh;
    }
  }

  /* 行悬停效果 */
  .el-table__row {
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #f5f7fa;
    }
  }

  /* 单元格内边距 */
  .el-table__cell {
    padding: 1vh 0;
  }
}
</style>