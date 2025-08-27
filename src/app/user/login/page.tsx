"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AuthLayout from "@/components/auth/AuthLayout"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"
import { useAuth } from "../../../context/AuthContext"
import { usePageTracking } from "@/hooks/analytics"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import { ArrowRight } from "lucide-react"

function LoginPageContent() {
  const { loading, error } = useAuth()
  usePageTracking()

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to continue your journey">
      <div className="space-y-8">
        {/* Email/password login form commented out
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="relative">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="pl-10"
            />
            <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="pl-10"
            />
            <AtSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log In"}
          </Button>
        </form>
        */}

        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">One-click Sign In</h3>
            <p className="text-gray-500 mb-4">The fastest way to get started</p>
          </div>

          <div className="w-full max-w-xs">
            <GoogleSignInButton />
          </div>

          {/* <div className="relative w-full my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">New here?</span>
            </div>
          </div> */}

          {/* <Link href="/user/register">
            <Button variant="outline" className="flex items-center gap-2">
              Create an account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link> */}
        </div>

        <div className="space-y-2 text-center text-sm mt-8">
          <p className="text-gray-600">
            By continuing you confirm that you agree to our{" "}
            <Link href="/terms" className="text-red-500 hover:text-red-600">
              terms and conditions
            </Link>
          </p>
          <Link href="/privacy" className="text-blue-500 hover:text-blue-600">
            Privacy Policy
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginPageContent />
    </Suspense>
  )
}