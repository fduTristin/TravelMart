import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productService } from '@/services/productService'
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductApplication,
  ReviewApplicationDTO
} from '@/types/product'

export const useProductStore = defineStore('product', () => {
  // --- 状态 (State) ---
  const products = ref<Product[]>([]) // 当前店铺的商品列表 (已上架或按状态筛选)
  const productApplications = ref<ProductApplication[]>([]) // 商品申请记录列表
  const currentProduct = ref<Product | null>(null) // 当前查看/编辑的单个商品详情
  const currentApplication = ref<ProductApplication | null>(null) // 当前查看的单个申请详情

  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- 操作 (Actions) ---

  /**
   * 获取指定店铺的商品列表
   * @param storeId - 店铺ID
   */
  async function fetchStoreProducts(storeId: number): Promise<Product[]> {
    loading.value = true;
    error.value = null;
    try {
      // productService.getStoreProducts 现在直接返回 Product[] 或在出错时抛出
      const productsArray = await productService.getStoreProducts(storeId);

      console.log(`[StoreAction] Fetched products for store ${storeId} from service:`, JSON.parse(JSON.stringify(productsArray)));

      // productsArray 已经是 Product[] 了 (或者在 service 中处理错误后返回的空数组)
      return productsArray;
    } catch (err: any) {
      error.value = err.message || `获取店铺 ${storeId} 商品列表失败`;
      console.error(`[StoreAction] Error fetching products for store ${storeId}:`, err);
      // 确保如果上游 service 抛错了，这里也要处理或再次抛出
      // 如果 service 在其 catch 中返回了 [], 这里的 catch 可能不会执行，除非 service re-throw
      // 如果 service re-throw，这里可以选择返回 [] 或再次 re-throw
      // 为了让组件知道出错了，最好是让错误能传播到组件的 catch，或者在这里返回一个明确的错误指示
      // 但如果 service 保证出错时返回 []，这里可以直接返回 []，但 error.value 应该被设置
      // 当前假设 service 会 throw error
      throw err; // 如果 service re-throws, this re-throws to the component
      // 或者 return []; 如果你希望 action 层面消化错误并返回空列表
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取单个商品详情
   * @param productId - 商品ID
   */
  async function fetchProductById(productId: number): Promise<Product | null> { // <--- 1. 明确返回类型
    loading.value = true;
    error.value = null;
    // currentProduct.value = null; // 可以选择在开始时清除，或只在出错时清除

    try {
      const productData = await productService.getProductById(productId); // service 层应返回 Product 或抛错
      if (productData) { // 确保 productData 不是 undefined/null (虽然 service 层应该保证)
        currentProduct.value = productData; // 可选：更新 store 内的 currentProduct
        console.log(`[StoreAction] Fetched product by ID ${productId}:`, JSON.parse(JSON.stringify(productData)));
        return productData; // <--- 2. 成功时返回 Product 对象
      } else {
        // 如果 productService.getProductById 可能返回 null/undefined 而不抛错
        console.warn(`[StoreAction] productService.getProductById returned no data for ID ${productId}`);
        currentProduct.value = null;
        return null; // <--- 明确返回 null
      }
    } catch (err: any) {
      error.value = err.message || `获取商品详情 (ID: ${productId}) 失败`;
      console.error(`[StoreAction] Error fetching product by ID ${productId}:`, err);
      currentProduct.value = null;
      // 选择A：向上抛出错误，让组件的 catch 处理
      // throw err;
      // 选择B：不向上抛出，但返回 null，组件需要检查返回值是否为 null
      return null; // <--- 2. 失败时返回 null (或者你可以选择 throw err;)
    } finally {
      loading.value = false;
    }
  }

  /**
   * 申请上架新商品
   * @param data - 商品上架申请数据
   */
  async function applyForNewProduct(data: CreateProductDTO) {
    loading.value = true
    error.value = null
    try {
      const newApplication = await productService.createProductApplication(data)
      // 成功提交申请后，可以将新的申请添加到 productApplications 列表的开头
      productApplications.value.unshift(newApplication)
      // 或者，如果希望总是从服务器获取最新列表，则调用 fetchProductApplications()
      // await fetchProductApplications(); // 取决于你的刷新策略
      return newApplication // 返回创建的申请记录，方便组件处理
    } catch (err: any) {
      error.value = err.message || '商品上架申请失败'
      console.error('Error applying for new product:', err)
      throw err // 抛出错误，让组件可以捕获并处理
    } finally {
      loading.value = false
    }
  }

  /**
   * 商户提交商品信息修改申请
   * @param productId - 被修改的商品的ID
   * @param data - 包含新商品信息的 UpdateProductDTO
   * @returns 创建的商品修改申请记录
   */
  async function applyForProductModification(productId: number, data: UpdateProductDTO): Promise<ProductApplication | null> {
    loading.value = true;
    error.value = null;
    try {
      // productService.updateProductApplication 应该调用 PUT /product-applications/{productId}
      // 并返回后端创建的新的 ProductApplication 对象
      const newModificationApplication = await productService.updateProductApplication(productId, data);

      if (newModificationApplication) {
        // 将新创建的修改申请记录添加到 productApplications 列表的开头
        // 这样用户在跳转到申请列表后可以立即看到它
        productApplications.value.unshift(newModificationApplication);
        console.log('[StoreAction] New product modification application added to list:', newModificationApplication);
        return newModificationApplication;
      } else {
        // 如果 service 层因为某些原因返回了 null/undefined (例如API返回了非预期结构)
        console.error('[StoreAction] productService.updateProductApplication did not return a valid application object.');
        error.value = '提交修改申请后未能获取到有效的申请记录。';
        return null;
      }

    } catch (err: any) {
      error.value = err.message || `提交商品 (ID: ${productId}) 修改申请失败`;
      console.error(`[StoreAction] Error applying for product modification (Product ID: ${productId}):`, err);
      throw err; // 重新抛出错误，让组件可以感知
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取商品申请记录列表 (当前商户或全部，取决于API权限和参数)
   */
  async function fetchProductApplications() {
    loading.value = true
    error.value = null
    try {
      productApplications.value = await productService.getProductApplications()
    } catch (err: any) {
      error.value = err.message || '获取商品申请记录失败'
      console.error('Error fetching product applications:', err)
      productApplications.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * 商户下架商品
   * @param productId - 要下架的商品ID
   */
  async function takeProductOffShelf(productId: number) {
    loading.value = true
    error.value = null
    try {
      await productService.offShelfProduct(productId)
      // 下架成功后，更新本地 products 列表中的商品状态或直接移除
      // 方案1: 修改状态 (如果商品仍在列表中，只是状态改变)
      const productIndex = products.value.findIndex(p => p.id === productId)
      if (productIndex !== -1) {
        products.value[productIndex].status = 'OFF_SHELF' // 使用 ProductStatus.OFF_SHELF 更佳
        // 或者直接从列表中移除该商品，如果UI上不再显示已下架商品
        // products.value.splice(productIndex, 1);
      }
      // 方案2: 重新获取当前店铺的商品列表 (保证数据最新)
      // if (currentStoreId) await fetchStoreProducts(currentStoreId);
      // 这个 currentStoreId 需要有地方存储和获取
      // 具体策略取决于你的需求，是立即更新UI还是等待下次刷新
    } catch (err: any) {
      error.value = err.message || '商品下架失败'
      console.error('Error taking product off shelf:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 管理员审核商品申请
   * @param payload - 包含 applicationId 和 reviewData (status, reviewComments)
   */
  async function processApplicationReview(payload: { applicationId: number; reviewData: ReviewApplicationDTO }) {
    loading.value = true;
    error.value = null;
    try {
      const updatedApplication = await productService.reviewProductApplication(payload.applicationId, payload.reviewData);

      // 更新本地 productApplications 列表中的对应申请记录
      const index = productApplications.value.findIndex(app => app.id === payload.applicationId);
      if (index !== -1) {
        productApplications.value[index] = updatedApplication;
      } else {
        // 如果列表中没有找到 (不太可能，除非列表在审核期间被外部清空或未加载)
        // 可以考虑将更新后的申请添加到列表顶部或重新获取整个列表
        // productApplications.value.unshift(updatedApplication);
        // 或者更稳妥地重新获取，但会增加一次API调用：
        // await fetchProductApplications();
        console.warn(`Application with ID ${payload.applicationId} not found in local list after review. It was updated on server.`);
      }
      // 如果审核通过并且是NEW类型，商家的商品列表 (products ref) 也应该最终得到更新。
      // 这个更新可能通过用户下次访问商家商品页时调用 fetchStoreProducts() 来实现，
      // 或者如果审核API返回了足够的信息，我们可以在这里做更智能的更新。
      // Admin.md 描述了后端会在批准NEW申请时创建products记录。

      return updatedApplication; // 返回更新后的申请，方便组件处理
    } catch (err: any) {
      error.value = err.message || '审核申请失败';
      console.error('Error processing application review:', err);
      throw err; // 抛出错误，让组件可以捕获并处理
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取单个申请的详细信息 (如果管理员审核前需要查看比列表更详细的信息)
   * @param applicationId - 申请ID
   */
  async function fetchApplicationDetails(applicationId: number) {
    loading.value = true;
    error.value = null;
    try {
      currentApplication.value = await productService.getProductApplicationDetails(applicationId);
    } catch (err: any) {
      error.value = err.message || '获取申请详情失败';
      console.error('Error fetching application details:', err);
      currentApplication.value = null;
    } finally {
      loading.value = false;
    }
  }

  return {
    // State
    products,
    productApplications,
    currentProduct,
    currentApplication,
    loading,
    error,
    // Actions
    fetchStoreProducts,
    fetchProductById,
    applyForNewProduct,
    applyForProductModification,
    fetchProductApplications,
    takeProductOffShelf,
    processApplicationReview,
    fetchApplicationDetails,
  }
})