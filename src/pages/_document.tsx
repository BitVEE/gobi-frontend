import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <Script src="/js/rem.js" strategy="beforeInteractive" />
        <Script id='tag' strategy="lazyOnload">
          {` 
          var _czc = _czc || [];
          (function () {
           var um = document.createElement("script");
           um.src = "https://v1.cnzz.com/z.js?id=1281435768&async=1";
           var s = document.getElementsByTagName("script")[0];
           s.parentNode.insertBefore(um, s);
          })();          
        `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
