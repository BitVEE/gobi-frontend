import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";

import Card from "@/components/card";
import LoadingImg from "@/components/LoadingImg";
import { NewsAPI } from "@/api";

// This is the main page of the application
// It serves as the entry point for the user interface
// and displays the main content of the application.
import styles from '../styles/home.module.scss'
import { formatDate } from "@/utils/tool";
import { useRouter } from "next/router";


// The main functional component for the home page
// It returns the main layout of the page including the header and main content area.
// The header is imported from the components directory.
export default function Home() {
  const { t, i18n } = useTranslation();
  const [newsData, setNewsData] = useState<API.NewsLisData>();
  const router = useRouter()

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
                <Card
                  key={item.id}
                  title={i18n.language === 'zh' ? item.titleZh : item.titleEn}
                  // text={i18n.language === 'zh' ? item.contentZh : item.contentEn}
                  text={formatDate(Number(item.createdAt) * 1000)}
                  imgSrc={item.coverUrl}
                  link={item.type == 1 ? "/raceInfo/detail?id=" + item.id : "/raceImage/detail?id=" + item.id}
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
            (t("qa.raceQa", { returnObjects: true }) as Array<{ title: string, answer: string }>).map((item: { title: string; answer: string }) => (
              <div className={styles.qa_item} key={item.title} onClick={() => { router.push('/qa/raceQa?title=' + item.title) }}>
                <Image width={24} height={24} src="/images/icons/rebot.svg" alt="rebot Icon" className={styles.qa_item_title} style={{ marginTop: '24px' }} />
                <div className={styles.qa_item_content}>
                  <div className={styles.qa_item_q}>
                    <Image width={24} height={24} src="/images/icons/question.svg" alt="q Icon" className={styles.qa_item_title} style={{ marginRight: '16px' }} />
                    <span>{item.title}</span>
                  </div>
                  <div className={styles.qa_item_a}>
                    {item.answer}
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
            new Array(24).fill(0).map((item, idx) => (
              <div className={styles.partner_item} key={idx}>
                <LoadingImg src={`/images/school/${idx + 1}.png`} style={{ width: '100%', height: '100%' }} width={189} height={189} />
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