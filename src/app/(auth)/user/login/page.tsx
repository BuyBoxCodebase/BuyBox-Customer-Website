"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AuthLayout from "@/components/auth/AuthLayout"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"
import { useAuth } from "../../../../context/AuthContext"
import { usePageTracking } from "@/hooks/analytics"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import { Eye, EyeOff, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

interface LoginForm {
  email: string;
  password: string;
}

function LoginPageContent() {
  const { login, loading, error, clearError } = useAuth()
  usePageTracking()

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<LoginForm>({
    email: "",
    password: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
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
              placeholder="Mobile number or email address"
              required
              className="pl-10 rounded-full"
            />
            {/* <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" /> */}
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
              className="pl-10 rounded-full"
            />
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

          {/* Log in button */}
          <Button
            type="submit"
            className="h-12 w-full rounded-full"
            style={{ backgroundColor: "#4E008E" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log In"}
          </Button>

          {/* Create account link */}
          <div className="text-center">
            <Link href="/user/register" className="text-sm text-gray-600 hover:text-gray-800">
              Create account!
            </Link>
          </div>
        </form>

        {/* Continue with Google */}
        <div className="flex flex-col items-center space-y-6">
          <div className="w-full max-w-xs">
            <GoogleSignInButton />
          </div>
        </div>
      </div>
      <div className="space-y-2 text-center text-sm mt-8">
        <span className="text-gray-200 lg:text-gray-600">
          <Link href="/user/terms" className="text-red-400 lg:text-red-500 hover:text-red-300 lg:hover:text-red-600">
            Terms of use |
          </Link>
        </span>
        <span>
          <Link href="/user/privacy" className="text-blue-400 lg:text-blue-500 hover:text-blue-300 lg:hover:text-blue-600">
            Privacy Policy
          </Link>
        </span>
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
