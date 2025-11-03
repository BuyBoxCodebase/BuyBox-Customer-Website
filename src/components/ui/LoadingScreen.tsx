// "use client";
// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";

// export const LoadingScreen = () => {
//   const [loadingProgress, setLoadingProgress] = useState(0);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setLoadingProgress(loadingProgress < 100 ? loadingProgress + 25 : 0);
//     }, 500);

//     return () => clearTimeout(timer);
//   }, [loadingProgress]);

//   // Tailwind orange-500 color value
//   const blackColor = "#424242"; // This is the hex value for orange-500 in Tailwind
//   const orangeColor = "#ff9800"; // This is the hex value for orange-500 in Tailwind

//   return (
//     <div className="flex flex-col justify-center items-center min-h-[400px] py-12 px-4">
//       <motion.div
//         className="flex flex-col items-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}>
//         {/* Logo placeholder */}
//         <motion.div
//           className="mb-8 relative"
//           animate={{ scale: [1, 1.05, 1] }}
//           transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
//           <svg
//             width="60"
//             height="60"
//             viewBox="0 0 60 60"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg">
//             <motion.path
//               d="M30 2C14.536 2 2 14.536 2 30C2 45.464 14.536 58 30 58C45.464 58 58 45.464 58 30C58 14.536 45.464 2 30 2Z"
//               stroke={orangeColor}
//               strokeWidth="3"
//               strokeLinecap="round"
//               initial={{ pathLength: 0 }}
//               animate={{ pathLength: 1 }}
//               transition={{ duration: 2, repeat: Infinity }}
//             />
//             <motion.path
//               d="M20 30L27 37L40 24"
//               stroke={orangeColor}
//               strokeWidth="3"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               initial={{ pathLength: 0, opacity: 0 }}
//               animate={{ pathLength: 1, opacity: 1 }}
//               transition={{ duration: 1, delay: 1, repeat: Infinity }}
//             />
//           </svg>
//         </motion.div>

//         <motion.h2
//           className="text-xl font-medium text-gray-800 mb-3"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.2, duration: 0.5 }}>
//           Loading Products
//         </motion.h2>

//         <motion.div
//           className="text-sm text-gray-500 mb-6"
//           initial={{ y: 20, opacity: 0 }}
//           animate={{ y: 0, opacity: 1 }}
//           transition={{ delay: 0.3, duration: 0.5 }}>
//           Experience seamless shopping
//         </motion.div>

//         {/* Progress bar */}
//         <div className="w-64 bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
//           <motion.div
//             className="h-full bg-orange-400 rounded-full"
//             initial={{ width: "0%" }}
//             animate={{ width: `${loadingProgress}%` }}
//             transition={{ duration: 0.5, ease: "easeInOut" }}
//           />
//         </div>

//         {/* Pulse dots */}
//         <div className="flex space-x-2">
//           {[0, 1, 2].map((dot) => (
//             <motion.div
//               key={dot}
//               className="w-2 h-2 bg-orange-400 rounded-full"
//               animate={{
//                 scale: [1, 1.5, 1],
//                 opacity: [0.7, 1, 0.7],
//               }}
//               transition={{
//                 repeat: Infinity,
//                 duration: 1.5,
//                 delay: dot * 0.3,
//                 ease: "easeInOut",
//               }}
//             />
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

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