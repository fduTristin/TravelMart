<script setup lang="ts">
import { ElButton } from 'element-plus'

defineProps({
    type: {
        type: String,
        default: 'default',
        validator: (value: string) => ['default', 'primary', 'success', 'warning', 'danger', 'info'].includes(value)
    },
    loading: Boolean,
    disabled: Boolean,
    icon: String,
    plain: Boolean,
    round: Boolean,
    circle: Boolean,
    size: {
        type: String,
        default: 'default',
        validator: (value: string) => ['large', 'default', 'small'].includes(value)
    }
})

defineEmits(['click'])
</script>

<template>
    <ElButton :type="type" :loading="loading" :disabled="disabled" :icon="icon" :plain="plain" :round="round"
        :circle="circle" :size="size" @click="$emit('click')" class="base-button" :class="[`button-${type}`]">
        <span class="button-content">
            <slot></slot>
        </span>
    </ElButton>
</template>

<style scoped>
.base-button {
    min-width: 5vw;
    height: 48px;
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: "Noto Sans SC";
}

.button-content {
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 0.8px;
}

/* 主按钮样式 */
.button-primary {
    background: linear-gradient(135deg, #1890ff 0%, #74a5c3 100%);
    border: none;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.button-primary:hover:not(.is-disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

/* 默认按钮样式 */
.button-default {
    border: 1px solid #d9d9d9;
    background: #fff;
}

.button-default:hover:not(.is-disabled) {
    color: #1890ff;
    border-color: #1890ff;
    background: rgba(24, 144, 255, 0.04);
}

/* 禁用状态 */
:deep(.el-button.is-disabled) {
    opacity: 0.6;
}

/* 加载状态 */
:deep(.el-button.is-loading) {
    opacity: 0.8;
    transform: none !important;
}

:deep(.el-button .el-icon) {
  font-size: 18px;
  margin-right: 6px;
}
</style>