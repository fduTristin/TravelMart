<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <div class="page-container">
    <div class="page-header">
      <h1 v-if="title">{{ title }}</h1>
      <div class="page-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    <div class="page-content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background-color:inherit;
  height: inherit;
  top: 0;
  left: 0;
  right: 0;
  margin: 20px, 0;
}

.page-header {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.page-content {
  padding: 24px;
}
</style>