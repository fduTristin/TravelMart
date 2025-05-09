/**
 * 商品状态枚举
 */
export enum ProductStatus {
  ON_SHELF = 'ON_SHELF', // 已上架
  PENDING_APPROVAL = 'PENDING_APPROVAL', // 待审核 (通常用于新的上架申请或修改申请)
  OFF_SHELF = 'OFF_SHELF', // 已下架
  APPROVAL_FAILED = 'APPROVAL_FAILED', // 审核失败
}

/**
 * 商品基本信息接口
 */
export interface Product {
  id: number; // 商品ID
  storeId: number; // 所属店铺ID
  name: string; // 商品名称
  description: string; // 商品描述
  price: number; // 商品价格 (单位：元, RMB)
  imageUrl: string; // 商品图片URL
  status: ProductStatus | string; // 商品状态 (允许字符串以兼容后端可能返回的其他状态)
  createdAt?: string; // 创建时间 (ISO 格式字符串)
  updatedAt?: string; // 更新时间 (ISO 格式字符串)
}

/**
 * 创建商品（上架申请）时的数据传输对象 (DTO)
 */
export interface CreateProductDTO {
  storeId: number;
  name: string;
  description: string; // 500字符以内
  price: number; // 大于0，精确到小数点后2位
  imageUrl: string;
}

/**
 * 修改商品信息时的数据传输对象 (DTO)
 */
export interface UpdateProductDTO {
  storeId: number; // API 文档中修改接口也要求此字段
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

/**
 * 商品申请类型枚举
 * 根据你的反馈，新增申请的类型是 "NEW"
 * 修改申请的类型，根据之前PUT接口的示例是 "MODIFY"
 */
export enum ProductApplicationType {
  NEW = 'NEW',
  MODIFY = 'MODIFY',
}

/**
 * 商品申请状态枚举
 */
export enum ProductApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// DTO for Admin reviewing an application
export interface ReviewApplicationDTO {
  status: ProductApplicationStatus.APPROVED | ProductApplicationStatus.REJECTED; // 只能是这两个值
  reviewComments?: string;
}

/**
 * 商品上架/修改申请记录的类型
 */
export interface ProductApplication {
  id: number;
  storeId?: number; // 可选，如果主要通过下面的 store 对象获取
  store?: { // 根据你的 PUT 响应示例
    id: number;
    name?: string; // 店铺名称可选
  };
  product?: { // 关联的原始商品信息
    id: number;
    name?: string;
  };
  applicationType: ProductApplicationType | string;
  requestedData: string; // JSON string of product details
  status: ProductApplicationStatus | string;
  reviewer?: { id: number; name?: string; }; // 假设 reviewer 是一个对象，包含 admin_id
  reviewComments?: string | null; // 对应 review_comments
  createdAt?: string;
  updatedAt?: string; // 申请记录本身更新的时间
  reviewedAt?: string | null;
  productId?: number | null; // 这个 productId 是指如果 NEW 类型申请通过后创建的 product 实体的 ID
                           // 对于 MODIFY 类型的申请，它可能指向被修改的那个 product.id
}