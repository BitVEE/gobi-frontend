import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import { appWithTranslation, useTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config"
import Layout from '@/components/Layout'
import { Provider } from 'react-redux';
import { persistor, store } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import Head from 'next/head';

function App({ Component, pageProps }: AppProps) {
  const { t } = useTranslation()
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Layout>
          <Head>
            <title>{t('common.siteTitle')}</title>
            <meta name="description" content="" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"></meta>
            <meta name="keywords" content="Gobź"></meta>
            <link rel="icon" href="/favicon.png" />
          </Head>
          <Component {...pageProps} />
        </Layout>
      </PersistGate>
    </Provider>
  )
}
export default appWithTranslation(App, nextI18NextConfig)
