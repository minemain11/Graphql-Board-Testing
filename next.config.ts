import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  // 내 컴퓨터에서 쓰는 내장 데이터베이스(PGlite)는 번들에 묶지 않고 그대로 불러옵니다.
  serverExternalPackages: ["@electric-sql/pglite"],

  async redirects() {
    return [{ source: "/", destination: "/boards", permanent: false }];
  },
};

export default nextConfig;
