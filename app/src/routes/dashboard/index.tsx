import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthContext'
import { UserDashboard } from '../../components/dashboards/UserDashboard'
import { AdminDashboard } from '../../components/dashboards/AdminDashboard'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: () => {
    const storedUser = localStorage.getItem('soundguard_user')
    
    if (!storedUser) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: DashboardPage,
})

type User = {
  role: string
}

function DashboardPage() {
  const { user, loading } = useAuth() as { user: User | null, loading: boolean }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  if (user.role === 'admin') {
    return <AdminDashboard />
  }

  if (user.role === 'user') {
    return <UserDashboard />
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-red-600">Unknown user role. Please contact support.</p>
      </div>
    </div>
  )
}
