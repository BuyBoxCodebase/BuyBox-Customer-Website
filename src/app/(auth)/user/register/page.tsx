"use client";
import React, { Suspense, useState } from "react";
import Link from "next/link";
import {
  AtSign,
  Eye,
  EyeOff,
  Mail,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { usePageTracking } from "@/hooks/analytics";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";



interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
}

const phoneRegex = /^\+263\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

function RegisterPageContent() {
  const { register, loading, error, clearError } = useAuth();
  usePageTracking();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    phoneNumber: "+263",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string | number): string | undefined => {
    // Convert the value to a string for validation
    const strValue = String(value).trim();

    switch (name) {
      case "name":
        return strValue.length < 2
          ? "Name must be at least 2 characters"
          : undefined;
      case "email":
        return !emailRegex.test(strValue)
          ? "Invalid email address"
          : undefined;
      case "password":
        return !passwordRegex.test(strValue)
          ? "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
          : undefined;
      case "confirmPassword":
        // Make sure to compare the string versions
        return strValue !== String(formData.password)
          ? "Passwords do not match"
          : undefined;
      case "phoneNumber":
        return !phoneRegex.test(strValue)
          ? "Phone number must start with +263 followed by 9 digits"
          : undefined;
      default:
        return undefined;
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value),
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? (value) : value,
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate all fields
    const newErrors: ValidationErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof RegisterForm]);
      if (error) newErrors[key as keyof ValidationErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      (formData.phoneNumber);
      await register(formData);
      // console.log("Form submitted successfully:", formData); 
      // Reset form or redirect
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to submit form. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (
    password: string
  ): { strength: number; text: string } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthText =
      ["Very Weak", "Weak", "Fair", "Good", "Strong"][strength - 1] ||
      "Very Weak";

    return { strength, text: strengthText };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <AuthLayout
      title="Buybox"
      subtitle="Find the right shoe at the right price">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {/* Name Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Name"
              required
              className="pl-10 rounded-full" />
            {/* <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" /> */}
            {touched.name &&
              (errors.name ? (
                <XCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              ))}
          </div>
          {errors.name && touched.name && (
            <p className="text-red-400 lg:text-red-500 text-sm">{errors.name}</p>
          )}
        </div>

        {/* Email Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Email"
              required
              className="pl-10 rounded-full"
            />
            {/* <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" /> */}
            {touched.email &&
              (errors.email ? (
                <XCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              ))}
          </div>
          {errors.email && touched.email && (
            <p className="text-red-400 lg:text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Phone Number (+263...)"
              required
              className="pl-10 rounded-full"            // className={`pl-10 ${errors.phoneNumber ? "border-red-500" : ""}`}
            />
            {/* <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" /> */}
            {touched.phoneNumber &&
              (errors.phoneNumber ? (
                <XCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500" />
              ) : (
                <CheckCircle className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" />
              ))}
          </div>
          {errors.phoneNumber && touched.phoneNumber && (
            <p className="text-red-400 lg:text-red-500 text-sm">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Password"
              required
              className="pl-10 rounded-full"
            />
            {/* <AtSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" /> */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
          {formData.password && (
            <div className="space-y-1">
              <div className="h-2 bg-white/30 lg:bg-gray-200 rounded">
                <div
                  className={`h-full rounded transition-all ${passwordStrength.strength <= 2
                    ? "bg-red-500"
                    : passwordStrength.strength === 3
                      ? "bg-yellow-500"
                      : passwordStrength.strength === 4
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-200 lg:text-gray-600">
                Password strength: {passwordStrength.text}
              </p>
            </div>
          )}
          {errors.password && touched.password && (
            <p className="text-red-400 lg:text-red-500 text-sm">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-1">
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Confirm Password"
              required
              className="pl-10 rounded-full"
            />
            {/* <AtSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" /> */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p className="text-red-400 lg:text-red-500 text-sm">{errors.confirmPassword}</p>
          )}
        </div>

        <Button
          type="submit"
           className="h-12 w-full rounded-full"
            style={{ backgroundColor: "#4E008E" }}
          disabled={loading}>
          {loading ? "Creating account..." : "Sign Up"}
        </Button>

        <div className="text-center">
            <Link href="/user/login" className="text-sm text-gray-600 hover:text-gray-800">
              Login
            </Link>
          </div>

        {/* <div className="text-center">
          <span className="text-black lg:text-black">Already have an account? </span>
          <Link href="/user/login" className="text-red-400 lg:text-red-500 hover:text-red-300 lg:hover:text-red-600">
            Login
          </Link>
        </div> */}

        {/* <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>

          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">Or</span>

          </div>
        </div> */}
      </form>

      <div className="flex flex-col items-center space-y-6">
                <div className="w-full max-w-xs">
                  <GoogleSignInButton />
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
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <RegisterPageContent />
    </Suspense>
  )
}