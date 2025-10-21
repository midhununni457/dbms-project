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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [securityQuestion, setSecurityQuestion] = useState("What was your first pet's name?")
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const QUESTIONS = [
    "What was your first pet's name?",
    "What is your mother's maiden name?",
    'What city were you born in?',
    'What was the name of your first school?',
    'What is your favorite book?',
  ]

  const validate = () => {
    if (!firstName.trim() || !email.trim() || !password) {
      return 'Please fill in required fields: first name, email and password.'
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) return 'Please enter a valid email address.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    if (password !== confirmPassword) return 'Passwords do not match.'
    if (!securityAnswer.trim()) return 'Please provide an answer to the security question.'
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
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email: email.trim().toLowerCase(),
        password,
        securityQuestion,
        securityAnswer: securityAnswer.trim(),
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = data?.message || data?.error || 'Signup failed.'
        setError(msg)
        setLoading(false)
        return
      }

      setSuccess('Account created successfully. Redirecting to login...')
      setLoading(false)
      setTimeout(() => router.push('/login'), 900)
    } catch (err) {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <Card className="md:flex">
          {/* Left info column */}
          <div className="hidden md:block md:w-1/3 bg-primary rounded-l-xl p-6">
            <div className="text-white">
              <h2 className="text-xl font-semibold">Exam Portal</h2>
              <p className="text-sm mt-2 text-primary-foreground/90">
                Register with your institutional email to access tests and results. Keep your security answer private.
              </p>
            </div>
          </div>

          {/* Form content */}
          <div className="w-full md:w-2/3">
            <CardHeader className="px-6 pt-6">
              <CardTitle>Create an account</CardTitle>
              <CardDescription>Register with your institution email for exam access.</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="text-sm font-medium mb-1 block">First name <span className="text-destructive">*</span></label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="text-sm font-medium mb-1 block">Last name</label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-1 block">Email <span className="text-destructive">*</span></label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Use your institution email for exam-assignment linking.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="text-sm font-medium mb-1 block">Password <span className="text-destructive">*</span></label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="text-sm font-medium mb-1 block">Confirm password</label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="securityQuestion" className="text-sm font-medium mb-1 block">Security question <span className="text-destructive">*</span></label>
                  <select
                    id="securityQuestion"
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className={cn("mt-1 block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs", "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]")}
                  >
                    {QUESTIONS.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="securityAnswer" className="text-sm font-medium mb-1 block">Answer to security question <span className="text-destructive">*</span></label>
                  <Input
                    id="securityAnswer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Your answer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Used only for account recovery. Keep it memorable but not publicly guessable.</p>
                </div>

                {/* Global error/success */}
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
                    Sign up
                  </LoadingButton>

                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                      Go to login
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  By creating an account you agree to the portal's terms of use. Contact your administrator for institutional account issues.
                </p>
              </form>
            </CardContent>

            <CardFooter className="px-6 pb-6" />
          </div>
        </Card>
      </div>
    </div>
  )
}

export default page