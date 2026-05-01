export interface PhoneRecord {
  phone: string
  last4: string
  status: "active" | "verified"
  createdAt: number
  verifiedAt: number | null
}

export interface VerifyResult {
  phone: string
  displayPhone: string
  last4: string
  status: "active" | "verified"
  createdAt: string
}

export interface StatsData {
  total: number
  active: number
  verified: number
}

export interface AppSettings {
  title: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
