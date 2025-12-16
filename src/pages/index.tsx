import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";

import { MatchAPI, NewsAPI } from "@/api";
import { RootState } from "@/redux/store";
import Modal from "@/components/Modal";
import BindProfile from "@/components/BindProfile";

// This is the main page of the application
// It serves as the entry point for the user interface
// and displays the main content of the application.
import styles from '../styles/home.module.scss'
import { useRouter } from "next/router";
import NewsList from "@/components/newList";
import MatchDetailCard from "@/components/MatchDetailCard";
import SchoolList from "@/components/SchoolList";


// The main functional component for the home page
// It returns the main layout of the page including the header and main content area.
// The header is imported from the components directory.
export default function Home() {
  const { t, i18n } = useTranslation();
  const [newsData, setNewsData] = useState<API.NewsLisData>();
  const [loading, setLoading] = useState(false);
  const router = useRouter()
  const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>()
  const [showBindModal, setShowBindModal] = useState<boolean>(false);
  const hasMatchDocument = useSelector((state: RootState) => (state.commonSlice.userInfo?.hasMatchDocument || false));
  const token = useSelector((state: any) => state.commonSlice.token);


  const getMatchInfo = async () => {
    try {
      const res = await MatchAPI.getMatchList({ page: 1, size: 10, isActivate: 1 })
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

  const handleBindSuccess = async () => {
    setShowBindModal(false);
    router.reload();
  };

  useEffect(() => {

    getNewsData()
    getMatchInfo()

  }, []);

  return (
    <div className={styles.home}>
      <div className={styles.poster} style={{ backgroundImage: `url('/images/home/poster.png')` }}>
        {
          token && !hasMatchDocument && (<div className={styles.warning_tips_box} onClick={() => setShowBindModal(true)}>
            <Image width={24} height={24} src="/images/icons/alarm-bell.svg" alt="alarm" className={styles.warning_tips_icon} />
            <div className={styles.warning_tips_text}>{t("home.noBindDocument" as any)}</div>
            <Image width={24} height={24} src="/images/icons/arrow-right1.svg" alt="arrowRight" className={styles.warning_tips_icon} />
          </div>)
        }

        <div className={styles.poster_title}>
          {t("home.title" as any)}
        </div>
        {/* <div className={styles.poster_subtitle}>
          {t("home.subtitle" as any)}
        </div> */}
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
            (t("qa.raceQa", { returnObjects: true }) as unknown as Array<{ theme: string, content: any }>).map((item: { theme: string; content: any }, idx: any) => (
              <div className={styles.qa_item} key={item.theme} onClick={() => { router.push('/qa') }}>
                <Image width={24} height={24} src="/images/icons/rebot.svg" alt="rebot Icon" className={styles.qa_item_title} style={{ marginTop: '24px' }} />
                <div className={styles.qa_item_content}>
                  <div className={styles.qa_item_q}>
                    <Image width={24} height={24} src="/images/icons/question.svg" alt="q Icon" className={styles.qa_item_title} style={{ marginRight: '16px' }} />
                    <span>{item.content[0].title}</span>
                  </div>
                  <div className={styles.qa_item_a}>
                    {item.content[0].answer}
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
          <SchoolList />
        </div>
      </div>

      <div className={styles.poster} style={{ backgroundImage: `url('/images/home/poster-1.png')` }}>
        <div className={styles.poster_title}>
          {t("home.title" as any)}
        </div>
        {/* <div className={styles.poster_subtitle}>
          {t("home.subtitle" as any)}
        </div> */}
      </div>

      <Modal
        isOpen={showBindModal}
        onClose={() => setShowBindModal(false)}
        showCloseButton
        title=""
      >
        <BindProfile
          showSkipButton={false}
          onSubmit={handleBindSuccess}
        />
      </Modal>
    </div>
  )
}
export const getStaticProps = getLocaleProps(["common"]);