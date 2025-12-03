import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export function UserDashboard() {
  const { user, logout } = useAuth()
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [room, setRoom] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const reportData: {
        type: string
        text: string
        location: string
        room: string
        date: string
        user_id?: string
      } = {
        type: 'manual',
        text: description,
        location,
        room,
        date: new Date().toISOString(),
      }

      if (!isAnonymous && user?.id) {
        reportData.user_id = user.id
      }

      const { data, error: insertError } = await supabase.from('reports').insert(reportData)

      if (insertError) {
        console.error('Supabase error details:', insertError)
        throw new Error(insertError.message || 'Failed to submit report. Please contact an administrator.')
      }

      console.log('Report created successfully:', data)
      setSuccess('Report submitted successfully!')
      setDescription('')
      setLocation('')
      setRoom('')
      setIsAnonymous(false)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Error submitting report:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit report. Please try again or contact an administrator.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SoundGuard</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Create New Message (Melding)</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Submit a new message regarding noise concerns
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., School, Building A"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="e.g., kamer 1, Room 101"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the noise issue..."
                  rows={6}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-md">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous" className="cursor-pointer">
                  Submit anonymously (your name will not be shown)
                </Label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-800">
                    <strong>Success:</strong> {success}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
