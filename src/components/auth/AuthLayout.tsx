import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type React from "react"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
        <div className="min-h-screen bg-gray-50 p-4">
      <div className="mb-8">
        {/* <Link href="/" className="inline-flex items-center text-gray-600">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Link> */}
      </div>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-600">{subtitle}</p>

        </div>
                {children}

      </div>
    </div>
  )
}

