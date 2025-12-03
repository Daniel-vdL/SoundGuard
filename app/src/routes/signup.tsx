import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { supabase } from '../lib/supabaseClient'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute('/signup')({
  beforeLoad: () => {
    const storedUser = localStorage.getItem('soundguard_user')
    if (storedUser) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SignupPage,
})
function SignupPage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const bcrypt = await import('bcryptjs')
    const hashedPassword = await bcrypt.hash(password, 10)

    const { error } = await supabase.from('users').insert({
      name,
      email,
      password: hashedPassword,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    navigate({ to: '/login' })
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Sign up
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {errorMsg && (
              <p className="text-red-500 text-sm text-center">{errorMsg}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing up..." : "Sign up"}
            </Button>
          </form>
          <p className="text-sm text-center mt-4">
            Already have an account?{' '}
            <a
              href="/login"
                className="text-primary underline hover:text-primary/80"
            >
                Log in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
