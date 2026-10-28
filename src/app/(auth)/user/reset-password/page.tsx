"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import axios, { AxiosError } from "axios"
import { Eye, EyeOff } from "lucide-react"
import AuthLayout from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePageTracking } from "@/hooks/analytics"
import { useToast } from "@/hooks/toast/use-toast"

// Same rule as the register page
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

function ResetPasswordContent() {
  usePageTracking()
  const { toast } = useToast()
  const router = useRouter()
  const token = useSearchParams().get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!passwordRegex.test(password)) {
      setError("Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")
      return
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setError(null)
    setSubmitting(true)

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/reset-password`, { token, password })
      toast({ title: "Password updated", description: "You can now log in with your new password." })
      router.push("/user/login")
    } catch (err) {
      toast({
        title: "Couldn't reset password",
        description: (err as AxiosError<{ message: string }>).response?.data?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Treides" subtitle="Life, beautifully uncomplicated">
      {!token ? (
        <div className="space-y-4 text-center">
          <h2 className="text-lg font-semibold">This link is incomplete</h2>
          <p className="text-sm text-gray-600">Open the link from your email again, or request a new one.</p>
          <Link href="/user/forgot-password" className="font-medium text-black hover:underline">
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-center">
            <h2 className="text-lg font-semibold">Set a new password</h2>
            <p className="text-sm text-gray-600">Choose a password you don&apos;t use anywhere else.</p>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              data-track-ignore
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              className="h-12 rounded-lg pl-4 pr-12 bg-white shadow-sm"
            />
            <Button
              aria-label="Toggle password visibility"
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
            </Button>
          </div>

          <Input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            data-track-ignore
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="h-12 rounded-lg px-4 bg-white shadow-sm"
          />

          {error && <p className="text-red-500 text-sm px-1">{error}</p>}

          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-black text-white hover:bg-black/85"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save new password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
