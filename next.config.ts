import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    unoptimized: true,
    domains: [
      "res.cloudinary.com",
      "localhost",
      "i.postimg.cc",
      "i.pinimg.com",
      "images.unsplash.com",
    ],
  },
  // output: "export",
};

export default nextConfig;
