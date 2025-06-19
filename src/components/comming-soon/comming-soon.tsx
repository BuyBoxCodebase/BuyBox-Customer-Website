"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ComingSoon() {
  //   const [email, setEmail] = useState("")
  //   const [isSubmitted, setIsSubmitted] = useState(false)

  //   const handleSubmit = (e: React.FormEvent) => {
  //     e.preventDefault()
  //     // Here you would typically send the email to your backend
  //     setIsSubmitted(true)
  //     setTimeout(() => setIsSubmitted(false), 3000)
  //   }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 3,
            ease: "easeInOut",
          }}
          className="mb-8">
          <div className="mx-auto h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center">
            <span className="text-black text-2xl font-bold">BuyBox</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-4 text-4xl font-extrabold tracking-tight md:text-6xl">
          <span className="text-gray-800">Coming Soon</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mb-8 max-w-md text-muted-foreground">
          We're working hard to bring you an amazing shopping experience. Sign
          up to be the first to know when we launch.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8 w-full max-w-md">
          {/* <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" className="bg-gray-800 hover:bg-black" disabled={isSubmitted}>
              {isSubmitted ? (
                "Subscribed!"
              ) : (
                <>
                  Notify Me <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form> */}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mb-8">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="mx-auto h-1 w-48 origin-left bg-gray-800"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Launch progress: 75%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex justify-center space-x-4">
          <motion.a
            whileHover={{ y: -3, scale: 1.1 }}
            href="https://www.instagram.com/oasis_emporium?igsh=NzlzamdhZnQyamtl"
            className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-black-100 hover:text-gray-800">
            <Instagram className="h-5 w-5" />
          </motion.a>
          <motion.a
            whileHover={{ y: -3, scale: 1.1 }}
            href="https://www.facebook.com/share/18bsP84N7x/"
            className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-black-100 hover:text-gray-800">
            <Facebook className="h-5 w-5" />
          </motion.a>
        </motion.div>
      </motion.div>
    </div>
  );
}
