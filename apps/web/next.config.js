/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: () => {
    return [
      {
        source: "/trpc/:path*",
        destination: `${process.env.TRPC_URL}/:path*`,
      },
    ];
  },
  transpilePackages: ["@repo/trpc"],
};

export default nextConfig;