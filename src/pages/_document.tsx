import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
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
