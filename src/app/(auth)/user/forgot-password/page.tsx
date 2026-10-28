"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import axios, { AxiosError } from "axios"
import { MailCheck } from "lucide-react"
import AuthLayout from "@/components/auth/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePageTracking } from "@/hooks/analytics"
import { useToast } from "@/hooks/toast/use-toast"

function ForgotPasswordContent() {
  usePageTracking()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/auth/forgot-password`, { email })
      setSent(true)
    } catch (error) {
      toast({
        title: "Couldn't send the reset link",
        description:
          (error as AxiosError<{ message: string }>).response?.data?.message || "Please try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Treides" subtitle="Life, beautifully uncomplicated">
      <div className="space-y-6">
        {sent ? (
          <div className="space-y-3 text-center">
            <MailCheck className="mx-auto h-10 w-10 text-black" />
            <h2 className="text-lg font-semibold">Check your email</h2>
            <p className="text-sm text-gray-600">
              If an account exists for <span className="font-medium text-gray-900">{email}</span>, we&apos;ve sent a
              link to set a new password. It expires in 30 minutes.
            </p>
            <Button variant="ghost" className="text-sm" onClick={() => setSent(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 text-center">
              <h2 className="text-lg font-semibold">Forgot your password?</h2>
              <p className="text-sm text-gray-600">
                Enter your email and we&apos;ll send you a link to set a new one. Signed up with Google? This also lets
                you add a password.
              </p>
            </div>

            <Input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="h-12 rounded-lg px-4 bg-white shadow-sm"
            />

            <Button
              type="submit"
              className="h-12 w-full rounded-lg bg-black text-white hover:bg-black/85"
              disabled={submitting}
            >
              {submitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600">
          Remembered it?{" "}
          <Link href="/user/login" className="font-medium text-black hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
