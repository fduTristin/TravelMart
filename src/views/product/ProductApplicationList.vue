<template>
  <el-form :inline="true" :model="filters" class="filter-form" @submit.prevent>
    <el-form-item>
      <el-select v-model="filters.storeId" placeholder="所有店铺" clearable filterable style="width: 7vw;">
        <el-option label="所有店铺" :value="null" /> <el-option v-for="store in availableStores" :key="store.id"
          :label="store.storeName" :value="store.id" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-select v-model="filters.applicationType" placeholder="所有类型" clearable style="width: 7vw;">
        <el-option label="所有类型" :value="null" />
        <el-option v-for="item in applicationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-select v-model="filters.status" placeholder="所有状态" clearable style="width: 7vw;">
        <el-option label="所有状态" :value="null" />
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <BaseButton type="primary" :icon="Search" @click="applyFilters">查询</BaseButton>
      <BaseButton type="default" :icon="RefreshLeft" @click="resetFilters">重置</BaseButton>
      <BaseButton type="default" :icon="Refresh" @click="loadApplications" :loading="isLoading">刷新</BaseButton>
    </el-form-item>
  </el-form>
  <div class="product-application-list-container">
    <el-table v-if="filteredApplications.length > 0" :data="filteredApplications" v-loading="isLoading" stripe
      style="width: 100%" class="application-table" :row-class-name="tableRowClassName" @row-click="handleRowClick">
      <el-table-column prop="id" label="申请ID" min-width=110 sortable />

      <el-table-column label="所属店铺" min-width=130 sortable
        :sort-by="(row: ProductApplication) => getStoreName(row.storeId)">
        <template #default="scope">
          {{ getStoreName(scope.row.storeId) }}
        </template>
      </el-table-column>

      <el-table-column label="商品名称" min-width=120 :show-overflow-tooltip="true">
        <template #default="scope">
          {{ getProductName(scope.row.requestedData) }}
        </template>
      </el-table-column>

      <el-table-column prop="applicationType" label="申请类型" min-width=120>
        <template #default="scope">
          <el-tag :type="getApplicationTypeTag(scope.row.applicationType)">
            {{ formatApplicationType(scope.row.applicationType) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="审核状态" min-width=120>
        <template #default="scope">
          <el-tag :type="getStatusTagType(scope.row.status)">
            {{ formatStatus(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="申请价格" min-width=120 align="right">
        <template #default="scope">
          {{ getProductPrice(scope.row.requestedData) }} 元
        </template>
      </el-table-column>

      <el-table-column prop="createdAt" label="申请时间" min-width=210 sortable>
        <template #default="scope">
          {{ formatDateTime(scope.row.createdAt) }}
        </template>
      </el-table-column>

      <el-table-column prop="reviewedAt" label="审核时间" min-width=210 sortable>
        <template #default="scope">
          {{ formatDateTime(scope.row.reviewedAt) }}
        </template>
      </el-table-column>

      <el-table-column prop="reviewComments" label="审核意见" min-width=200 show-overflow-tooltip />

      <el-table-column label="操作" width=120 fixed="right" align="center">
        <el-button link type="primary" size="huge" @click="viewApplicationDetails(scope.row)">
          查看详情
        </el-button>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="申请详情" width="60%" top="5vh">
      <div v-if="selectedApplication" class="dialog-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请ID" label-class-name="desc-label">{{ selectedApplication.id
          }}</el-descriptions-item>
          <el-descriptions-item label="所属店铺" label-class-name="desc-label">{{
            getStoreName(selectedApplication.storeId)
          }}</el-descriptions-item>
          <el-descriptions-item label="申请类型" label-class-name="desc-label">
            <el-tag :type="getApplicationTypeTag(selectedApplication.applicationType)">
              {{ formatApplicationType(selectedApplication.applicationType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态" label-class-name="desc-label">
            <el-tag :type="getStatusTagType(selectedApplication.status)">
              {{ formatStatus(selectedApplication.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间" label-class-name="desc-label">{{
            formatDateTime(selectedApplication.createdAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="审核时间" label-class-name="desc-label">{{
            formatDateTime(selectedApplication.reviewedAt)
          }}</el-descriptions-item>
          <el-descriptions-item label="审核意见" :span="2" label-class-name="desc-label">{{
            selectedApplication.reviewComments
            || '无' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">申请的商品信息</el-divider>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="商品名称" label-class-name="desc-label">{{
            getProductName(selectedApplication.requestedData) }}</el-descriptions-item>
          <el-descriptions-item label="商品描述" :span="1" label-class-name="desc-label">{{
            getProductDescription(selectedApplication.requestedData) }}</el-descriptions-item>
          <el-descriptions-item label="商品价格" label-class-name="desc-label">{{
            getProductPrice(selectedApplication.requestedData) }} 元</el-descriptions-item>
          <el-descriptions-item label="图片URL" label-class-name="desc-label">
            <el-image v-if="getProductImageUrl(selectedApplication.requestedData)"
              style="width: 100px; height: 100px; border-radius: 4px;"
              :src="getProductImageUrl(selectedApplication.requestedData)"
              :preview-src-list="[getProductImageUrl(selectedApplication.requestedData)]" :initial-index="0" fit="cover"
              loading="lazy" hide-on-click-modal />
            <span v-else>无图片</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-empty v-if="!isLoading && (!filteredApplications || filteredApplications.length === 0)" description="暂无相关申请记录"
      class="empty-state" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useProductStore } from '@/stores/products';
import { useAuthStore } from '@/stores/auth';
import { useStoreStore } from '@/stores/stores';
// 区分类型导入和值导入
import type {
    ProductApplication,
    CreateProductDTO,
    ReviewApplicationDTO,
} from '@/types/product';
import {
    ProductApplicationType, // 值导入 (枚举)
    ProductApplicationStatus // 值导入 (枚举)
} from '@/types/product';
import {
  ElTable, ElTableColumn, ElTag, ElButton, ElCard, ElDialog, ElForm, ElFormItem, ElSelect, ElOption,
  ElDescriptions, ElDescriptionsItem, ElImage, ElEmpty, ElDivider, ElMessage // 确保 ElMessage 已导入
} from 'element-plus';
import { Refresh, Search, RefreshLeft } from '@element-plus/icons-vue';
import BaseButton from '@/components/BaseButton.vue';

const productStore = useProductStore();
const storeStore = useStoreStore();
const authStore = useAuthStore();

type TagType = 'success' | 'warning' | 'info' | 'primary' | 'danger';

const filters = reactive({
  storeId: null as number | null,
  applicationType: null as ProductApplicationType | null, // 使用枚举类型
  status: null as ProductApplicationStatus | null,      // 使用枚举类型
});

const isLoading = computed(() => productStore.loading || storeStore.loading);
const applications = computed(() => productStore.productApplications);
const availableStores = computed(() => storeStore.stores);

const applicationTypeOptions = ref([
  { value: ProductApplicationType.NEW, label: '新品上架' },
  { value: ProductApplicationType.MODIFY, label: '信息修改' },
]);

const statusOptions = ref([
  { value: ProductApplicationStatus.PENDING, label: '待审核' },
  { value: ProductApplicationStatus.APPROVED, label: '审核通过' },
  { value: ProductApplicationStatus.REJECTED, label: '审核失败' },
]);

const filteredApplications = computed(() => {
  // 打印初始状态
  const appsToFilter = applications.value;
  if (!appsToFilter || !Array.isArray(appsToFilter)) return [];

  // 创建副本以进行操作
  let filtered = [...appsToFilter];

  // 1. Store ID Filter
  if (filters.storeId !== null && filters.storeId !== undefined) { // 明确检查 null 和 undefined
    filtered = filtered.filter(app => Number(app.storeId) === Number(filters.storeId));
  }

  // 2. Application Type Filter
  // 只有当 filters.applicationType 是一个有效的、非空字符串时才应用
  if (typeof filters.applicationType === 'string' && filters.applicationType.trim() !== '') {
    const typeToFilter = filters.applicationType.toUpperCase();
    filtered = filtered.filter(app => app.applicationType?.toUpperCase() === typeToFilter);
  }

  // 3. Status Filter
  // 只有当 filters.status 是一个有效的、非空字符串时才应用
  if (typeof filters.status === 'string' && filters.status.trim() !== '') {
    const statusToFilter = filters.status.toUpperCase();
    filtered = filtered.filter(app => app.status?.toUpperCase() === statusToFilter);
  }

  return filtered;
});

const applyFilters = () => {
  // 这个函数主要用于当你有“手动查询”按钮时。
  // 由于 filteredApplications 是计算属性，它会在 filters 变化时自动重新计算。
  // 所以这个函数体可以为空，或者你可以在这里做一些额外的操作，比如记录日志。
  console.log("Applying filters with current values:", JSON.parse(JSON.stringify(filters)));
  // 如果你的表格不是直接绑定到 filteredApplications，或者你想强制刷新什么，可以在这里做。
  // 但通常对于计算属性，不需要手动调用“应用”。
};

const resetFilters = () => {
  filters.storeId = null;
  filters.applicationType = null;
  filters.status = null;
  console.log("Filters have been reset.");
  // 同样，计算属性会自动响应 filters 的变化。
};

// --- 详情弹窗相关的 State 和 Action ---
const dialogVisible = ref(false);
const selectedApplication = ref<ProductApplication | null>(null);

const viewApplicationDetails = (application: ProductApplication) => {
  console.log('[ViewDetails] "查看详情" clicked for application ID:', application?.id); // 添加日志
  if (application) {
    selectedApplication.value = application; // 把当前行的数据赋给 selectedApplication
    dialogVisible.value = true;             // 设置 dialogVisible 为 true 来显示弹窗
    console.log('[ViewDetails] selectedApplication set. dialogVisible is now:', dialogVisible.value); // 确认状态改变
  } else {
    console.error('[ViewDetails] Attempted to view details for a null/undefined application.');
    // ElMessage.error('无法查看详情：申请数据无效。'); // 确保 ElMessage 已导入
  }
};

// 确保 getStoreName 总有返回值
const getStoreName = (storeIdInput: number | string | undefined): string => {
  if (storeIdInput === undefined || storeIdInput === null) {
    return '未知店铺';
  }
  const storeId = Number(storeIdInput);
  if (isNaN(storeId)) {
    return '无效店铺ID';
  }
  const store = availableStores.value.find(s => s.id === storeId);
  return store ? store.storeName : `店铺ID: ${storeId}`;
};

// 确保 parseRequestedData 总有返回值
const parseRequestedData = (jsonData: string | undefined | null): Partial<CreateProductDTO> => {
  if (!jsonData || typeof jsonData !== 'string' || jsonData.trim() === '') {
    // console.warn('parseRequestedData received invalid jsonData input:', jsonData);
    return {};
  }
  try {
    return JSON.parse(jsonData) as Partial<CreateProductDTO>;
  } catch (e) {
    console.error('Failed to parse requestedData JSON string:', e, "Raw data string:", jsonData);
    return {};
  }
};

const getProductName = (jsonData: string) => parseRequestedData(jsonData).name || 'N/A';
const getProductDescription = (jsonData: string) => parseRequestedData(jsonData).description || 'N/A';
const getProductPrice = (jsonData: string) => {
  const price = parseRequestedData(jsonData).price;
  return typeof price === 'number' ? price.toFixed(2) : 'N/A';
};

// --- 修改：确保 getProductImageUrl 返回 string | undefined ---
const getProductImageUrl = (jsonData: string | undefined | null): string | undefined => {
    const data = parseRequestedData(jsonData); // jsonData type changed to allow undefined/null
    return data.imageUrl; // imageUrl from CreateProductDTO is string, so this is string | undefined
};
// --- 修改结束 ---

const formatDateTime = (dateTimeString?: string | null): string => {
  if (!dateTimeString) return 'N/A';
  try {
    // 确保toLocaleString有第二个参数以避免潜在的默认格式问题
    return new Date(dateTimeString).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch (e) {
    console.warn("Failed to format date string:", dateTimeString, e);
    return dateTimeString; // 返回原始字符串如果解析失败
  }
};

const formatStatus = (statusInput?: string | null): string => {
  if (!statusInput || String(statusInput).trim() === '') {
    return '状态未知';
  }
  const status = String(statusInput).toUpperCase();
  switch (status) {
    case ProductApplicationStatus.PENDING: return '待审核';
    case ProductApplicationStatus.APPROVED: return '审核通过';
    case ProductApplicationStatus.REJECTED: return '审核失败';
    default: return statusInput;
  }
};

const getStatusTagType = (statusInput?: string | null): TagType => {
  if (!statusInput || String(statusInput).trim() === '') {
    return 'info';
  }
  const status = String(statusInput).toUpperCase();
  switch (status) {
    case ProductApplicationStatus.PENDING: return 'warning';
    case ProductApplicationStatus.APPROVED: return 'success';
    case ProductApplicationStatus.REJECTED: return 'danger';
    default: return 'info';
  }
};

const formatApplicationType = (typeInput?: string | null): string => {
  if (!typeInput || String(typeInput).trim() === '') {
    return '类型未知';
  }
  const type = String(typeInput).toUpperCase();
  switch (type) {
    case ProductApplicationType.NEW: return '新品上架';
    case ProductApplicationType.MODIFY: return '信息修改';
    default: return typeInput;
  }
};

const getApplicationTypeTag = (typeInput?: string | null): TagType => {
  if (!typeInput || String(typeInput).trim() === '') {
    return 'info';
  }
  const type = String(typeInput).toUpperCase();
  switch (type) {
    case ProductApplicationType.NEW: return 'primary';
    case ProductApplicationType.MODIFY: return 'warning';
    default: return 'info';
  }
};

// --- Admin Review Logic ---
const handleReview = async (application: ProductApplication, newReviewStatus: ProductApplicationStatus.APPROVED | ProductApplicationStatus.REJECTED) => {
  const actionText = newReviewStatus === ProductApplicationStatus.APPROVED ? '通过' : '拒绝';

  try {
    const { value: comments } = await ElMessageBox.prompt( // 修改变量名以避免与外层作用域的 reviewComments 混淆
      `请输入审核意见（可选）后点击“确定”以${actionText}此申请 (ID: ${application.id})。`,
      `${actionText}申请确认`,
      {
        confirmButtonText: '确定执行',
        cancelButtonText: '取消',
        inputPlaceholder: '审核意见...',
        inputType: 'textarea',
        inputValue: application.reviewComments || '', // 预填入已有的审核意见
      }
    );

    const reviewData: ReviewApplicationDTO = {
      status: newReviewStatus, // 直接使用传入的 newReviewStatus，它的类型是匹配的
      reviewComments: comments || undefined, // 如果用户没输入，确保是undefined或空字符串
    };

    ElMessage({ type: 'info', message: `正在提交审核结果 (ID: ${application.id})...`, duration: 1500 });
    await productStore.processApplicationReview({
      applicationId: application.id,
      reviewData: reviewData,
    });

    ElMessage.success(`申请 (ID: ${application.id}) 已成功${actionText}！`);
    // 列表会自动更新，因为 processApplicationReview action 会修改 store 中的数据
    // 如果 store action 没有替换对象而是修改属性，且希望强制刷新，可以考虑:
    // loadApplications(); // 但通常 store 更新后 computed property 会自动重算

  } catch (error) {
    if (error === 'cancel' || String(error).toLowerCase().includes('cancel')) { // ElMessageBox 取消可能抛出 'cancel' 或 Error 对象
      ElMessage.info(`已取消${actionText}操作。`);
    } else {
      console.error(`审核申请 (ID: ${application.id}) 失败:`, error);
      // productStore.error 应该由 action 设置，这里可以直接显示
      ElMessage.error(productStore.error || `操作失败: ${ (error as Error)?.message || '未知错误' }`);
    }
  }
};

const loadApplications = async () => {
  console.log("[ProductApplicationList] Attempting to load applications...");
  if (storeStore.stores.length === 0 && !storeStore.loading) {
    try {
      await storeStore.fetchStores();
    } catch (error) {
      console.error("Failed to fetch stores for name resolution:", error);
      ElMessage.error("加载店铺列表失败，店铺名称可能无法正确显示。");
    }
  }
  await productStore.fetchProductApplications();
};

const tableRowClassName = ({ row }: { row: ProductApplication }) => {
  return 'application-row'; // 可根据需求动态设置行样式
};

const handleRowClick = (row: ProductApplication) => {
  viewApplicationDetails(row);
};

onMounted(() => {
  console.log("[ProductApplicationList] Component mounted. Current user role admin:", authStore.isAdmin);
  loadApplications();
});

</script>

<style scoped>
.product-application-list-container {
  background: white;
  border-radius: 1vh;
  padding: 2vh 2vw;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  width: 72vw;
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: inherit;
  border-radius: 4px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
  /* Adjust spacing for inline form */
  margin-right: 10px;
}

.application-table {
  margin-top: 10px;
}

.dialog-content .el-descriptions {
  margin-top: 10px;
}

.dialog-content :deep(.desc-label) {
  font-weight: bold;
  min-width: 100px;
  text-align: right;
  background-color: #f9fafc;
  /* Light background for labels */
}

.el-tag {
  width: 9vh;
  height: 3.8vh;
  font-size: 2vh;
}

.el-button {
  font-size: 2vh;
  font-family: inherit;
}

:deep(.el-select__wrapper) {
  width: 15vw;
  height: 5vh;
  border-radius: 1vh;
}

:deep(.el-select__selection) {
  font-size: 1.9vh;
}

.el-select {
  margin-right: 9vw;
}
</style>