import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import { appWithTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config"
import Layout from '@/components/Layout'
import { Provider } from 'react-redux';
import { persistor, store } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';

function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </PersistGate>
    </Provider>
  )
}
export default appWithTranslation(App, nextI18NextConfig)
