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
    height: 5vh;
    border-radius: 1vh;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: "Noto Sans SC";
}

.button-content {
    display: inline-flex;
    font-size: 2vh;
    font-weight: 600;
    letter-spacing: 0.8px;
}

/* 主按钮样式 */
.button-primary {
    background-color: #275f94;
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
    color: #275f94;
    border-color: #275f94;
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
    display: inline-flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
}
</style>