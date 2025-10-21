'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { LoadingButton } from '@/components/ui/loading-button'
import { cn } from '@/lib/utils'

const page = () => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const validate = () => {
    if (!email.trim() || !password) return 'Email and password are required.'
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) return 'Please enter a valid email address.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const clientError = validate()
    if (clientError) {
      setError(clientError)
      return
    }

    setLoading(true)
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        remember: !!remember,
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = data?.message || data?.error || 'Login failed. Check credentials and try again.'
        setError(msg)
        setLoading(false)
        return
      }

      // Prefer server-set HTTP-only cookie. If server returns token, adjust as needed.
      setSuccess('Login successful. Redirecting...')
      setLoading(false)
      setTimeout(() => router.push('/dashboard'), 700)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="px-6 pt-6">
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Sign in to access exams, submit responses and view results.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium mb-1 block">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium mb-1 block">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className="text-sm">Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => router.push('/forgot')}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div role="alert" className="rounded-md bg-destructive text-destructive-foreground px-4 py-2 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" aria-live="polite" className="rounded-md bg-success text-success-foreground px-4 py-2 text-sm">
                  {success}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <LoadingButton loading={loading} type="submit" className="min-w-[120px]">
                  Sign in
                </LoadingButton>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => router.push('/signup')}>Sign up</Button>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="px-6 pb-6">
            <p className="text-xs text-muted-foreground">
              Make sure your institution account is active. Contact your administrator if you have access issues.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default page