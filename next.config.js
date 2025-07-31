/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'zh',
    localeDetection: false,
  },
  async redirects() {
    return [
      // { source: '/', destination: '/', permanent: false },
    ]
  },
}

module.exports = nextConfig