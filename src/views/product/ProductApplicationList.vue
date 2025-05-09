<template>
  <div class="product-application-list-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>商品申请记录</span>
        </div>
      </template>

      <el-form :inline="true" :model="filters" class="filter-form" @submit.prevent>
        <el-form-item label="所属店铺">
          <el-select
            v-model="filters.storeId"
            placeholder="所有店铺"
            clearable
            filterable
            style="width: 200px;"
          >
            <el-option label="所有店铺" :value="null" /> <el-option
              v-for="store in availableStores"
              :key="store.id"
              :label="store.storeName"
              :value="store.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="申请类型">
          <el-select
            v-model="filters.applicationType"
            placeholder="所有类型"
            clearable
            style="width: 150px;"
          >
            <el-option label="所有类型" :value="null" />
            <el-option
              v-for="item in applicationTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="审核状态">
          <el-select
            v-model="filters.status"
            placeholder="所有状态"
            clearable
            style="width: 150px;"
          >
            <el-option label="所有状态" :value="null" />
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="applyFilters">查询</el-button>
          <el-button :icon="RefreshLeft" @click="resetFilters">重置</el-button>
        </el-form-item>
         <el-form-item style="float: right;">
             <el-button type="default" :icon="Refresh" @click="loadApplications" :loading="isLoading" circle title="刷新列表数据"/>
         </el-form-item>
      </el-form>

      <el-table :data="filteredApplications" v-loading="isLoading" stripe style="width: 100%" class="application-table">
        <el-table-column prop="id" label="申请ID" width="100" sortable />

        <el-table-column label="所属店铺" width="180" sortable :sort-by="(row: ProductApplication) => getStoreName(row.storeId)">
          <template #default="scope">
            {{ getStoreName(scope.row.storeId) }}
          </template>
        </el-table-column>

        <el-table-column label="商品名称" width="180" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ getProductName(scope.row.requestedData) }}
          </template>
        </el-table-column>

        <el-table-column prop="applicationType" label="申请类型" width="120">
          <template #default="scope">
            <el-tag :type="getApplicationTypeTag(scope.row.applicationType)">
              {{ formatApplicationType(scope.row.applicationType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="审核状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ formatStatus(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="申请价格" width="120" align="right">
          <template #default="scope">
            {{ getProductPrice(scope.row.requestedData) }} 元
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="申请时间" width="180" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="reviewedAt" label="审核时间" width="180" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.reviewedAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="reviewComments" label="审核意见" min-width="200" show-overflow-tooltip />

        <el-table-column label="操作" width="100" fixed="right" align="center">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="viewApplicationDetails(scope.row)">
                    查看详情
                </el-button>
            </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="dialogVisible" title="申请详情" width="60%" top="5vh">
        <div v-if="selectedApplication" class="dialog-content">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请ID" label-class-name="desc-label">{{ selectedApplication.id }}</el-descriptions-item>
            <el-descriptions-item label="所属店铺" label-class-name="desc-label">{{ getStoreName(selectedApplication.storeId) }}</el-descriptions-item>
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
            <el-descriptions-item label="申请时间" label-class-name="desc-label">{{ formatDateTime(selectedApplication.createdAt) }}</el-descriptions-item>
            <el-descriptions-item label="审核时间" label-class-name="desc-label">{{ formatDateTime(selectedApplication.reviewedAt) }}</el-descriptions-item>
            <el-descriptions-item label="审核意见" :span="2" label-class-name="desc-label">{{ selectedApplication.reviewComments || '无' }}</el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">申请的商品信息</el-divider>
          <el-descriptions :column="1" border >
            <el-descriptions-item label="商品名称" label-class-name="desc-label">{{ getProductName(selectedApplication.requestedData) }}</el-descriptions-item>
            <el-descriptions-item label="商品描述" :span="1" label-class-name="desc-label">{{ getProductDescription(selectedApplication.requestedData) }}</el-descriptions-item>
            <el-descriptions-item label="商品价格" label-class-name="desc-label">{{ getProductPrice(selectedApplication.requestedData) }} 元</el-descriptions-item>
            <el-descriptions-item label="图片URL" label-class-name="desc-label">
                <el-image
                    v-if="getProductImageUrl(selectedApplication.requestedData)"
                    style="width: 100px; height: 100px; border-radius: 4px;"
                    :src="getProductImageUrl(selectedApplication.requestedData)"
                    :preview-src-list="[getProductImageUrl(selectedApplication.requestedData)]"
                    :initial-index="0"
                    fit="cover"
                    loading="lazy"
                    hide-on-click-modal
                />
                <span v-else>无图片</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <template #footer>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <el-empty v-if="!isLoading && (!filteredApplications || filteredApplications.length === 0)" description="暂无相关申请记录" />

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue';
import { useProductStore } from '@/stores/products';
import { useStoreStore } from '@/stores/stores';
import type { ProductApplication, CreateProductDTO, ProductApplicationType as AppTypeEnum, ProductApplicationStatus as AppStatusEnum } from '@/types/product';
import {
    ElTable, ElTableColumn, ElTag, ElButton, ElCard, ElDialog, ElForm, ElFormItem, ElSelect, ElOption,
    ElDescriptions, ElDescriptionsItem, ElImage, ElEmpty, ElDivider, ElMessage // 确保 ElMessage 已导入
} from 'element-plus';
import { Refresh, Search, RefreshLeft } from '@element-plus/icons-vue';

const productStore = useProductStore();
const storeStore = useStoreStore();

// Define TagType alias for el-tag type prop
type TagType = 'success' | 'warning' | 'info' | 'primary' | 'danger';

const filters = reactive({
  storeId: null as number | null,
  applicationType: null as string | null,
  status: null as string | null,
});

const isLoading = computed(() => productStore.loading || storeStore.loading);
const applications = computed(() => productStore.productApplications);
const availableStores = computed(() => storeStore.stores);

const applicationTypeOptions = ref([
  { value: 'NEW' as AppTypeEnum, label: '新品上架' },
  { value: 'MODIFY' as AppTypeEnum, label: '信息修改' },
]);

const statusOptions = ref([
  { value: 'PENDING' as AppStatusEnum, label: '待审核' },
  { value: 'APPROVED' as AppStatusEnum, label: '审核通过' },
  { value: 'REJECTED' as AppStatusEnum, label: '审核失败' },
]);

const filteredApplications = computed(() => {
  let apps = applications.value;
  if (!apps) return [];

  if (filters.storeId !== null) {
    apps = apps.filter(app => Number(app.storeId) === Number(filters.storeId));
  }
  if (filters.applicationType !== null && filters.applicationType !== '') {
    apps = apps.filter(app => app.applicationType?.toUpperCase() === filters.applicationType?.toUpperCase());
  }
  if (filters.status !== null && filters.status !== '') {
    apps = apps.filter(app => app.status?.toUpperCase() === filters.status?.toUpperCase());
  }
  return apps;
});

const applyFilters = () => {
  console.log("Applying filters:", JSON.parse(JSON.stringify(filters)));
};

const resetFilters = () => {
  filters.storeId = null;
  filters.applicationType = null;
  filters.status = null;
};

const dialogVisible = ref(false);
const selectedApplication = ref<ProductApplication | null>(null);

const viewApplicationDetails = (application: ProductApplication) => {
  selectedApplication.value = application;
  dialogVisible.value = true;
};

const getStoreName = (storeIdInput: number | string | undefined): string => {
  if (storeIdInput === undefined || storeIdInput === null) return '未知店铺';
  const storeId = Number(storeIdInput);
  const store = availableStores.value.find(s => s.id === storeId);
  return store ? store.storeName : `店铺ID: ${storeId}`;
};

const parseRequestedData = (jsonData: string): Partial<CreateProductDTO> => {
  try {
    if (!jsonData) return {};
    return JSON.parse(jsonData) as Partial<CreateProductDTO>;
  } catch (e) {
    console.error('Failed to parse requestedData:', e, "Raw data:", jsonData);
    return {};
  }
};
const getProductName = (jsonData: string) => parseRequestedData(jsonData).name || 'N/A';
const getProductDescription = (jsonData: string) => parseRequestedData(jsonData).description || 'N/A';
const getProductPrice = (jsonData: string) => {
    const price = parseRequestedData(jsonData).price;
    return typeof price === 'number' ? price.toFixed(2) : 'N/A';
};
const getProductImageUrl = (jsonData: string) => parseRequestedData(jsonData).imageUrl || '';

const formatDateTime = (dateTimeString?: string | null) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch (e) { return dateTimeString; }
};

// --- MODIFIED FORMATTERS FOR TEXT AND TAG TYPES ---
const formatStatus = (statusInput?: string | null): string => {
  if (!statusInput || String(statusInput).trim() === '') {
    return '状态未知';
  }
  const status = String(statusInput).toUpperCase();
  switch (status) {
    case 'PENDING': return '待审核';
    case 'APPROVED': return '审核通过';
    case 'REJECTED': return '审核失败';
    default: return statusInput;
  }
};

const getStatusTagType = (statusInput?: string | null): TagType => {
  if (!statusInput || String(statusInput).trim() === '') {
    return 'info'; // Default type for unknown status
  }
  const status = String(statusInput).toUpperCase();
  switch (status) {
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    default: return 'info';
  }
};

const formatApplicationType = (typeInput?: string | null): string => {
  if (!typeInput || String(typeInput).trim() === '') {
    return '类型未知';
  }
  const type = String(typeInput).toUpperCase();
  switch (type) {
    case 'NEW': return '新品上架';
    case 'MODIFY': return '信息修改';
    default: return typeInput;
  }
};

const getApplicationTypeTag = (typeInput?: string | null): TagType => {
  if (!typeInput || String(typeInput).trim() === '') {
    return 'info'; // Default type for unknown type
  }
  const type = String(typeInput).toUpperCase();
  switch (type) {
    case 'NEW': return 'primary';
    case 'MODIFY': return 'warning';
    default: return 'info';
  }
};
// --- END OF MODIFIED FORMATTERS ---

const loadApplications = async () => {
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

onMounted(() => {
  loadApplications();
});

</script>

<style scoped>
.product-application-list-container {
  margin: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.filter-form {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}
.filter-form .el-form-item {
  margin-bottom: 0; /* Adjust spacing for inline form */
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
  background-color: #f9fafc; /* Light background for labels */
}
</style>