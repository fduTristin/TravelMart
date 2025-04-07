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
h1 {
  font-size: 3vh;
  font-weight: 600;
  color: #15324d;
  margin: 2vh 0 0 2vw;
}

.page-container {
  background-color:inherit;
  height: inherit;
  top: 0;
  left: 0;
  right: 0;
  margin: 2vh, 0;
}

.page-header {
  padding: 1vh 2vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-content {
  padding: 2vh 2vw;
}
</style>