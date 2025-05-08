<template>
  <div class="product-application-list-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span>商品上架/修改申请记录</span>
          <el-button type="primary" icon="Refresh" @click="loadApplications" :loading="isLoading">
            刷新列表
          </el-button>
        </div>
      </template>

      <el-table :data="filteredApplications" v-loading="isLoading" stripe style="width: 100%">
        <el-table-column prop="id" label="申请ID" width="100" />

        <el-table-column label="商品名称" width="180">
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

        <el-table-column label="申请价格" width="120">
          <template #default="scope">
            {{ getProductPrice(scope.row.requestedData) }} 元
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="申请时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="reviewedAt" label="审核时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.reviewedAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="reviewComments" label="审核意见" min-width="200" show-overflow-tooltip />

        <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
                <el-button link type="primary" size="small" @click="viewApplicationDetails(scope.row)">
                    查看详情
                </el-button>
            </template>
        </el-table-column>
      </el-table>

      <el-dialog v-model="dialogVisible" title="申请详情" width="60%">
        <div v-if="selectedApplication">
          <p><strong>申请ID:</strong> {{ selectedApplication.id }}</p>
          <p><strong>申请类型:</strong> {{ formatApplicationType(selectedApplication.applicationType) }}</p>
          <p><strong>状态:</strong> {{ formatStatus(selectedApplication.status) }}</p>
          <p><strong>申请时间:</strong> {{ formatDateTime(selectedApplication.createdAt) }}</p>
          <p><strong>审核时间:</strong> {{ formatDateTime(selectedApplication.reviewedAt) }}</p>
          <p><strong>审核意见:</strong> {{ selectedApplication.reviewComments || '无' }}</p>
          <el-descriptions title="申请的商品信息" :column="1" border style="margin-top: 20px;">
            <el-descriptions-item label="商品名称">{{ getProductName(selectedApplication.requestedData) }}</el-descriptions-item>
            <el-descriptions-item label="商品描述">{{ getProductDescription(selectedApplication.requestedData) }}</el-descriptions-item>
            <el-descriptions-item label="商品价格">{{ getProductPrice(selectedApplication.requestedData) }} 元</el-descriptions-item>
            <el-descriptions-item label="图片URL">
                <el-image
                    v-if="getProductImageUrl(selectedApplication.requestedData)"
                    style="width: 100px; height: 100px"
                    :src="getProductImageUrl(selectedApplication.requestedData)"
                    :preview-src-list="[getProductImageUrl(selectedApplication.requestedData)]"
                    fit="cover"
                />
                <span v-else>无图片</span>
            </el-descriptions-item>
          </el-descriptions>
          </div>
        <template #footer>
          <el-button @click="dialogVisible = false">关闭</el-button>
        </template>
      </el-dialog>

      <el-empty v-if="!isLoading && filteredApplications.length === 0" description="暂无相关申请记录" />

    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useProductStore } from '@/stores/products';
import { useAuthStore } from '@/stores/auth';
import type { ProductApplication, CreateProductDTO } from '@/types/product'; // CreateProductDTO for parsing requestedData
import { ElTable, ElTableColumn, ElTag, ElButton, ElCard, ElDialog, ElDescriptions, ElDescriptionsItem, ElImage, ElEmpty } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue'; // For refresh button icon
import { useRoute } from 'vue-router';

const productStore = useProductStore();
const authStore = useAuthStore();
const route = useRoute();

const isLoading = computed(() => productStore.loading);
const applications = computed(() => productStore.productApplications);

const storeIdFromRoute = ref<number | null>(null);

// --- Filtering Logic (Placeholder - adapt based on API behavior) ---
// If the API returns all applications, and we need to filter for a specific store for a merchant
const filteredApplications = computed(() => {
  if (authStore.isMerchant && storeIdFromRoute.value) {
    // Assuming requestedData contains storeId, or there's another way to link application to store for merchant
    return applications.value.filter(app => {
      try {
        const data = JSON.parse(app.requestedData) as Partial<CreateProductDTO & { storeId: number }>;
        return data.storeId === storeIdFromRoute.value;
      } catch (e) {
        return false; // Or handle applications that don't have storeId in requestedData if they are global
      }
    });
  }
  // For Admin, or if no storeId filter is needed, show all (or backend handles filtering)
  return applications.value;
});


// Dialog for viewing details
const dialogVisible = ref(false);
const selectedApplication = ref<ProductApplication | null>(null);

const viewApplicationDetails = (application: ProductApplication) => {
  selectedApplication.value = application;
  dialogVisible.value = true;
};

// Helper to parse requestedData JSON
const parseRequestedData = (jsonData: string): Partial<CreateProductDTO> => {
  try {
    return JSON.parse(jsonData) as Partial<CreateProductDTO>;
  } catch (e) {
    console.error('Failed to parse requestedData:', e);
    return {};
  }
};

const getProductName = (jsonData: string) => parseRequestedData(jsonData).name || 'N/A';
const getProductDescription = (jsonData: string) => parseRequestedData(jsonData).description || 'N/A';
const getProductPrice = (jsonData: string) => parseRequestedData(jsonData).price?.toFixed(2) || 'N/A';
const getProductImageUrl = (jsonData: string) => parseRequestedData(jsonData).imageUrl || '';


// Formatting helpers
const formatDateTime = (dateTimeString?: string | null) => {
  if (!dateTimeString) return 'N/A';
  try {
    return new Date(dateTimeString).toLocaleString();
  } catch (e) {
    return dateTimeString; // return original if parsing fails
  }
};

const formatStatus = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING': return '待审核';
    case 'APPROVED': return '审核通过';
    case 'REJECTED': return '审核失败';
    default: return status || '未知';
  }
};

const getStatusTagType = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    default: return 'info';
  }
};

const formatApplicationType = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'NEW': return '新品上架';
    case 'MODIFY': return '信息修改';
    default: return type || '未知类型';
  }
};
const getApplicationTypeTag = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'NEW': return 'primary';
    case 'MODIFY': return 'warning'; // Or another color
    default: return 'info';
  }
};

const loadApplications = async () => {
  // If storeIdFromRoute is needed for fetching specific applications, pass it to the action.
  // For now, fetchProductApplications doesn't take params.
  await productStore.fetchProductApplications();
};

onMounted(() => {
  const storeIdParam = route.params.storeId; // Assuming path like /stores/:storeId/product-applications
  if (storeIdParam) {
    const parsedId = Array.isArray(storeIdParam) ? Number(storeIdParam[0]) : Number(storeIdParam);
    if (!isNaN(parsedId) && parsedId > 0) {
      storeIdFromRoute.value = parsedId;
    }
  }
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
</style>