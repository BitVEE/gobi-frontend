
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/raceResult.module.scss'
import stylesContent from '@/components/RaceResultDetailContent/index.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TableComponent, { TableColumn } from "@/components/Table";
import { useRouter } from "next/router";
import { ResultAPI } from '@/api'
import { formatTime } from "@/utils/tool";
import { getCompletionStateByChinese } from "@/utils/map";
import RaceResultDetailContent from "@/components/RaceResultDetailContent";
const RaceResultDetail = () => {
    const router = useRouter();
    const { locale } = router;
    const { id, matchId, rankId, type, matchNameEn, matchNameZh, groupNameEn, groupNameZh } = router.query;
    const { t } = useTranslation("common", { keyPrefix: "raceResult" });
    const [loading, setLoading] = useState<boolean>(false);
    const [personalResultList, setPersonalResultList] = useState<API.ResultCp[]>([]);
    const [teamResultList, setTeamResultList] = useState<API.ResultMember[]>([]);
    const [detail, setDetail] = useState<API.ResultDetailResult>()
    const [averageSpeed, setAverageSpeed] = useState<number>(0);
    const [slowestSpeed, setSlowestSpeed] = useState<number>(0);
    const [fastestSpeed, setFastestSpeed] = useState<number>(0);
    const [markNumber, setMarkNumber] = useState<string>()
    const [certificateImageUrl, setCertificateImageUrl] = useState('');


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
            render: (text: string, record: API.ResultMember) => {
                return <div className={stylesContent.state}>
                    {(getCompletionStateByChinese(text) ? t(`completionState.${getCompletionStateByChinese(text)}` as any) : text) as string}
                    <button className={stylesContent.state_button} onClick={() => {
                        router.push({
                            pathname: "/raceResult/detail",
                            query: {
                                type: "personal",
                                matchId: matchId,
                                id: record.userId,
                                rankId,
                                matchNameEn,
                                matchNameZh,
                                groupNameEn,
                                groupNameZh,
                            }
                        })
                    }}>{t("detail")}</button>
                </div>
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
                    setMarkNumber(res.data.data.memberList[0].markNo || "");
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

    useEffect(() => {
        if (markNumber && matchId && type == "personal") {
            const imageUrl = `${window.location.origin}/api/v1/match/certificate?matchId=${matchId}&markNumber=${markNumber}`
            setCertificateImageUrl(imageUrl);
        }
    }, [markNumber])

    return (
        <div className={styles.raceResult}>
            <PageHeader title={locale === "zh" ? matchNameZh as string : matchNameEn as string || ""} backgroundImage="/images/title_bg/race_result_page_bg.png" />
            <div className={styles.raceResultDetailWrapper}>
                <RaceResultDetailContent
                    loading={loading}
                    detail={detail}
                    type={type || ""}
                    locale={locale}
                    matchNameZh={matchNameZh}
                    matchNameEn={matchNameEn}
                    groupNameZh={groupNameZh}
                    groupNameEn={groupNameEn}
                    averageSpeed={averageSpeed}
                    slowestSpeed={slowestSpeed}
                    fastestSpeed={fastestSpeed}
                    personalResultList={personalResultList}
                    teamResultList={teamResultList}
                    certificateImageUrl={certificateImageUrl}
                    personalResultColumns={personalResultColumns}
                    teamResultColumns={teamResultColumns}
                />
            </div>

        </div>
    )
}

export default RaceResultDetail
export const getStaticProps = getLocaleProps(["common"]);