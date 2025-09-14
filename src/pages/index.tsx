import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";

import LoadingImg from "@/components/LoadingImg";
import { MatchAPI, NewsAPI } from "@/api";

// This is the main page of the application
// It serves as the entry point for the user interface
// and displays the main content of the application.
import styles from '../styles/home.module.scss'
import { useRouter } from "next/router";
import NewsList from "@/components/newList";
import MatchDetailCard from "@/components/MatchDetailCard";


// The main functional component for the home page
// It returns the main layout of the page including the header and main content area.
// The header is imported from the components directory.
export default function Home() {
  const { t, i18n } = useTranslation();
  const [newsData, setNewsData] = useState<API.NewsLisData>();
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>()


  const getMatchInfo = async () => {
    try {
      const res = await MatchAPI.getMatchList({ page: 1, size: 10 })
      if (res.data.code === 0) {
        const data = res.data.data as API.MatchInfoType | null;
        if (data) {
          setCurrentMatchInfo(data.matches[0])
        }

      }
    } catch (err) {
      console.log(err)
    }

  }

  const getNewsData = async () => {
    // This function would typically fetch news data from an API or database.
    // For now, it returns a static array of news items.
    try {
      setLoading(true);
      const newsData = await NewsAPI.getNewsList({
        type: 1,
        page: 1,
        size: 6,
      });
      if (newsData.data.code === 0) {
        // If the API call is successful, set the news data to the state
        setNewsData(newsData.data.data);
      } else {
        // If there is an error, log it to the console
        console.error("Failed to fetch news data:", newsData.data.message);
      }
    } catch (err) {
      console.log(err)
    }
    setLoading(false);
    // Debugging: Log the fetched news data to the console
    // This can help in verifying that the data is being fetched correctly
    // and can be used for further processing or display in the UI.
    // @ts-ignore
    // console.log(newsData.data);
  }


  useEffect(() => {

    getNewsData()
    getMatchInfo()

  }, []);

  return (
    <div className={styles.home}>
      <div className={styles.poster} style={{ backgroundImage: `url('/images/home/poster.png')` }}>
        <div className={styles.poster_title}>
          {t("home.title" as any)}
        </div>
        <div className={styles.poster_subtitle}>
          {t("home.subtitle" as any)}
        </div>
      </div>

      <div className={styles.news_container}>
        <div className={styles.news_title}>
          {t("header.race")}
        </div>
        <div className={styles.news_list}>
          {currentMatchInfo && <MatchDetailCard pageName='home' matchDetail={currentMatchInfo} />}
        </div>
      </div>

      <div className={styles.news_container}>
        <div className={styles.news_title}>
          {t("home.news" as any)}
        </div>
        <div className={styles.news_list}>
          <NewsList
            newsList={newsData?.articles || []}
            loading={loading}
          />
        </div>
      </div>

      <div className={styles.news_container}>
        <div className={styles.news_title} style={{ borderBottom: '2px solid #FF6A14', paddingBottom: '12px' }}>
          {t("home.qa" as any)}
        </div>
        <div className={styles.qa_list}>
          {
            (t("qa.raceQa", { returnObjects: true }) as Array<{ title: string, answer: string }>).map((item: { title: string; answer: string }) => (
              <div className={styles.qa_item} key={item.title} onClick={() => { router.push('/qa') }}>
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
          {t("partner.joinSchool" as any)}
        </div>
        <div className={styles.partner_list}>
          {
            new Array(30).fill(0).map((item, idx) => (
              <div className={styles.partner_item} key={idx}>
                <LoadingImg noPlaceholder src={`/images/school/${idx + 1}.png`} style={{ width: '100%', height: '100%' }} width={189} height={189} />
              </div>
            ))
          }
        </div>
      </div>

      <div className={styles.poster} style={{ backgroundImage: `url('/images/home/poster-1.png')` }}>
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