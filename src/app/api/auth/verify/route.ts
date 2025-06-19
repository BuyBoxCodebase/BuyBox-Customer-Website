import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { otp } = await request.json()

    // Here you would:
    // 1. Validate the OTP
    // 2. Mark the user as verified in your database
    // 3. Update the user's session

    // For demo purposes, we'll just check if OTP is 6 digits
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

