// 服务类型枚举
export enum ServiceType {
    HOTEL = '酒店',
    TRANSPORT = '交通',
    RESTAURANT = '餐饮',
    TICKET = '景区门票'
}

export interface Store {
    id: number
    storeName: string
    categories: string[]
    ownerIdNumber: string
    description: string
    registrationAddress: string
    registeredCapital: number
    registrationDate: string
    ownerId: number
    imageUrl?: string
    // isOpen?: boolean
    // rating?: number
}

// 创建店铺的DTO接口
export interface CreateStoreDTO {
    storeName: string
    categories: string[]
    ownerIdNumber: string
    description: string
    registrationAddress: string
    registeredCapital: number
    registrationDate: string
}