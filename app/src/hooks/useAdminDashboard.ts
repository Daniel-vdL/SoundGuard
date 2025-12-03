import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import type { DashboardStats, RecentAlert, ReportWithUser } from '../types/database'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { count: totalMeasurements, error: measurementsError } = await supabase
        .from('measurements')
        .select('*', { count: 'exact', head: true })

      if (measurementsError) {
        console.error('Error fetching measurements count:', measurementsError)
        throw measurementsError
      }

      console.log('Total measurements:', totalMeasurements)

      const { data: avgData, error: avgError } = await supabase
        .from('measurements')
        .select('avg_value')
        .order('created_at', { ascending: false })
        .limit(100)

      if (avgError) {
        console.error('Error fetching avg data:', avgError)
        throw avgError
      }

      console.log('Avg data length:', avgData.length)

      const averageNoiseLevel =
        avgData.length > 0
          ? avgData.reduce((sum, m) => sum + Number(m.avg_value), 0) / avgData.length
          : 0

      const ALERT_THRESHOLD = 600
      const oneDayAgo = new Date()
      oneDayAgo.setDate(oneDayAgo.getDate() - 1)

      const { count: activeAlerts, error: alertsError } = await supabase
        .from('measurements')
        .select('*', { count: 'exact', head: true })
        .gte('max_value', ALERT_THRESHOLD)
        .gte('created_at', oneDayAgo.toISOString())

      if (alertsError) throw alertsError

      const { count: totalReports, error: reportsError } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })

      if (reportsError) throw reportsError

      return {
        totalMeasurements: totalMeasurements || 0,
        activeAlerts: activeAlerts || 0,
        totalReports: totalReports || 0,
        averageNoiseLevel: Math.round(averageNoiseLevel * 10) / 10,
      }
    },
    refetchInterval: 30000,
  })
}

export function useRecentAlerts(limit = 10) {
  return useQuery({
    queryKey: ['recent-alerts', limit],
    queryFn: async (): Promise<Array<RecentAlert>> => {
      const ALERT_THRESHOLD = 600
      
      const { data, error } = await supabase
        .from('measurements')
        .select(`
          *,
          devices (
            id,
            name,
            location
          )
        `)
        .gte('max_value', ALERT_THRESHOLD)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    },
    refetchInterval: 30000,
  })
}

export function useRecentReports(limit = 10) {
  return useQuery({
    queryKey: ['recent-reports', limit],
    queryFn: async (): Promise<Array<ReportWithUser>> => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          users (
            id,
            name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    },
    refetchInterval: 30000,
  })
}

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data
    },
    refetchInterval: 30000,
  })
}

export function useRecentMeasurements(limit = 50) {
  return useQuery({
    queryKey: ['recent-measurements', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measurements')
        .select(`
          *,
          devices (
            id,
            name,
            location
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    },
    refetchInterval: 30000,
  })
}
