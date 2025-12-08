import { useTranslation } from "next-i18next";
import styles from './index.module.scss'
import Image from "next/image";
import { formatTime, formatTime2 } from "@/utils/tool";
import { getRankTypeByChinese } from "@/utils/map";
import TableComponent, { TableColumn } from "@/components/Table";

interface RaceResultDetailContentProps {
    loading: boolean;
    detail?: API.ResultDetailResult;
    type: "personal" | "team" | string | string[];
    locale?: string;
    matchNameZh?: string | string[] | undefined;
    matchNameEn?: string | string[] | undefined;
    groupNameZh?: string | string[] | undefined;
    groupNameEn?: string | string[] | undefined;
    averageSpeed: number;
    slowestSpeed: number;
    fastestSpeed: number;
    personalResultList: API.ResultCp[];
    teamResultList: API.ResultMember[];
    certificateImageUrl: string;
    personalResultColumns: TableColumn[];
    teamResultColumns: TableColumn[];
}


const RaceResultDetailContent = ({
    loading,
    detail,
    type,
    locale = "zh",
    matchNameZh,
    matchNameEn,
    groupNameZh,
    groupNameEn,
    averageSpeed,
    slowestSpeed,
    fastestSpeed,
    personalResultList,
    teamResultList,
    certificateImageUrl,
    personalResultColumns,
    teamResultColumns,
}: RaceResultDetailContentProps) => {
    const { t } = useTranslation("common", { keyPrefix: "raceResult" });

    return (
        <div className={styles.raceResultDetailContent}>
            {!loading && detail !== undefined && (
                <div className={styles.raceResultDetailContainer}>
                    <div className={styles.raceResultDetailTop}>
                        <div className={styles.raceResultDetailTopBg}></div>
                        <div className={styles.raceResultDetailTopLeft}>
                            <div className={styles.raceResultDetailTopLeftTitle}>
                                {type == "personal" ? formatTime(Number(detail?.totalScore.realTimespan || 0)) : formatTime(Number(detail?.totalScore.timespan || 0))}
                            </div>
                            <div className={styles.raceResultDetailTopLeftSubTitle}>
                                {locale === "zh" ? matchNameZh as string : matchNameEn as string || ""}
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
                                {locale === "zh" ? groupNameZh as string : groupNameEn as string || ""}
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
                </div>
            )}
            <div className={styles.raceResultDetailTable}>
                {type == "personal" && (
                    <TableComponent rowKey='cpId'
                        title={t('segmentDetail')} loading={loading} columns={personalResultColumns} dataSource={personalResultList} />
                )}
                {type == "team" && (
                    <TableComponent rowKey='userId' title={t('teamMember')} loading={loading} columns={teamResultColumns} dataSource={teamResultList} />
                )}
            </div>
            {type == "personal" && certificateImageUrl && !loading && (
                <div className={styles.certificateContainer}>
                    <img src={certificateImageUrl} alt="Certificate" />
                </div>
            )}
        </div>
    );
};

export default RaceResultDetailContent;

