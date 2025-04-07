<template>
  <div class="dropdown">
    <div class="dropdown-trigger" @mouseenter="openDropdown" @mouseleave="scheduleClose">
      <slot name="trigger"></slot>
    </div>
    <div :class="['dropdown-menu', positionClass, { 'visible': isOpen }]" 
         @mouseenter="cancelClose" 
         @mouseleave="scheduleClose">
      <slot name="menu"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const isOpen = ref(false)
const closeTimer = ref<number | null>(null)
const position = ref<'top' | 'bottom' | 'left' | 'right'>('top') // 默认向上展开

const openDropdown = () => {
  if (closeTimer.value) {
    clearTimeout(closeTimer.value)
    closeTimer.value = null
  }
  isOpen.value = true
}

const scheduleClose = () => {
  closeTimer.value = setTimeout(() => {
    isOpen.value = false
  }, 200) // 200ms延迟
}

const cancelClose = () => {
  if (closeTimer.value) {
    clearTimeout(closeTimer.value)
    closeTimer.value = null
  }
}

const positionClass = computed(() => {
  switch (position.value) {
    case 'top':
      return 'dropdown-menu-top'
    case 'bottom':
      return 'dropdown-menu-bottom'
    case 'left':
      return 'dropdown-menu-left'
    case 'right':
      return 'dropdown-menu-right'
    default:
      return 'dropdown-menu-bottom'
  }
})
</script>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 1vh;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1;
  width: 10vw;
  padding: 0;
  opacity: 0;
  visibility: hidden;
  transition: 
    opacity 0.2s ease,
    visibility 0.2s ease,
    transform 0.2s ease;
  transform: translateY(-5px);
}

.dropdown-menu.visible {
  opacity: 1;
  visibility: visible;
}

.dropdown-menu > * {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5vw;
  padding: 1vh 0;
  cursor: pointer;
  transition: background-color 0.8s ease, color 0.8s ease, transform 0.3s ease;
  font-size: 2vh;
  color: #275f94;
  font-weight: 600;
  border-radius: 0;
}

.dropdown-menu-bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.dropdown-menu-top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.dropdown-menu-left {
  top: 50%;
  right: calc(100% + 8px);
  transform: translateY(-50%);
}

.dropdown-menu-right {
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
}

.dropdown-menu > *:first-child {
  border-top-left-radius: 1vh;
  border-top-right-radius: 1vh;
}

.dropdown-menu > *:last-child {
  border-bottom-left-radius: 1vh;
  border-bottom-right-radius: 1vh;
}

.dropdown-menu > *:hover {
  background-color: #275f94;
  color: #fff;
}
</style>