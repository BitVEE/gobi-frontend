import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import { appWithTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config"
import Layout from '@/components/Layout'

function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}
export default appWithTranslation(App, nextI18NextConfig)
