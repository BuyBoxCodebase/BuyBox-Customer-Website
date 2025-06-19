"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
            <motion.div whileHover={{ y: -3, scale: 1.1 }}>
              <Link href="/" className="font-semibold text-lg text-gray-800">
                BuyBox
              </Link>
            </motion.div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <p>© 2025 BuyBox </p>
                {/* <Link href='/'>@buybox</Link> */}
              </div>
              <div className="text-sm flex">
                <motion.a
                  target="_blank"
                  whileHover={{ scale: 1.1 }}
                  href="https://wa.me/263717651799"
                  className="inline-block text-green-700">
                  WhatsApp Support
                </motion.a>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.a
              whileHover={{ y: -3, scale: 1.1 }}
              href="https://www.instagram.com/buybox.com_official?igsh=NzlzamdhZnQyamtl&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-black-100 hover:text-gray-800">
              <Instagram className="h-5 w-5" />
            </motion.a>
            <motion.a
              whileHover={{ y: -3, scale: 1.1 }}
              href="https://www.facebook.com/profile.php?id=61576079021767"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-black-100 hover:text-gray-800">
              <Facebook className="h-5 w-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
