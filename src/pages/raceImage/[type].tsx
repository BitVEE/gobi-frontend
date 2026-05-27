import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/raceImage.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { useRouter } from "next/router";
import { GetStaticPaths } from "next";
import { MatchAPI, NewsAPI } from '@/api'
import NewsList from "@/components/newList";
import SelectDropdown from "@/components/SelectDropdown";
import { LiveStateMap } from "@/utils/map";

const coverUrlList = [
    "/images/title_bg/login_page_bg.png",
    "/images/title_bg/race_info_page_bg.png",
    "/images/title_bg/race_result_page_bg.png",
    "/images/title_bg/race_image_page_bg.png",
    "/images/title_bg/museum.jpg",
    "/images/title_bg/registration.png",
    "/images/title_bg/user_page_bg.png",
]

const RaceImage = () => {
    const router = useRouter();
    const { type } = router.query;
    const { t, i18n } = useTranslation("common");
    const [loading, setLoading] = useState<boolean>(false);
    const [liveLoading, setLiveLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [newsList, setNewsList] = useState<API.NewsListItem[]>([]);
    const [matchList, setMatchList] = useState<API.MatchesListType[]>([]);
    const [selectedMatchId, setSelectedMatchId] = useState<number>(0);
    const [liveList, setLiveList] = useState<API.HomeLiveItem[]>([]);
    const [liveQrCodeUrl, setLiveQrCodeUrl] = useState<string>('');

    useEffect(() => {
        if (type == 'selectedAlbum' || type == 'selectedVideo') {
            if (page !== 1) {
                setPage(1);
            } else {
                getNewsList();
            }
        } else if (type == 'selectedLive') {
            getMatchList();
        } else {
            router.push({
                pathname: router.pathname,
                query: {
                    type: 'selectedAlbum',
                }
            })
        }
    }, [type]);

    useEffect(() => {
        if (page !== 0 && (type == 'selectedAlbum' || type == 'selectedVideo')) {
            getNewsList();
        }
    }, [page]);

    useEffect(() => {
        if (type == 'selectedLive' && selectedMatchId) {
            getMatchLiveList(selectedMatchId);
        }
    }, [selectedMatchId, type]);



    const getNewsList = () => {
        if (loading) {
            return;
        }
        setNewsList([]);
        setTotal(0);
        setLoading(true);
        NewsAPI.getNewsList({
            page: page,
            size: 9,
            type: type == 'selectedAlbum' ? 2 : type == 'selectedVideo' ? 3 : 0,
        }).then((res) => {
            setNewsList(res.data.data.articles);
            setTotal(res.data.data.total);
            setLoading(false);
        }).catch((err) => {
            setLoading(false);
        })
    }

    const getMatchList = () => {
        if (liveLoading) {
            return;
        }
        setLiveLoading(true);
        setLiveList([]);
        MatchAPI.getMatchList({
            page: 1,
            size: 100,
        }).then((res) => {
            if (res.data.code === 0) {
                const matches = res.data.data?.matches || [];
                setMatchList(matches);
                setSelectedMatchId((currentId) => {
                    if (currentId && matches.some((item) => item.id === currentId)) {
                        return currentId;
                    }
                    return matches[0]?.id || 0;
                });
                if (matches.length === 0) {
                    setLiveList([]);
                }
            }
        }).catch((err) => {
            console.log(err);
            setMatchList([]);
            setSelectedMatchId(0);
            setLiveList([]);
        }).finally(() => {
            setLiveLoading(false);
        })
    }

    const getMatchLiveList = (matchId: number) => {
        setLiveLoading(true);
        setLiveList([]);
        MatchAPI.getMatchLiveList({
            matchId,
        }).then((res) => {
            if (res.data.code === 0) {
                setLiveList(res.data.data?.liveList || []);
            } else {
                setLiveList([]);
            }
        }).catch((err) => {
            console.log(err);
            setLiveList([]);
        }).finally(() => {
            setLiveLoading(false);
        })
    }

    const getLocalizedMatchName = (item: API.MatchesListType) => {
        return item[i18n.language === 'zh' ? 'nameZh' : 'nameEn'] || item.nameZh || item.nameEn || '';
    }

    const getLocalizedLiveTitle = (item: API.HomeLiveItem) => {
        return item[i18n.language === 'zh' ? 'titleZh' : 'titleEn'] || item.titleZh || item.titleEn || '';
    }

    const formatYearMonthDay = (date?: string | number) => {
        if (!date) return '';
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return String(date);
        return `${String(parsedDate.getUTCFullYear())}.${String(parsedDate.getUTCMonth() + 1).padStart(2, '0')}.${String(parsedDate.getUTCDate()).padStart(2, '0')}`;
    }

    const formatTime = (date?: string) => {
        if (!date) return '';
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return '';
        return `${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}`;
    }

    const handleOpenLiveQrCode = (item: API.HomeLiveItem) => {
        const url = item[i18n.language === 'zh' ? 'qrCodeUrlZh' : 'qrCodeUrlEn'];
        if (url) {
            setLiveQrCodeUrl(url);
        }
    }

    const renderLiveList = () => {
        if (liveLoading) {
            return <div className={styles.liveEmpty}>{t('common.loadingText')}</div>;
        }

        if (liveList.length === 0) {
            return <div className={styles.liveEmpty}>{t('common.nodataText')}</div>;
        }

        return (
            <div className={styles.liveGrid}>
                {liveList.map((item, index) => {
                    const liveState = LiveStateMap[item.state as keyof typeof LiveStateMap] || 'notStarted';
                    return (
                        <div className={styles.liveCard} key={item.id}>
                            <img className={styles.liveImage} src={coverUrlList[index % coverUrlList.length]} alt={getLocalizedLiveTitle(item)} />
                            <div className={styles.liveOverlay}></div>
                            <div className={`${styles.liveBadge} ${styles[`liveBadge_${liveState}`]}`}>
                                <span></span>
                                {t(`registration.liveStatus.${liveState}` as any)}
                            </div>
                            <div className={styles.liveContent}>
                                <div className={styles.liveDate}>{formatYearMonthDay(item.liveStartTime)}</div>
                                <div className={styles.liveTitle}>{getLocalizedLiveTitle(item)}</div>
                                <div className={styles.liveTime}>{`${formatTime(item.liveStartTime)} - ${formatTime(item.liveEndTime)}`}</div>
                            </div>
                            <button type="button" className={styles.liveButton} onClick={() => handleOpenLiveQrCode(item)}>
                                {t(`registration.liveButtonText.${liveState}` as any)}
                            </button>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className={styles.raceImage}>
            <PageHeader title={t("header.raceImage")} backgroundImage="/images/title_bg/race_image_page_bg.png" />
            <div className={styles.raceImageContainer}>
                <TagSelector
                    tags={[
                        { title: t('header.raceImageList.selectedAlbum'), value: 'selectedAlbum' },
                        { title: t('header.raceImageList.selectedVideo'), value: 'selectedVideo' },
                        { title: t('header.raceImageList.selectedLive'), value: 'selectedLive' },
                    ]}
                    styleType='text'
                    selectedValue={type as string}
                    loading={loading || liveLoading}
                    onChange={(value) => {
                        router.push({
                            pathname: router.pathname,
                            query: {
                                type: value,
                            }
                        })
                    }}
                />
                <div className={styles.raceImageContent}>
                    {type === 'selectedLive' ? (
                        <div className={styles.liveSection}>
                            <div className={styles.liveToolbar}>
                                <SelectDropdown
                                    value={selectedMatchId}
                                    options={matchList.map((item) => ({
                                        label: getLocalizedMatchName(item),
                                        value: item.id || 0,
                                    }))}
                                    disabled={liveLoading || matchList.length === 0}
                                    onChange={(value) => setSelectedMatchId(Number(value))}
                                    placeholder={t('common.nodataText')}
                                    style={{ width: 360 }}
                                />
                            </div>
                            {renderLiveList()}
                        </div>
                    ) : (
                        <NewsList
                            fromPage="青戈映像页面"
                            fromPageLabel={`${type === 'selectedAlbum' ? '精选相册' : '精选视频'}卡片`}
                            newsList={newsList}
                            loading={loading}
                            page={page}
                            total={total}
                            onPageChange={(page) => {
                                setPage(page);
                            }}
                        />
                    )}
                </div>
            </div>
            {liveQrCodeUrl && (
                <div className={styles.qrMask} onClick={() => setLiveQrCodeUrl('')}>
                    <div className={styles.qrModal} onClick={(event) => event.stopPropagation()}>
                        <img className={styles.qrImage} src={liveQrCodeUrl} alt="live qrcode" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default RaceImage
export const getStaticPaths: GetStaticPaths = async () => ({
    paths: [],
    fallback: 'blocking',
});
export const getStaticProps = getLocaleProps(["common"]);