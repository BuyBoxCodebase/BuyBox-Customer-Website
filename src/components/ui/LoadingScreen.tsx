"use client";
import { motion } from "framer-motion";

export const LoadingScreen = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <motion.div
        className="w-24 h-24 border-4 border-gray-200 border-t-[#010B13] rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1,
          ease: "linear",
        }}
      />
    </div>
  );
};