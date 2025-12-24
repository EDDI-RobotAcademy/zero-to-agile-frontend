/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // 개발 환경에서만 백엔드 포트로 프록시
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:33333/api/:path*',
        },
      ];
    }
    // 프로덕션 환경에서는 같은 도메인 사용 (rewrites 없음)
    return [];
  },
}

module.exports = nextConfig
