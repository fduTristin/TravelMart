export interface User {
  userId: number
  userName: string
  userRole: string
  userEmail: string
  userTel: string
  userBio?: string
}

export interface UpdateUserForm {
  userName: string |  null
  userEmail: string | null
  userTel: string | null
}

