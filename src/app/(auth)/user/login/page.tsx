"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import AuthLayout from "@/components/auth/AuthLayout"
import GoogleSignInButton from "@/components/auth/GoogleSignInButton"
import { useAuth } from "../../../../context/AuthContext"
import { usePageTracking } from "@/hooks/analytics"
import { LoadingScreen } from "@/components/ui/LoadingScreen"
import { Eye, EyeOff } from "lucide-react"
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
    <AuthLayout title="Treides" subtitle="Life, beautifully uncomplicated">
      {/* Every control shares one height, width and shape so the column lines up */}
      <div className="space-y-6">
        {/* Email/password login form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Mobile number or email address"
            required
            className="h-12 rounded-full px-5 bg-white shadow-sm"
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              data-track-ignore
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
              className="h-12 rounded-full pl-5 pr-12 bg-white shadow-sm"
            />
            <Button
              aria-label="Toggle password visibility"
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-0 h-full px-3 hover:bg-transparent"
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
            className="h-12 w-full rounded-full"
            style={{ backgroundColor: "#4E008E" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Log In"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleSignInButton className="h-12 bg-white" />

        <p className="text-center text-sm text-gray-600">
          New to Treides?{" "}
          <Link href="/user/register" className="font-medium text-[#4E008E] hover:underline">
            Create account
          </Link>
        </p>
      </div>

      <div className="flex justify-center gap-2 pt-6 text-sm text-gray-500">
        <Link href="/user/terms" className="hover:text-gray-800 hover:underline">
          Terms of use
        </Link>
        <span aria-hidden="true">|</span>
        <Link href="/user/privacy" className="hover:text-gray-800 hover:underline">
          Privacy Policy
        </Link>
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
