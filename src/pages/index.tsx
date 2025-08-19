import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";

import Card from "@/components/card";
import { NewsAPI } from "@/api";

// This is the main page of the application
// It serves as the entry point for the user interface
// and displays the main content of the application.
import styles from '../styles/home.module.scss'
import { formatDate } from "@/utils/tool";


// The main functional component for the home page
// It returns the main layout of the page including the header and main content area.
// The header is imported from the components directory.
export default function Home() {
  const { t, i18n } = useTranslation();
  const [newsData, setNewsData] = useState<API.NewsLisData>();

  const getNewsData = async () => {
    // This function would typically fetch news data from an API or database.
    // For now, it returns a static array of news items.
    const newsData = await NewsAPI.getNewsList({
      type: 1,
      page: 1,
      size: 5,
    });
    if (newsData.data.code === 0) {
      // If the API call is successful, set the news data to the state
      setNewsData(newsData.data.data);
    } else {
      // If there is an error, log it to the console
      console.error("Failed to fetch news data:", newsData.data.message);
    }
    // Debugging: Log the fetched news data to the console
    // This can help in verifying that the data is being fetched correctly
    // and can be used for further processing or display in the UI.
    // @ts-ignore
    console.log(newsData.data);
  }


  useEffect(() => {

    getNewsData()

  }, []);

  return (
    <div className={styles.home}>
      <div className={styles.poster} style={{ backgroundImage: `url('/images/home/poster.svg')` }}>
        <div className={styles.poster_title}>
          {t("home.title" as any)}
        </div>
        <div className={styles.poster_subtitle}>
          {t("home.subtitle" as any)}
        </div>
      </div>

      <div className={styles.news_container}>
        <div className={styles.news_title}>
          {t("home.news" as any)}
        </div>
        <div className={styles.news_list}>
          {
            newsData?.articles.map((item, idx) => (
              idx === 0 ?
                <Card width={820} imgHeight={301} isShowBorder={false} key={item.id}
                  title={i18n.language === 'zh' ? item.titleZh : item.titleEn}
                  // text={i18n.language === 'zh' ? item.contentZh : item.contentEn}
                  text={formatDate(Number(item.createdAt) * 1000)}
                  imgSrc={item.coverUrl} />
                : <Card
                  imgHeight={301}
                  key={item.id}
                  title={i18n.language === 'zh' ? item.titleZh : item.titleEn}
                  // text={i18n.language === 'zh' ? item.contentZh : item.contentEn}
                  text={formatDate(Number(item.createdAt) * 1000)}
                  imgSrc={item.coverUrl}
                />
            ))
          }
        </div>
      </div>

      <div className={styles.news_container}>
        <div className={styles.news_title} style={{ borderBottom: '2px solid #FF6A14', paddingBottom: '12px' }}>
          {t("home.qa" as any)}
        </div>
        <div className={styles.qa_list}>
          {
            [0, 1, 2].map((item) => (
              <div className={styles.qa_item} key={item}>
                <Image width={24} height={24} src="/images/icons/rebot.svg" alt="rebot Icon" className={styles.qa_item_title} style={{ marginTop: '24px' }} />
                <div className={styles.qa_item_content}>
                  <div className={styles.qa_item_q}>
                    <Image width={24} height={24} src="/images/icons/question.svg" alt="q Icon" className={styles.qa_item_title} style={{ marginRight: '16px' }} />
                    {t("home.qaQuestion" as any)}
                  </div>
                  <div className={styles.qa_item_a}>
                    {t("home.qaAnswer" as any)}
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div className={styles.news_container}>
        <div className={styles.news_title} style={{ borderBottom: '2px solid #FF6A14', paddingBottom: '12px' }}>
          {t("home.partner" as any)}
        </div>
        <div className={styles.partner_list}>
          {
            [0, 1, 2, 3, 4, 5, 6].map((item) => (
              <div className={styles.partner_item} key={item}>
              </div>
            ))
          }
        </div>
      </div>

      <div className={styles.poster} style={{ backgroundImage: `url('/images/home/poster-1.svg')` }}>
        <div className={styles.poster_title}>
          {t("home.title" as any)}
        </div>
        <div className={styles.poster_subtitle}>
          {t("home.subtitle" as any)}
        </div>
      </div>

    </div>
  )
}
export const getStaticProps = getLocaleProps(["common"]);