export interface User {
  userId: number
  userName: string
  userRole: string
  userEmail: string
  userTel: string
  // 添加方法以获取中文角色名称
  getUserRoleLabel(): string
}

// 添加一个映射函数
export const getUserRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    ADMIN: '系统管理员',
    CUSTOMER: '普通用户',
    MERCHANT: '商户'
  }
  return roleMap[role] || '未知角色'
}