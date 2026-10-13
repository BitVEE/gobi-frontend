import '@/styles/globals.scss'
import type { AppProps } from 'next/app'
import { appWithTranslation, useTranslation } from "next-i18next";
import nextI18NextConfig from "../../next-i18next.config"
import Layout from '@/components/Layout'
import { Provider } from 'react-redux';
import { persistor, store } from '@/redux/store';
import { PersistGate } from 'redux-persist/integration/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AUTH_REQUIRED_PATHS, resolveShareMeta, SITE_ORIGIN } from '@/utils/shareMeta';
import { useEffect } from 'react';

function App({ Component, pageProps }: AppProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const shareMeta = resolveShareMeta(router.asPath, router.pathname, router.locale)
  const shareTitle = t(`share.${shareMeta.key}.title`)
  const shareDescription = t(`share.${shareMeta.key}.description`)
  const siteTitle = t('common.siteTitle')
  const pageTitle = shareMeta.key === 'home' ? siteTitle : `${siteTitle}-${shareTitle}`
  const ogLocale = router.locale === 'en' ? 'en_US' : 'zh_CN'
  const alternateOgLocale = router.locale === 'en' ? 'zh_CN' : 'en_US'
  useEffect(() => { persistor.persist() }, [])

  return (
    <Provider store={store}>
      <Head>
        <title>{pageTitle}</title>
        <meta key="description" name="description" content={shareDescription} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:site_name" property="og:site_name" content={siteTitle} />
        <meta key="og:title" property="og:title" content={pageTitle} />
        <meta key="og:description" property="og:description" content={shareDescription} />
        <meta key="og:image" property="og:image" content={shareMeta.imageUrl} />
        <meta key="og:image:secure_url" property="og:image:secure_url" content={shareMeta.imageUrl} />
        <meta key="og:image:type" property="og:image:type" content={shareMeta.imageType} />
        <meta key="og:image:width" property="og:image:width" content={String(shareMeta.imageWidth)} />
        <meta key="og:image:height" property="og:image:height" content={String(shareMeta.imageHeight)} />
        <meta key="og:image:alt" property="og:image:alt" content={pageTitle} />
        <meta key="og:url" property="og:url" content={shareMeta.shareUrl} />
        <meta key="og:locale" property="og:locale" content={ogLocale} />
        <meta key="og:locale:alternate" property="og:locale:alternate" content={alternateOgLocale} />
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content={pageTitle} />
        <meta key="twitter:description" name="twitter:description" content={shareDescription} />
        <meta key="twitter:image" name="twitter:image" content={shareMeta.imageUrl} />
        <link key="canonical" rel="canonical" href={shareMeta.shareUrl} />
        <meta key="robots" name="robots" content={shareMeta.noIndex ? 'noindex,follow' : 'index,follow,max-image-preview:large'} />
        {!shareMeta.noIndex && ['zh', 'en', 'x-default'].map(language => (
          <link key={`alternate-${language}`} rel="alternate" hrefLang={language}
            href={shareMeta.alternateUrls[language === 'en' ? 'en' : 'zh']} />
        ))}
        {router.pathname === '/' && <script key="website-schema" type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org', '@type': 'WebSite',
            '@id': `${SITE_ORIGIN}/#website`, url: `${SITE_ORIGIN}/`,
            name: 'Youth Ultra Gobi', alternateName: ['青戈赛', '玄奘之路青少年戈壁挑战赛'],
            inLanguage: ['zh-CN', 'en'],
          }).replace(/</g, '\\u003c') }} />}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"></meta>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <PersistGate persistor={persistor}>
        {(bootstrapped) => AUTH_REQUIRED_PATHS.has(router.pathname) && !bootstrapped ? null : (
          <Layout>
            <Component {...pageProps} />
          </Layout>
        )}
      </PersistGate>
    </Provider>
  )
}
export default appWithTranslation(App, nextI18NextConfig)
