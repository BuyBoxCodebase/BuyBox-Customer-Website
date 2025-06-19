import jwt from "jsonwebtoken"

export async function verifyAuth(token: string) {
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    return verified
  } catch (error) {
    throw new Error("Invalid token")
  }
}