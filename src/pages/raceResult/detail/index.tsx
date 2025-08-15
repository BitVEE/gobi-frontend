
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/raceResult.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TableComponent, { TableColumn } from "@/components/Table";
import { useRouter } from "next/router";
import { ResultAPI } from '@/api'
import Image from "next/image";
import { formatTime, formatTime2 } from "@/utils/tool";
import { getCompletionStateByChinese, getRankTypeByChinese } from "@/types/map";
const RaceResultDetail = () => {
    const router = useRouter();
    const { id, matchId, rankId, type } = router.query;
    const { t } = useTranslation("common", { keyPrefix: "raceResult" });
    const [loading, setLoading] = useState<boolean>(false);
    const [personalResultList, setPersonalResultList] = useState<API.ResultCp[]>([]);
    const [teamResultList, setTeamResultList] = useState<API.ResultMember[]>([]);
    const [detail, setDetail] = useState<API.ResultDetailResult>()
    const [averageSpeed, setAverageSpeed] = useState<number>(0);
    const [slowestSpeed, setSlowestSpeed] = useState<number>(0);
    const [fastestSpeed, setFastestSpeed] = useState<number>(0);


    const personalResultColumns: TableColumn[] = [
        {
            title: t("checkInPoint"),
            dataIndex: "cpName",
            key: "cpName",
        },
        {
            title: t("checkInTime"),
            dataIndex: "cpStartTime",
            key: "cpStartTime",
            render: (text: string) => text.split(".")[1],
        },
        {
            title: t("time"),
            dataIndex: "cpTimespan",
            key: "cpTimespan",
            render: (text: string) => formatTime(Number(text)),
        },
        {
            title: t("length"),
            dataIndex: "circleLengthStr",
            key: "circleLengthStr"
        },
        {
            title: t("speed"),
            dataIndex: "speed",
            key: "speed",
        },
    ]
    const teamResultColumns: TableColumn[] = [
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
        },
        {
            title: t("number"),
            dataIndex: "markNo",
            key: "markNo",
        },
        {
            title: t("raceTime"),
            dataIndex: "totalTimespan",
            key: "totalTimespan",
            render: (text: string) => formatTime(Number(text)),
        },
        {
            title: t("length"),
            dataIndex: "totalLength",
            key: "totalLength",
            render: (text) => Number(text) / 1000 + "km",
        },
        {
            title: t("realTime"),
            dataIndex: "totalRealTimespan",
            key: "totalRealTimespan",
            render: (text: string) => formatTime(Number(text)),
        },
        {
            title: t("state"),
            dataIndex: "state",
            key: "state",
            render: (text: string) => {
                return <>{getCompletionStateByChinese(text) ? t(`completionState.${getCompletionStateByChinese(text)}` as any) : text}</>
            }
        },
    ]

    useEffect(() => {
        if (matchId && id && rankId && type) {
            if (loading) {
                return
            }
            setLoading(true);
            ResultAPI.getResultDetail({
                matchId: Number(matchId),
                id: Number(id),
                rankId: Number(rankId),
                type: type == "personal" ? 2 : 1
            }).then(res => {
                setLoading(false);
                setDetail(res.data.data);
                if (type == "personal") {
                    let cpList = res.data.data.memberList[0].segs.flatMap((item) => item.cps);
                    setPersonalResultList(cpList);
                    const speeds = cpList.filter(item => item.speedRaw > 0).map(item => item.speedRaw);
                    const maxSpeed = Math.max(...speeds);
                    const minSpeed = Math.min(...speeds);
                    setFastestSpeed(minSpeed * 60000);
                    setSlowestSpeed(maxSpeed * 60000);
                    let averageSpeed = (Number(res.data.data?.totalScore.realTimespan)) / (Number(res.data.data?.totalScore.length) / 1000)
                    setAverageSpeed(averageSpeed);
                } else if (type == "team") {
                    setTeamResultList(res.data.data.memberList);
                }
            }).finally(() => {
                setLoading(false);
            })
        }
    }, [matchId, id, rankId, type])

    return (
        <div className={styles.raceResult}>
            <PageHeader title={detail?.cmptName || ""} backgroundImage="/images/title_bg/race_result_page_bg.png" />
            {!loading && <div className={styles.raceResultDetailContainer}>
                <div className={styles.raceResultDetailTop}>
                    <div className={styles.raceResultDetailTopBg}></div>
                    <div className={styles.raceResultDetailTopLeft}>
                        <div className={styles.raceResultDetailTopLeftTitle}>
                            {type == "personal" ? formatTime(Number(detail?.totalScore.realTimespan || 0)) : formatTime(Number(detail?.totalScore.timespan || 0))}
                        </div>
                        <div className={styles.raceResultDetailTopLeftSubTitle}>
                            {detail?.cmptName || ""}
                        </div>
                    </div>
                    <div className={styles.raceResultDetailTopRight}>
                        <div className={styles.raceResultDetailTopRightItem}>
                            <div className={styles.raceResultDetailTopRightItemTitle}>No.{detail?.totalScore.rank}</div>
                            <div className={styles.raceResultDetailTopRightItemSubTitle}>
                                {getRankTypeByChinese(detail?.rankName || "") ? t(`rankList.${getRankTypeByChinese(detail?.rankName || "")}` as any) as string : detail?.rankName}
                            </div>
                            <Image className={styles.raceResultDetailTopRightItemIcon} width={20} height={20} src="/images/icons/ranking.svg" alt="clock" />
                        </div>
                        <div className={styles.raceResultDetailTopRightItem}>
                            <div className={styles.raceResultDetailTopRightItemTitle}>{formatTime(Number(detail?.totalScore.timespan || 0))}</div>
                            <div className={styles.raceResultDetailTopRightItemSubTitle}>
                                {type == "personal" ? t("raceTime") : t("totalTime")}
                            </div>
                            <Image className={styles.raceResultDetailTopRightItemIcon} width={20} height={20} src="/images/icons/timer1.svg" alt="clock" />
                        </div>
                        <div className={styles.raceResultDetailTopRightItem}>
                            <div className={styles.raceResultDetailTopRightItemTitle}>
                                {type == "personal" ? formatTime(Number(detail?.totalScore.realTimespan || 0)) : (Number(detail?.totalScore.length) / 1000).toFixed(1) + "km"}
                            </div>
                            <div className={styles.raceResultDetailTopRightItemSubTitle}>
                                {type == "personal" ? t("realTime") : t("totalLength")}
                            </div>
                            <Image className={styles.raceResultDetailTopRightItemIcon} width={20} height={20} src="/images/icons/timer2.svg" alt="clock" />
                        </div>
                    </div>
                </div>
                <div className={styles.raceResultDetailBottom}>
                    <div className={styles.raceResultDetailBottomItem}>
                        <div className={styles.raceResultDetailBottomItemTitle}>
                            {detail?.totalScore.name || ""}
                        </div>
                        <div className={styles.raceResultDetailBottomItemSubTitle}>
                            {type == "personal" ? t("name") : t("teamName")}
                        </div>
                    </div>
                    <div className={styles.raceResultDetailBottomDivider}></div>
                    {type == "personal" && (
                        <>
                            <div className={styles.raceResultDetailBottomItem}>
                                <div className={styles.raceResultDetailBottomItemTitle}>
                                    {detail?.totalScore.gender === 0 ? t("genderList.male") : t("genderList.female")}
                                </div>
                                <div className={styles.raceResultDetailBottomItemSubTitle}>
                                    {t("gender")}
                                </div>
                            </div>
                            <div className={styles.raceResultDetailBottomDivider}></div>
                        </>
                    )}
                    <div className={styles.raceResultDetailBottomItem}>
                        <div className={styles.raceResultDetailBottomItemTitle}>
                            {detail?.totalScore.markNo || ""}
                        </div>
                        <div className={styles.raceResultDetailBottomItemSubTitle}>
                            {t("number")}
                        </div>
                    </div>
                    <div className={styles.raceResultDetailBottomDivider}></div>
                    <div className={styles.raceResultDetailBottomItem}>
                        <div className={styles.raceResultDetailBottomItemTitle}>
                            {detail?.roadName || ""}
                        </div>
                        <div className={styles.raceResultDetailBottomItemSubTitle}>
                            {t("project")}
                        </div>
                    </div>
                    {
                        type == "personal" && (
                            <>
                                <div className={styles.raceResultDetailBottomDivider}></div>
                                <div className={styles.raceResultDetailBottomRight}>
                                    <div className={styles.raceResultDetailBottomRightItem}>
                                        <div
                                            data-after-width="20%"
                                            className={styles.raceResultDetailBottomRightItemTitle}
                                            ref={(el) => {
                                                if (el) {
                                                    const width = el.getAttribute('data-after-width');
                                                    el.style.setProperty('--after-width', width || '0%');
                                                }
                                            }}
                                        >
                                            {formatTime2(slowestSpeed)}
                                        </div>
                                        <div className={styles.raceResultDetailBottomRightItemSubTitle}>
                                            {t("lowestSpeed")}
                                        </div>
                                    </div>
                                    <div className={styles.raceResultDetailBottomRightItem}>
                                        <div
                                            data-after-width="80%"
                                            className={styles.raceResultDetailBottomRightItemTitle}
                                            ref={(el) => {
                                                if (el) {
                                                    const width = el.getAttribute('data-after-width');
                                                    el.style.setProperty('--after-width', width || '0%');
                                                }
                                            }}
                                        >
                                            {formatTime2(fastestSpeed)}
                                        </div>
                                        <div className={styles.raceResultDetailBottomRightItemSubTitle}>
                                            {t("highestSpeed")}
                                        </div>
                                    </div>
                                    <div className={styles.raceResultDetailBottomRightItem}>
                                        <div
                                            data-after-width="50%"
                                            className={styles.raceResultDetailBottomRightItemTitle}
                                            ref={(el) => {
                                                if (el) {
                                                    const width = el.getAttribute('data-after-width');
                                                    el.style.setProperty('--after-width', width || '0%');
                                                }
                                            }}
                                        >
                                            {formatTime2(averageSpeed)}
                                        </div>
                                        <div className={styles.raceResultDetailBottomRightItemSubTitle}>
                                            {t("averageSpeed")}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )
                    }
                </div>
            </div>}
            <div className={styles.raceResultContainer}>
                <div className={styles.raceResultTable}>
                    {type == "personal" && (
                        <TableComponent rowKey='cpId'
                            title={t('segmentDetail')} loading={loading} columns={personalResultColumns} dataSource={personalResultList} />
                    )}
                    {type == "team" && (
                        <TableComponent rowKey='userId'
                            rowClick={(record) => {
                                router.push({
                                    pathname: "/raceResult/detail",
                                    query: {
                                        type: "personal",
                                        matchId: matchId,
                                        id: record.userId,
                                        rankId,
                                    }
                                })
                            }}
                            title={t('teamMember')} loading={loading} columns={teamResultColumns} dataSource={teamResultList} />
                    )}
                </div>
            </div>
        </div>
    )
}

export default RaceResultDetail
export const getStaticProps = getLocaleProps(["common"]);