import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useDashboardStats, useDevices, useRecentAlerts, useRecentMeasurements, useRecentReports } from '../../hooks/useAdminDashboard'
import type { Report } from '../../types/database'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Tab = 'overview' | 'devices' | 'reports'

const THRESHOLD_MAX = 600

export function AdminDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  
  const { data: stats, isLoading: statsLoading, error: statsError } = useDashboardStats()
  const { data: recentAlerts = [], isLoading: alertsLoading, error: alertsError } = useRecentAlerts(10)
  const { data: recentReports = [], isLoading: reportsLoading, error: reportsError } = useRecentReports(10)
  const { data: devices = [], isLoading: devicesLoading, error: devicesError } = useDevices()
  const { data: measurements = [], isLoading: measurementsLoading, error: measurementsError } = useRecentMeasurements(50)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800'
      case 'open':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'Resolved'
      case 'open':
        return 'Open'
      case 'in_progress':
        return 'In Progress'
      default:
        return status
    }
  }

  if (statsError || alertsError || reportsError || devicesError || measurementsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {statsError?.message || alertsError?.message || reportsError?.message || devicesError?.message || measurementsError?.message || 'An error occurred while fetching data.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SoundGuard Admin</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name} (Administrator)</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-73px)] p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === 'overview'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === 'devices'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100'
              }`}
            >
              🔌 Devices
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                activeTab === 'reports'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100'
              }`}
            >
              📝 Reports
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              <>
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-9 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Measurements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats?.totalMeasurements ?? 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">{stats?.activeAlerts ?? 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Total Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats?.totalReports ?? 0}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Avg Sensor Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{Math.round(stats?.averageNoiseLevel ?? 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Raw analog value</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Recent Triggered Alerts</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Sensor readings that exceeded threshold (≥{THRESHOLD_MAX} raw value)
              </p>
            </CardHeader>
            <CardContent>
              {alertsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  ))}
                </div>
              ) : recentAlerts.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No recent alerts found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Location / Room
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Sensor Values
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAlerts.map((alert) => (
                        <tr key={alert.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {alert.devices?.location || 'Unknown'} / {alert.room}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`font-semibold ${
                                alert.max_value > 600 ? 'text-red-600' : 'text-orange-600'
                              }`}
                            >
                              Max: {Math.round(alert.max_value)}
                            </span>
                            <span className="text-gray-500 ml-2">
                              Avg: {Math.round(alert.avg_value)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(alert.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>User Reports Overview</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Recent manual noise complaints and reports from users (click for details)
              </p>
            </CardHeader>
            <CardContent>
              {reportsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  ))}
                </div>
              ) : recentReports.filter(r => r.type === 'manual').length === 0 ? (
                <p className="text-center text-gray-500 py-8">No user reports found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          User
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Description
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Location / Room
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReports.filter(r => r.type === 'manual').map((report) => (
                        <tr 
                          key={report.id} 
                          className="border-b hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => setSelectedReport(report)}
                        >
                          <td className="py-3 px-4 text-sm">
                            {report.users?.name || (report.user_id ? 'Unknown User' : 'Anonymous')}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {report.text ? (
                              report.text.length > 50 
                                ? `${report.text.substring(0, 50)}...` 
                                : report.text
                            ) : (
                              <span className="text-gray-400">No description</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            {report.location || 'N/A'} / {report.room || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                            >
                              {getStatusLabel(report.status)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(report.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Sensor Information:</strong> The KY-037 microphone sensor measures raw analog values (0-1023), not decibels. 
              Higher values indicate louder sounds. Alert thresholds are configured at {THRESHOLD_MAX} for maximum values.
            </p>
          </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Devices Management</h2>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>All Devices</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Monitor and manage connected sound monitoring devices
                  </p>
                </CardHeader>
                <CardContent>
                  {devicesLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      ))}
                    </div>
                  ) : devices.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No devices found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Device Name
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Location
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {devices.map((device) => (
                            <tr key={device.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm font-medium">{device.name}</td>
                              <td className="py-3 px-4 text-sm">{device.location}</td>
                              <td className="py-3 px-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    device.status === 'online'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {device.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {formatDate(device.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Measurements</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Latest sensor readings (KY-037 raw analog values: 0-1023)
                  </p>
                </CardHeader>
                <CardContent>
                  {measurementsLoading ? (
                    <div className="space-y-3">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-3">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-12" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      ))}
                    </div>
                  ) : measurements.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No measurements found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Device / Room
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Avg Value
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Min Value
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Max Value
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Timestamp
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {measurements.map((measurement) => (
                            <tr key={measurement.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm">
                                {measurement.devices?.name || 'Unknown'} / {measurement.room}
                              </td>
                              <td className="py-3 px-4 text-sm font-medium">
                                {Math.round(measurement.avg_value)}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {Math.round(measurement.min_value)}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span
                                  className={`font-semibold ${
                                    measurement.max_value > 600
                                      ? 'text-red-600'
                                      : measurement.max_value > 550
                                        ? 'text-orange-600'
                                        : 'text-green-600'
                                  }`}
                                >
                                  {Math.round(measurement.max_value)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {formatDate(measurement.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Sensor Information:</strong> The KY-037 microphone sensor measures raw analog values (0-1023), not decibels. 
              Higher values indicate louder sounds. Alert thresholds are configured at {THRESHOLD_MAX} for maximum values.
            </p>
          </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Reports Management</h2>
              
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>All Reports</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    View and manage noise complaints and automatic alerts (click for details)
                  </p>
                </CardHeader>
                <CardContent>
                  {reportsLoading ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-3">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-64" />
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      ))}
                    </div>
                  ) : recentReports.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No reports found</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              User
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Description
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Location / Room
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Type
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentReports.map((report) => (
                            <tr 
                              key={report.id} 
                              className="border-b hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => setSelectedReport(report)}
                            >
                              <td className="py-3 px-4 text-sm">
                                {report.users?.name || (report.user_id ? 'Unknown User' : report.type === 'auto' ? 'System' : 'Anonymous')}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {report.text ? (
                                  report.text.length > 60 
                                    ? `${report.text.substring(0, 60)}...` 
                                    : report.text
                                ) : (
                                  <span className="text-gray-400">No description</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                {report.location} / {report.room || 'N/A'}
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    report.type === 'auto'
                                      ? 'bg-purple-100 text-purple-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {report.type === 'auto' ? 'Automatic' : 'Manual'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                                >
                                  {getStatusLabel(report.status)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {formatDate(report.created_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
            <DialogDescription>
              Full information about this noise report
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Submitted By</p>
                  <p className="text-sm text-gray-900">
                    {selectedReport.users?.name || (selectedReport.user_id ? 'Unknown User' : selectedReport.type === 'auto' ? 'System' : 'Anonymous')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Report Type</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedReport.type === 'auto'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {selectedReport.type === 'auto' ? 'Automatic' : 'Manual'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Location</p>
                  <p className="text-sm text-gray-900">{selectedReport.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Room</p>
                  <p className="text-sm text-gray-900">{selectedReport.room || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}
                  >
                    {getStatusLabel(selectedReport.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Created</p>
                  <p className="text-sm text-gray-900">{formatDate(selectedReport.created_at)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedReport.text || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
