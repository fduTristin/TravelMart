import { api } from './api'
import { useAuthStore } from '@/stores/auth' // 用于获取 token
import type {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductApplication,
  ReviewApplicationDTO
} from '@/types/product'
import type { AxiosResponse } from 'axios';

export const productService = {
  /**
   * 商户申请上架一款新商品
   * POST /product-applications
   * @param data - 商品上架申请数据
   * @returns 创建的商品申请记录
   */
  async createProductApplication(data: CreateProductDTO): Promise<ProductApplication> {
    const authStore = useAuthStore()
    const response = await api.post<ProductApplication>('/product-applications', data, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    return response.data
  },

  /**
   * 查看所有上架申请 (商户可能看自己的，admin可能看所有的)
   * GET /product-applications
   * @returns 商品申请记录列表
   */
  async getProductApplications(): Promise<ProductApplication[]> {
    const authStore = useAuthStore()
    // API 文档中 GET /product-applications 的响应是 {}
    // 这对于列表接口不合理，这里假设返回 ProductApplication 数组
    // 需要根据后端实际返回进行调整
    const response = await api.get<ProductApplication[]>('/product-applications', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    return response.data
  },

  /**
   * 商户提交对现有商品的修改申请
   * PUT /product-applications/{productId}
   * @param productId - 要修改的商品的 ID (注意：API路径用productId，但更像是applicationId，需确认)
   * @param data - 商品修改数据
   * @returns 更新后的商品申请记录
   */
  async updateProductApplication(productId: number, data: UpdateProductDTO): Promise<ProductApplication> {
    const authStore = useAuthStore()
    const response = await api.put<ProductApplication>(`/product-applications/${productId}`, data, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    return response.data
  },

  /**
   * 商户下架已上架的商品
   * DELETE /product-applications/{productId}
   * 注意：API 路径是 /product-applications/{productId}，描述是下架商品。
   * 这可能意味着删除一个“上架申请”记录来间接实现下架，或者API命名与实际操作对象不完全匹配。
   * 如果是改变商品状态为 "OFF_SHELF"，可能需要不同的API。目前按照文档的DELETE操作。
   * @param productId - 要下架的商品的 ID
   */
  async offShelfProduct(productId: number): Promise<void> {
    const authStore = useAuthStore()
    await api.delete(`/product-applications/${productId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    // DELETE 请求通常返回 204 No Content，所以 Promise<void>
  },

  /**
   * 查找指定商铺ID下的所有商品
   * GET /stores/{storeId}/products
   * @param storeId - 店铺ID
   * @returns 该店铺的商品列表
   */
  async getStoreProducts(storeId: number): Promise<Product[]> { // <--- 明确返回 Product[]
    const authStore = useAuthStore();
    try {
      const response: AxiosResponse<Product[]> = await api.get(`/stores/${storeId}/products`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      });
      // 检查响应数据是否是数组，如果是，则返回它，否则返回空数组或抛出错误
      if (response && Array.isArray(response.data)) {
        return response.data;
      } else {
        console.error(`Invalid product data structure for store ${storeId}:`, response);
        return []; // 或者 throw new Error('Invalid product data');
      }
    } catch (error) {
      console.error(`Error fetching products for store ${storeId} in service:`, error);
      throw error; // 将错误向上抛出，让 store action 处理
    }
  },

  /**
   * 根据商品ID获取单个商品详情
   * GET /products/{productId}
   * @param productId - 商品ID
   * @returns 商品详情
   */
  async getProductById(productId: number): Promise<Product> {
    const authStore = useAuthStore() // 假设此接口也需要认证
    const response = await api.get<Product>(`/products/${productId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    return response.data
  },

  async reviewProductApplication(applicationId: number, data: ReviewApplicationDTO): Promise<ProductApplication> {
    const authStore = useAuthStore();
    const response = await api.patch<ProductApplication>(`/product-applications/${applicationId}`, data, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    });
    return response.data;
  },

  async getProductApplicationDetails(applicationId: number): Promise<ProductApplication> {
    const authStore = useAuthStore();
    const response = await api.get<ProductApplication>(`/product-applications/${applicationId}`, {
        headers: {
            Authorization: `Bearer ${authStore.token}`
        }
    });
    return response.data;
  }
}