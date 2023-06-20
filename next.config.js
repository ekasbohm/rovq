/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
        port: "",
      },
      {
        protocol: "https",
        hostname: "s2982.pcdn.co",
        port: "",
      },
      {
        protocol: "https",
        hostname: "books.google.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i5.walmartimages.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*amazon.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "learning.oreilly.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
      },
      {
        protocol: "https",
        hostname: "*.od-cdn.com",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
