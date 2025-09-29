"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AuthLayout from "@/components/auth/AuthLayout"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"
import { useAuth } from "../../../context/AuthContext"
import { usePageTracking } from "@/hooks/analytics"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import { ArrowRight, AtSign, Eye, EyeOff, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

interface LoginForm {
  email: string;
  password: string;
}

function LoginPageContent() {
  const { login, loading, error, clearError } = useAuth()
  usePageTracking()

  // Add missing state management
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await login(formData);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <AuthLayout title="Buybox" subtitle="Find the right shoe at the right price">
      <div className="space-y-8">
        {/* Email/password login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="pl-10 bg-white/90 lg:bg-white border-white/20 lg:border-gray-300 text-gray-900 placeholder:text-gray-600"
            />
            <AtSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
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
            className="h-12 w-full bg-red-500 hover:bg-red-600"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log In"}
          </Button>
          <div className="text-center">
            <span className="text-black lg:text-black">First time at BuyBox? </span>
            <Link href="/user/register" className="text-red-400 lg:text-red-500 hover:text-red-300 lg:hover:text-red-600">
              Sign Up
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>

            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or</span>

            </div>
          </div>
        </form>

        <div className="flex flex-col items-center space-y-6">
          {/* <div className="text-center">
            <h3 className="text-lg font-medium mb-2 text-white lg:text-gray-900">One-click Sign In</h3>
            <p className="text-gray-200 lg:text-gray-500 mb-4">The fastest way to get started</p>
          </div> */}

          <div className="w-full max-w-xs">
            <GoogleSignInButton />
          </div>

          {/* <div className="relative w-full my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30 lg:border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/10 lg:bg-gray-50 text-white lg:text-gray-500">New here?</span>
            </div>
          </div>

          <Link href="/user/register">
            <Button variant="outline" className="flex items-center gap-2 border-white/30 lg:border-gray-300 text-white lg:text-gray-900 hover:bg-white/10 lg:hover:bg-gray-50">
              Create an account <ArrowRight className="h-4 w-4" />
            </Button>
          </Link> */}
        </div>

        <div className="space-y-2 text-center text-sm mt-8">
          <span className="text-gray-200 lg:text-gray-600">
            <Link href="/terms" className="text-red-400 lg:text-red-500 hover:text-red-300 lg:hover:text-red-600">
              Terms of use |
            </Link>
          </span>
          <span>
            <Link href="/privacy" className="text-blue-400 lg:text-blue-500 hover:text-blue-300 lg:hover:text-blue-600">
              Privacy Policy
            </Link>
          </span>
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