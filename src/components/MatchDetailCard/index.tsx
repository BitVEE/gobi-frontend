import Image from 'next/image';
import { useTranslation } from "next-i18next";
import { useState, useEffect, useRef } from "react";
import type { MouseEvent, TouchEvent } from "react";

import styles from './matchDetailCard.module.scss'
import { useRouter } from 'next/router';
import { HomeAPI, ResultAPI } from '@/api';
import { HomeCurrentStateMap, LiveStateMap } from '@/utils/map';


type Props = {
    pageName?: 'home' | 'detail',
    detailToFormat?: (detail: API.HomeCurrentData) => void,
    groupInfo?: API.MatchesGroupInfoType | null;
}


type MediaPanelDataItem = {
    id: string | number;
    title: string;
    subtitle: string;
    buttonText: string;
    onButtonClick: () => void;
    coverUrl: string;
    // 直播类型特有属性
    liveState?: 'notStarted' | 'live' | 'finished';
    liveStartTime?: string;
    liveTimeRange?: string;
}

type MediaPanelProps = {
    type: 'top' | 'bottom1' | 'bottom2' | 'bottom3';
    currentMatchDetail?: API.HomeCurrentData;
    language: string;
    t: (key: string) => string;
    onOpenLiveQrCode: (item: API.HomeLiveItem) => void;
}

type RankingPanelProps = {
    currentMatchDetail?: API.HomeCurrentData;
    language: string;
    t: (key: string) => string;
}

type RankingType = 'personal' | 'team';

type RankingGroup = {
    group: API.MatchesGroupInfoType;
    list: API.ResultRankDetailItem[];
}

const coverUrlList = [
    "/images/title_bg/login_page_bg.png",
    "/images/title_bg/race_info_page_bg.png",
    "/images/title_bg/race_result_page_bg.png",
    "/images/title_bg/race_image_page_bg.png",
    "/images/title_bg/museum.jpg",
    "/images/title_bg/registration.png",
    "/images/title_bg/user_page_bg.png",
]

const MediaPanel = (props: MediaPanelProps) => {
    const router = useRouter();
    const {
        type,
        currentMatchDetail,
        language,
        t,
        onOpenLiveQrCode,
    } = props;
    const [mediaIndex, setMediaIndex] = useState(0);
    const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
    let mediaItems: MediaPanelDataItem[] = [];

    const getLocalizedValue = (item: { titleZh?: string; titleEn?: string } | undefined) => {
        if (!item) return '';
        return item[language === 'zh' ? 'titleZh' : 'titleEn'] || '';
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

    const onOpenVideo = (item: API.NewsListItem) => {
        router.push({
            pathname: '/raceImage/detail',
            query: {
                id: item.id,
            }
        })
    }

    // 直播
    if (
        (type === 'bottom3' && currentMatchDetail?.state === 0)
        || (type === 'bottom3' && currentMatchDetail?.state === 1)
        || (type === 'bottom1' && currentMatchDetail?.state === 2)
        || (type === 'top' && currentMatchDetail?.state === 3)
        || (type === 'bottom1' && currentMatchDetail?.state === 4)
    ) {
        mediaItems = currentMatchDetail.liveList?.map((item, index) => {
            const liveState = LiveStateMap[item.state as keyof typeof LiveStateMap];
            return {
                id: item.id,
                title: getLocalizedValue(item),
                subtitle: '',
                buttonText: t(`liveButtonText.${liveState}`),
                onButtonClick: () => {
                    onOpenLiveQrCode(item);
                },
                coverUrl: coverUrlList[index % coverUrlList.length],
                liveState,
                liveStartTime: formatYearMonthDay(item.liveStartTime),
                liveTimeRange: formatTime(item.liveStartTime) + ' - ' + formatTime(item.liveEndTime),
            }
        }) || [];
    }
    // 视频
    else if (
        (type === "bottom1" && currentMatchDetail?.state === 0)
        || (type === 'bottom1' && currentMatchDetail?.state === 1)
        || (type === 'bottom2' && currentMatchDetail?.state === 4)) {
        mediaItems = currentMatchDetail.videos?.map((item, index) => {
            return {
                id: item.id,
                title: getLocalizedValue(item),
                subtitle: t("video"),
                buttonText: t("view"),
                onButtonClick: () => {
                    onOpenVideo(item);
                },
                coverUrl: item.coverUrl,
            }
        }) || [];
    }
    // 相册
    else if (
        (type === "bottom2" && currentMatchDetail?.state === 0)
        || (type === 'bottom2' && currentMatchDetail?.state === 1)
        || (type === 'bottom3' && currentMatchDetail?.state === 4)) {
        mediaItems = currentMatchDetail.galleries?.map((item, index) => {
            return {
                id: item.id,
                title: getLocalizedValue(item),
                subtitle: t("album"),
                buttonText: t("view"),
                onButtonClick: () => {
                    onOpenVideo(item);
                },
                coverUrl: item.coverUrl,
            }
        }) || [];
    }
    // 参赛人员和团队名单
    else if (type === 'bottom2' && currentMatchDetail?.state === 2) {
        mediaItems = [
            {
                id: 'participantAndTeamRoster',
                title: t("participantAndTeamRoster"),
                subtitle: '',
                buttonText: t("view"),
                onButtonClick: () => {
                    router.push(`/partner/joinSchool`);
                },
                coverUrl: '/images/partner/flags.png',
            }
        ];
    }
    // 离赛前通知和更新
    else if (type === 'bottom3' && currentMatchDetail?.state === 2) {
        mediaItems = [
            {
                id: 'preDepartureNoticesAndUpdates',
                title: t("preDepartureNoticesAndUpdates"),
                subtitle: '',
                buttonText: t("view"),
                onButtonClick: () => {
                    router.push(`/race/notice`);
                },
                coverUrl: "/images/title_bg/registration.png",
            }
        ];
    }
    // 成绩结果
    else if (type === 'top' && currentMatchDetail?.state === 4) {
        mediaItems = [
            ...mediaItems,
            {
                id: 'result',
                title: t("result"),
                subtitle: '',
                buttonText: t("view"),
                onButtonClick: () => {
                    router.push(`/raceResult/personal`);
                },
                coverUrl: "/images/title_bg/race_result_page_bg.png",
            }
        ];
    }

    useEffect(() => {
        setMediaIndex(0);
    }, [type, currentMatchDetail?.state, currentMatchDetail?.liveList?.length])

    useEffect(() => {
        if (mediaItems.length <= 1) return;

        const timer = window.setInterval(() => {
            setMediaIndex((index) => (index + 1) % mediaItems.length);
        }, 5000);

        return () => window.clearInterval(timer);
    }, [mediaItems.length])

    const currentItem: MediaPanelDataItem | null = mediaItems?.[mediaIndex] || mediaItems?.[0] || null;
    if (!currentItem) return null;

    const switchMedia = (direction: 'prev' | 'next') => {
        if (mediaItems.length <= 1) return;
        setMediaIndex((index) => {
            if (direction === 'prev') return (index - 1 + mediaItems.length) % mediaItems.length;
            return (index + 1) % mediaItems.length;
        });
    }

    const handleSwipeStart = (x: number, y: number) => {
        if (mediaItems.length <= 1) return;
        swipeStartRef.current = { x, y };
    }

    const handleSwipeEnd = (x: number, y: number) => {
        if (!swipeStartRef.current || mediaItems.length <= 1) return;

        const distanceX = x - swipeStartRef.current.x;
        const distanceY = y - swipeStartRef.current.y;
        swipeStartRef.current = null;

        if (Math.abs(distanceX) < 50 || Math.abs(distanceX) < Math.abs(distanceY)) return;

        switchMedia(distanceX > 0 ? 'prev' : 'next');
    }

    const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
        const touch = event.touches[0];
        if (!touch) return;
        handleSwipeStart(touch.clientX, touch.clientY);
    }

    const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
        const touch = event.changedTouches[0];
        if (!touch) return;
        handleSwipeEnd(touch.clientX, touch.clientY);
    }

    const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
        handleSwipeStart(event.clientX, event.clientY);
    }

    const handleMouseUp = (event: MouseEvent<HTMLDivElement>) => {
        handleSwipeEnd(event.clientX, event.clientY);
    }

    return (
        <div
            className={styles.media_panel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {currentItem.coverUrl && <img className={styles.media_image} src={currentItem.coverUrl} alt={currentItem.title} />}
            <div className={styles.media_overlay}></div>
            {currentItem.liveState && <div className={`${styles.live_badge} ${styles[`live_badge_${currentItem.liveState}`]}`}>
                <span></span>
                {t(`liveStatus.${currentItem.liveState}`)}
            </div>}
            {currentItem.subtitle && <div className={styles.media_subtitle}>{currentItem.subtitle}</div>}
            <div className={styles.media_content}>
                {currentItem.liveStartTime && <div className={styles.media_date}>{currentItem.liveStartTime}</div>}
                <div className={styles.media_title}>{currentItem.title}</div>
                {currentItem.liveTimeRange && <div className={styles.media_time}>{currentItem.liveTimeRange}</div>}
            </div>
            <div>
                {mediaItems?.length > 1 && <div className={styles.media_dots}>
                    {mediaItems?.map((item, index) => (
                        <button
                            type="button"
                            key={`${item.id}-${index}`}
                            className={index === mediaIndex ? styles.media_dot_active : ''}
                            onClick={() => setMediaIndex(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>}
                <button type="button" className={styles.media_button} onClick={currentItem.onButtonClick}>
                    {currentItem.buttonText}
                </button>
            </div>
        </div>
    )
}

const RankingPanel = (props: RankingPanelProps) => {
    const { currentMatchDetail, language, t } = props;
    const { t: commonT } = useTranslation("common");
    const router = useRouter();
    const [activeType, setActiveType] = useState<RankingType>('personal');
    const [rankingGroups, setRankingGroups] = useState<RankingGroup[] | null>(null);
    const [loading, setLoading] = useState(false);
    const matchId = currentMatchDetail?.rankEntry?.matchId || currentMatchDetail?.currentMatch?.id || 0;
    const groups = currentMatchDetail?.rankEntry?.groups || currentMatchDetail?.currentMatch?.groups || [];

    const getGroupName = (group: API.MatchesGroupInfoType) => {
        return group[language === 'zh' ? 'nameZh' : 'nameEn'] || '';
    }

    useEffect(() => {
        if (!matchId || groups.length === 0) {
            setRankingGroups(null);
            return;
        }

        let ignore = false;

        const getRankingGroups = async () => {
            setLoading(true);
            setRankingGroups(null);
            try {
                const result = await Promise.all(groups.map(async (group: API.MatchesGroupInfoType) => {
                    const rankListRes = await ResultAPI.getResultRankList({
                        matchId,
                        matchGroupId: group.id,
                        type: activeType === 'team' ? 1 : 2,
                        gender: 0,
                    });
                    const rankId = rankListRes.data.code === 0 ? rankListRes.data.data?.rankList?.[0]?.id : 0;

                    if (!rankId) {
                        return { group, list: [] };
                    }

                    const rankDetailRes = await ResultAPI.getResultRankDetail({
                        page: 1,
                        size: 3,
                        matchId,
                        matchGroupId: group.id,
                        rankId,
                    });

                    return {
                        group,
                        list: rankDetailRes.data.code === 0 ? (rankDetailRes.data.data?.list || []).slice(0, 3) : [],
                    };
                }));

                if (!ignore) setRankingGroups(result);
            } catch (error) {
                console.log(error);
                if (!ignore) setRankingGroups([]);
            } finally {
                if (!ignore) setLoading(false);
            }
        }

        getRankingGroups();

        return () => {
            ignore = true;
        }
    }, [activeType, matchId, groups.length])

    if (!matchId || groups.length === 0) return null;

    const showLoading = loading || rankingGroups === null;
    const hasRankingData = rankingGroups?.some(({ list }) => list.length > 0) || false;

    return (
        <div className={styles.ranking_panel}>
            <img className={styles.ranking_bg} src="/images/title_bg/race_result_page_bg.png" alt="" />
            <div className={styles.ranking_overlay}></div>
            <div className={styles.ranking_content}>
                <div className={styles.ranking_tabs}>
                    {(['personal', 'team'] as RankingType[]).map((type) => (
                        <button
                            type="button"
                            key={type}
                            className={activeType === type ? styles.ranking_tab_active : ''}
                            onClick={() => setActiveType(type)}
                        >
                            {t(type === 'personal' ? 'ranking.personalResult' : 'ranking.teamResult')}
                        </button>
                    ))}
                </div>

                {showLoading && (
                    <div className={styles.ranking_state}>
                        <Image
                            src="/images/icons/loading.svg"
                            alt="loading"
                            width={120}
                            height={200}
                            className={styles.ranking_loading_icon}
                        />
                        <div>{commonT('common.loadingText')}</div>
                    </div>
                )}

                {!showLoading && !hasRankingData && (
                    <div className={styles.ranking_state}>
                        <Image
                            src="/images/icons/nodata.svg"
                            alt="nodata"
                            width={365}
                            height={300}
                            className={styles.ranking_nodata_icon}
                        />
                        <div>{t('nodataText')}</div>
                    </div>
                )}

                {!showLoading && hasRankingData && rankingGroups?.length > 0 && (
                    <div className={styles.ranking_groups}>
                        {rankingGroups?.map(({ group, list }) => (
                            group.id && list.length > 0 && <div className={styles.ranking_group} key={group.id}>
                                <div className={styles.ranking_group_title}>{getGroupName(group)}</div>
                                <div className={styles.ranking_list}>
                                    {[0, 1, 2].map((index) => (
                                        <div className={styles.ranking_item} key={`${group.id}-${index}`}>
                                            <span>{index + 1}</span>
                                            <strong>{list[index]?.name || t('nodataText')}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button
                type="button"
                className={styles.ranking_button}
                onClick={() => router.push(`/raceResult/${activeType}`)}
            >
                {t('ranking.viewAllRanking')}
            </button>
        </div>
    )
}

const MatchDetailCard = (props: Props) => {
    const { pageName, detailToFormat, groupInfo } = props;
    const router = useRouter()
    const { t, i18n } = useTranslation("common", { keyPrefix: "registration" });
    const [currentMatchDetail, setCurrentMatchDetail] = useState<API.HomeCurrentData>()
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: '00',
        minutes: '00',
        seconds: '00'
    });
    const [liveQrCodeUrl, setLiveQrCodeUrl] = useState('');

    const getMatchDetail = async () => {
        const res = await HomeAPI.getCurrent()
        if (res.data.code === 0) {
            const data = res.data.data;
            if (data) {
                setCurrentMatchDetail(data)
                if (detailToFormat) {
                    detailToFormat(data)
                }
            }
        }
    }

    const currentMatch = currentMatchDetail?.currentMatch;
    const statusKey = HomeCurrentStateMap[(currentMatchDetail?.state ?? currentMatch?.state ?? 0) as keyof typeof HomeCurrentStateMap] || 'notStarted';
    const isRegistrationOpen = statusKey === 'open';
    const isRegistrationState = ['notStarted', 'open', 'closed'].includes(statusKey);
    const translate = (key: string) => t(key as any) as string;
    const statusLabel = translate(`status.${statusKey}`);
    const actionLabel = translate(`raceStatus.${statusKey}`);
    const previousStatusLabel = translate(`previousStatus.${statusKey}`);
    const currentName = currentMatch?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn'];

    useEffect(() => {
        getMatchDetail()
    }, [])

    useEffect(() => {
        if (statusKey !== 'notStarted' || !currentMatch?.matchDate) return;

        const updateCountdown = () => {
            const targetDate = new Date(currentMatch.matchDate!.replace(/-/g, '/')).getTime();
            const distance = Math.max(targetDate - Date.now(), 0);
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((distance / (1000 * 60)) % 60);
            const seconds = Math.floor((distance / 1000) % 60);

            setCountdown({
                days,
                hours: String(hours).padStart(2, '0'),
                minutes: String(minutes).padStart(2, '0'),
                seconds: String(seconds).padStart(2, '0')
            });
        }

        updateCountdown();
        const timer = window.setInterval(updateCountdown, 1000);
        return () => window.clearInterval(timer);
    }, [currentMatch?.matchDate, statusKey])

    const triggerYouMeng = () => {
        if (!isRegistrationOpen) return;
        router.push(`/race/registration`);
        (window as any)._czc && (window as any)._czc.push(["_trackEvent", "首页", '点击', '立即报名按钮']);
    }

    const handleOpenLiveQrCode = (item: API.HomeLiveItem) => {
        let url = item[i18n.language === 'zh' ? 'qrCodeUrlZh' : 'qrCodeUrlEn'];
        if (url) {
            setLiveQrCodeUrl(url);
        }
    }

    const renderDateBox = (title: string, value?: string) => (
        <div className={`${styles.date_box} ${new Date(value || '').getTime() > new Date().getTime() ? styles.date_box_disabled : ''}`}>
            <div className={styles.date_title}>
                {title}
            </div>
            <div className={styles.date_num}>
                {value}
            </div>
        </div>
    )

    const renderRegistrationInfo = () => (
        <div className={styles.registration_info}>
            <div className={styles.info_main}>
                <div className={styles.title}>
                    <div className={styles.title_name}>
                        {currentName}
                    </div>
                    <div className={styles.title_status}>
                        {statusLabel}
                    </div>
                </div>
                <div className={styles.text_group}>
                    <div className={styles.text_label}>
                        <div>{t('place')}</div>
                        <div>{t('contact')}</div>
                    </div>
                    <div className={styles.text_value}>
                        <div>{currentMatch?.[i18n.language === 'zh' ? 'placeZh' : 'placeEn']}</div>
                        <div>{currentMatch?.contact}</div>
                    </div>
                </div>
                <div className={styles.date}>
                    {renderDateBox(t('startDate'), currentMatch?.startSignUpDate)}
                    <Image className={styles.date_arrow} src='/images/icons/arrow-square-right.svg' width={32} height={32} alt='arrow-square-right'></Image>
                    {renderDateBox(t('endDate'), currentMatch?.endSignUpDate)}
                    <Image className={styles.date_arrow} src='/images/icons/arrow-square-right.svg' width={32} height={32} alt='arrow-square-right'></Image>
                    {renderDateBox(t('matchDate'), currentMatch?.matchDate)}
                </div>
            </div>

            {(pageName === 'home' || !isRegistrationOpen) && <button
                type="button"
                className={`${styles.now_text} ${!isRegistrationOpen ? styles.now_text_disabled : ''}`}
                onClick={() => triggerYouMeng()}
                disabled={!isRegistrationOpen}
            >
                {actionLabel}
            </button>}

            {
                groupInfo && <div className={styles.group}>

                    <div className={styles.group_title}>
                        {t('group')}:
                    </div>

                    <div className={styles.group_name}>
                        {groupInfo?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn'] || translate('nodataText')}
                    </div>
                </div>
            }

            {
                groupInfo && groupInfo?.cost > 0 && <div className={styles.group}>
                    <div className={styles.group_title}>
                        {t('cost')}:
                    </div>

                    <div className={styles.group_name}>
                        {`¥${groupInfo?.cost}/${t('person')}`}
                    </div>
                </div>
            }
        </div>
    )

    const renderCountdown = () => {
        if (statusKey !== 'notStarted' || !currentMatch?.matchDate) return null;

        return (
            <div className={styles.countdown}>
                <div className={styles.countdown_date}>
                    <div>{actionLabel}</div>
                    <strong>{currentMatch?.matchDate}</strong>
                </div>
                <div className={styles.countdown_divider}></div>
                <div className={styles.countdown_list}>
                    <div>
                        <strong>{countdown.days}</strong>
                        <span>{t('day')}</span>
                    </div>
                    <div>
                        <strong>{countdown.hours}</strong>
                        <span>{t('hours')}</span>
                    </div>
                    <div>
                        <strong>{countdown.minutes}</strong>
                        <span>{t('mins')}</span>
                    </div>
                    <div>
                        <strong>{countdown.seconds}</strong>
                        <span>{t('sec')}</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.matchDetailCard}>
            <div className={styles.section_title}>{actionLabel}</div>
            <div className={styles.detail}>
                <div className={styles.hero}>
                    {renderCountdown()}
                    <div className={styles.hero_title}>
                        {currentName}
                    </div>
                </div>
                {isRegistrationState ? renderRegistrationInfo() : (
                    <MediaPanel
                        type="top"
                        currentMatchDetail={currentMatchDetail}
                        language={i18n.language}
                        t={translate}
                        onOpenLiveQrCode={handleOpenLiveQrCode}
                    />
                )}
            </div>
            {pageName !== 'detail' && currentMatchDetail?.state !== 3 && <div className={styles.section_title}>{previousStatusLabel}</div>}
            {pageName !== 'detail' && currentMatchDetail?.state !== 3 && <div className={styles.previous_status_list}>
                <MediaPanel
                    type="bottom1"
                    currentMatchDetail={currentMatchDetail}
                    language={i18n.language}
                    t={translate}
                    onOpenLiveQrCode={handleOpenLiveQrCode}
                />
                <MediaPanel
                    type="bottom2"
                    currentMatchDetail={currentMatchDetail}
                    language={i18n.language}
                    t={translate}
                    onOpenLiveQrCode={handleOpenLiveQrCode}
                />
                <MediaPanel
                    type="bottom3"
                    currentMatchDetail={currentMatchDetail}
                    language={i18n.language}
                    t={translate}
                    onOpenLiveQrCode={handleOpenLiveQrCode}
                />
            </div>}
            {/* 成绩排名 */}
            {pageName !== 'detail' && currentMatchDetail?.state === 3 && (currentMatchDetail?.currentMatch?.geexekMatchId ?? 0) > 0 && <div className={styles.section_title}>{previousStatusLabel}</div>}
            {pageName !== 'detail' && currentMatchDetail?.state === 3 && (currentMatchDetail?.currentMatch?.geexekMatchId ?? 0) > 0 &&
                <RankingPanel
                    currentMatchDetail={currentMatchDetail}
                    language={i18n.language}
                    t={translate} />
            }
            {liveQrCodeUrl && (
                <div className={styles.qr_mask} onClick={() => setLiveQrCodeUrl('')}>
                    <div className={styles.qr_modal} onClick={(event) => event.stopPropagation()}>
                        <img className={styles.qr_image} src={liveQrCodeUrl} alt="live qrcode" />
                    </div>
                </div>
            )}
        </div>
    )
}

export default MatchDetailCard