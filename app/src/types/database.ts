export type DeviceStatus = 'online' | 'offline'
export type ReportStatus = 'open' | 'in_progress' | 'resolved'
export type ReportType = 'manual' | 'auto'
export type UserRole = 'user' | 'admin'

export interface Device {
  id: string
  name: string
  location: string
  status: DeviceStatus
  created_at: string
}

export interface Measurement {
  id: string
  device_id: string
  avg_value: number
  room: string
  created_at: string
  min_value: number
  max_value: number
  devices?: Device
}

export interface Report {
  id: string
  status: ReportStatus
  type: ReportType
  text: string | null
  location: string | null
  room: string | null
  date: string
  created_by: string | null
  created_at: string
  measurement_id: string | null
  user_id: string | null
  users?: User
  measurements?: Measurement
}

export interface User {
  id: string
  name: string
  email: string | null
  role: UserRole
  created_at: string
  password: string
}

export interface DashboardStats {
  totalMeasurements: number
  activeAlerts: number
  totalReports: number
  averageNoiseLevel: number
}

export interface RecentAlert extends Measurement {
  devices?: Device
}

export interface ReportWithUser extends Report {
  users?: User
}
