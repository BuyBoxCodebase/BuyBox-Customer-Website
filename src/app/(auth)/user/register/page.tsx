"use client";
import React, { Suspense, useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

import AuthLayout from "@/components/auth/AuthLayout";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { Button } from "@/components/ui/button";
import { usePageTracking } from "@/hooks/analytics";
import { useToast } from "@/hooks/toast/use-toast";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
}

type ValidationErrors = Partial<Record<keyof RegisterForm, string>>;

const EMAIL_IN_USE = "Email already in use";

const phoneRegex = /^\+263\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Shared by every control so the column lines up (matches the login page)
const fieldClass = "h-12 rounded-lg px-4 bg-white shadow-sm";

function RegisterPageContent() {
  const { register, loading, clearError } = useAuth();
  const { toast } = useToast();
  usePageTracking();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "+263",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string, data = formData): string | undefined => {
    const strValue = value.trim();

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
        return strValue !== data.password
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
    const next = { ...formData, [name]: value };
    setFormData(next);

    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, value, next),
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors: ValidationErrors = {};
    (Object.keys(formData) as (keyof RegisterForm)[]).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ name: true, email: true, phoneNumber: true, password: true, confirmPassword: true });
      return;
    }

    try {
      const { confirmPassword, ...credentials } = formData;
      await register(credentials);
    } catch (error) {
      const message =
        (error as AxiosError<{ message: string }>).response?.data?.message ||
        "Something went wrong. Please try again.";

      if (message === EMAIL_IN_USE) {
        setErrors((prev) => ({ ...prev, email: EMAIL_IN_USE }));
        setTouched((prev) => ({ ...prev, email: true }));
      }

      toast({
        title: message === EMAIL_IN_USE ? "This email already has an account" : "Couldn't create account",
        description: message === EMAIL_IN_USE ? "Log in instead, or use a different email." : message,
        variant: "destructive",
      });

      // The toast covers it; don't let the error linger into the login page's alert
      clearError();
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

  const statusIcon = (name: keyof RegisterForm) =>
    touched[name] &&
    (errors[name] ? (
      <XCircle className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-red-500" />
    ) : (
      <CheckCircle className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-green-500" />
    ));

  const fieldError = (name: keyof RegisterForm) =>
    errors[name] && touched[name] && (
      <p className="text-red-500 text-sm px-1">{errors[name]}</p>
    );

  return (
    <AuthLayout
      title="Treides"
      subtitle="Life, beautifully uncomplicated">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                className={`${fieldClass} pr-12`}
              />
              {statusIcon("name")}
            </div>
            {fieldError("name")}
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
                className={`${fieldClass} pr-12`}
              />
              {statusIcon("email")}
            </div>
            {errors.email === EMAIL_IN_USE ? (
              <p className="text-red-500 text-sm px-1">
                An account with this email already exists.{" "}
                <Link href="/user/login" className="font-medium text-black hover:underline">
                  Log in instead
                </Link>
              </p>
            ) : (
              fieldError("email")
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
                className={`${fieldClass} pr-12`}
              />
              {statusIcon("phoneNumber")}
            </div>
            {fieldError("phoneNumber")}
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                data-track-ignore
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Password"
                required
                className={`${fieldClass} pr-12`}
              />
              <Button
                aria-label="Toggle password visibility"
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </Button>
            </div>
            {formData.password && (
              <div className="space-y-1 px-1 pt-1">
                <div className="h-1.5 bg-gray-200 rounded">
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
                <p className="text-xs text-gray-600">
                  Password strength: {passwordStrength.text}
                </p>
              </div>
            )}
            {fieldError("password")}
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1">
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                data-track-ignore
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="Confirm Password"
                required
                className={`${fieldClass} pr-12`}
              />
              <Button
                aria-label="Toggle confirm password visibility"
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-500" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-500" />
                )}
              </Button>
            </div>
            {fieldError("confirmPassword")}
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-lg bg-black text-white hover:bg-black/85"
            disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-500">or</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <GoogleSignInButton className="h-12 bg-white" />

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/user/login" className="font-medium text-black hover:underline">
            Log in
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
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading....</div>}>
      <RegisterPageContent />
    </Suspense>
  )
}
