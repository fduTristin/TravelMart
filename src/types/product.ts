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

/**
 * 商品上架/修改申请记录的类型
 */
export interface ProductApplication {
  id: number; // 申请记录的ID
  store?: { // 关联的店铺信息 (可选, 例如在修改申请中可能包含)
    id: number;
    name: string;
  };
  product?: { // 关联的商品信息 (可选, 例如在修改申请中可能指原商品)
    id: number;
    name: string;
  };
  applicationType: ProductApplicationType | string; // 申请类型 (例如 "NEW", "MODIFY")
  requestedData: string; // 请求的数据 (JSON字符串形式的商品信息)
  status: ProductApplicationStatus | string; // 申请状态 (例如 "PENDING", "APPROVED", "REJECTED")
  reviewer?: any; // 审核人信息 (可选)
  reviewComments?: string | null; // 审核意见 (可选)
  createdAt?: string; // 申请创建时间 (ISO 格式字符串)
  updatedAt?: string; // 申请更新时间 (ISO 格式字符串, 可能在审核后更新)
  reviewedAt?: string | null; // 审核时间 (ISO 格式字符串, 可能为 null)
}