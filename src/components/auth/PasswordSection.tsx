"use client"

import { useEffect, useState } from "react"
import axios, { AxiosError } from "axios"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/toast/use-toast"

// Same rule as the register page
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

const endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/customer/profile/password`

interface PasswordFieldProps {
  name: string
  autoComplete: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}

// Password input with the same show/hide eye as the login and register pages
function PasswordField({ name, autoComplete, value, onChange, placeholder }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        name={name}
        data-track-ignore
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-11 rounded-lg pl-4 pr-12 bg-white"
      />
      <Button
        aria-label={visible ? "Hide password" : "Show password"}
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-1 top-0 h-full px-3 hover:bg-transparent"
        onClick={() => setVisible(!visible)}
      >
        {visible ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
      </Button>
    </div>
  )
}

/** Change password, or set a first one for accounts created with Google. */
export default function PasswordSection() {
  const { toast } = useToast()
  const [hasPassword, setHasPassword] = useState<boolean | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios
      .get<{ hasPassword: boolean }>(endpoint)
      .then((res) => setHasPassword(res.data.hasPassword))
      .catch(() => setLoadFailed(true))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!passwordRegex.test(newPassword)) {
      setError("Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setError(null)
    setSaving(true)

    try {
      await axios.post(endpoint, { currentPassword: hasPassword ? currentPassword : undefined, newPassword })
      toast({
        title: hasPassword ? "Password changed" : "Password set",
        description: hasPassword ? undefined : "You can now also log in with your email and password.",
      })
      setHasPassword(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      toast({
        title: "Couldn't update password",
        description: (err as AxiosError<{ message: string }>).response?.data?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loadFailed) {
    return <p className="text-sm text-gray-500">Couldn&apos;t load your password settings. Refresh the page to try again.</p>
  }

  if (hasPassword === null) {
    return <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
      <p className="text-sm text-gray-600">
        {hasPassword
          ? "Change the password you use to log in with your email."
          : "You signed up with Google. Set a password to also log in with your email."}
      </p>

      {hasPassword && (
        <PasswordField
          name="currentPassword"
          autoComplete="current-password"
          value={currentPassword}
          onChange={setCurrentPassword}
          placeholder="Current password"
        />
      )}
      <PasswordField
        name="newPassword"
        autoComplete="new-password"
        value={newPassword}
        onChange={setNewPassword}
        placeholder="New password"
      />
      <PasswordField
        name="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="Confirm new password"
      />

      {error && <p className="text-red-500 text-sm px-1">{error}</p>}

      <Button
        type="submit"
        className="h-11 rounded-lg px-6 bg-black text-white hover:bg-black/85"
        disabled={saving}
      >
        {saving ? "Saving..." : hasPassword ? "Change password" : "Set password"}
      </Button>
    </form>
  )
}
