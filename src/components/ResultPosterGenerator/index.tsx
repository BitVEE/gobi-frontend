import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import styles from "./resultPosterGenerator.module.scss";
import { formatTime } from "@/utils/tool";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { AuthAPI, MatchAPI, ResultAPI, UserMatchDocumentAPI } from "@/api";
import SelectDropdown from "../SelectDropdown";
import { getRankTypeByChinese } from "@/utils/map";
import LoadingImg from "../LoadingImg";
import { useRouter } from "next/router";
import { toPng } from 'html-to-image';

type PosterFieldKey = "rank" | "personalResult" | "personalInfo" | "schoolInfo";
type DocumentListItem = API.UserMatchDocumentItem;
type RankListItem = API.ResultRankListItem;

export interface ResultPosterData {
    athleteName?: string;
    bibNumber?: string;
    rank?: number | string;
    rankName?: string;
    totalTime?: number;
    realTime?: number;
    length?: number; // meters
    matchName?: string;
    groupName?: string;
}

interface ResultPosterGeneratorProps {
    posterImage: string;
}

interface PosterDataState {
    documentList: DocumentListItem[];
    rankList: RankListItem[];
    currentDocument?: DocumentListItem;
    posterData?: API.ResultDetailResult;
    loading: boolean;
    selectedDocumentId?: number;
    selectedRankId?: number;
    setSelectedDocumentId: (id?: number) => void;
    setSelectedRankId: (id?: number) => void;
}

const usePosterData = (hasMatchDocument: boolean): PosterDataState => {
    const [documentList, setDocumentList] = useState<DocumentListItem[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number>();
    const [rankList, setRankList] = useState<RankListItem[]>([]);
    const [selectedRankId, setSelectedRankId] = useState<number>();
    const [posterData, setPosterData] = useState<API.ResultDetailResult>();
    const [loading, setLoading] = useState(false);

    const currentDocument = useMemo(
        () => documentList.find((item) => item.id === selectedDocumentId),
        [documentList, selectedDocumentId],
    );

    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                if (hasMatchDocument) {
                    const res = await UserMatchDocumentAPI.getUserMatchDocumentList();
                    const list = res.data.data?.documentList || [];
                    setDocumentList(list);
                    if (list.length > 0) {
                        setSelectedDocumentId(list[0].id);
                    }
                    return;
                }

                // 没有档案时使用当前赛事列表内容模拟档案列表
                const matchRes = await MatchAPI.getMatchList({ page: 1, size: 10 });
                const matchData = (matchRes.data.data as any)?.matches || [];
                if (!Array.isArray(matchData) || matchData.length === 0) {
                    setDocumentList([]);
                    setSelectedDocumentId(undefined);
                    return;
                }

                const mockDocuments: DocumentListItem[] = matchData
                    .map((match: any) => {
                        const firstGroup = match?.groups?.[0];
                        if (!match?.id || !firstGroup?.id) return null;
                        return {
                            id: Number(firstGroup.id),
                            name: match.nameZh || match.nameEn || "",
                            match: {
                                id: Number(match.id),
                                nameEn: match.nameEn || match.nameZh || "",
                                nameZh: match.nameZh || match.nameEn || "",
                            },
                            matchGroup: {
                                id: Number(firstGroup.id),
                                nameEn: firstGroup.nameEn || firstGroup.nameZh || "",
                                nameZh: firstGroup.nameZh || firstGroup.nameEn || "",
                            },
                            school: {
                                id: 0,
                                nameEn: "",
                                nameZh: "",
                                logoUrl: "/images/school/1.png",
                            },
                            markNumber: "",
                            gender: 1,
                        } as DocumentListItem;
                    })
                    .filter(Boolean) as DocumentListItem[];

                if (!mockDocuments.length) {
                    setDocumentList([]);
                    setSelectedDocumentId(undefined);
                    return;
                }

                setDocumentList(mockDocuments);
                setSelectedDocumentId(mockDocuments[0].id);
            } finally {
                setLoading(false);
            }
        })();
    }, [hasMatchDocument]);

    useEffect(() => {
        if (!currentDocument) {
            setRankList([]);
            setSelectedRankId(undefined);
            return;
        }
        setLoading(true);
        (async () => {
            setLoading(true);
            try {
                const res = await ResultAPI.getResultRankList({
                    matchId: currentDocument.match.id,
                    matchGroupId: currentDocument.matchGroup.id,
                    type: 2,
                    gender: currentDocument.gender == 1 ? 1 : 2,
                });
                const list = res.data.data?.rankList || [];
                setRankList(list);
                if (list.length > 0) {
                    setSelectedRankId(list[0].id);
                } else {
                    setSelectedRankId(undefined);
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [currentDocument]);

    useEffect(() => {
        if (!currentDocument || !selectedRankId) {
            setPosterData(undefined);
            return;
        }
        (async () => {
            setLoading(true);
            try {
                const rankDetail = await ResultAPI.getResultRankDetail({
                    page: 1,
                    size: 1,
                    matchId: currentDocument.match.id,
                    matchGroupId: currentDocument.matchGroup.id,
                    rankId: selectedRankId,
                    keyword: currentDocument.markNumber,
                });
                const list = rankDetail.data.data?.list || [];
                if (list.length === 0) {
                    setPosterData(undefined);
                    return;
                }
                const first = list[0];
                const detailRes = await ResultAPI.getResultDetail({
                    matchId: currentDocument.match.id,
                    id: Number(first.id),
                    rankId: selectedRankId,
                    type: 2,
                });
                const detail = detailRes.data.data;
                if (detail?.totalScore) {
                    setPosterData(detail);
                } else {
                    setPosterData(undefined);
                }
            } catch (error) {
                setPosterData(undefined);
            } finally {
                setLoading(false);
            }
        })();
    }, [currentDocument, selectedRankId]);

    return {
        documentList,
        rankList,
        currentDocument,
        posterData,
        loading,
        selectedDocumentId,
        selectedRankId,
        setSelectedDocumentId,
        setSelectedRankId,
    };
};

const ResultPosterGenerator: React.FC<ResultPosterGeneratorProps> = ({
    posterImage,
}) => {
    const { t, i18n } = useTranslation('common');
    const hasMatchDocument = useSelector(
        (state: RootState) => state.commonSlice.userInfo?.hasMatchDocument || false,
    );
    const hasLogin = useSelector((state: RootState) => state.commonSlice.token !== '' || false);
    const {
        posterData,
        loading,
        documentList,
        rankList,
        currentDocument,
        selectedDocumentId,
        selectedRankId,
        setSelectedDocumentId,
        setSelectedRankId,
    } = usePosterData(hasMatchDocument);

    const [visibleFields, setVisibleFields] = useState<Record<PosterFieldKey, boolean>>({
        rank: true,
        personalResult: true,
        personalInfo: true,
        schoolInfo: true,
    });
    const [introPoster, setIntroPoster] = useState(true);
    const [posterStyle, setPosterStyle] = useState<"scaleCrop" | "fixedRatio" | "original">("scaleCrop");
    const [exporting, setExporting] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [activePanel, setActivePanel] = useState<"controls" | "preview">("controls");
    const posterRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [posterImageUrl, setPosterImageUrl] = useState<string>('');

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const update = () => {
            setIsMobile(mq.matches);
            setActivePanel(mq.matches ? "controls" : "controls");
        };
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        if (Object.values(visibleFields).every((value) => !value)) {
            setIntroPoster(false);
        }
    }, [visibleFields]);

    const toggleField = (key: PosterFieldKey) => {
        setVisibleFields((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const uploadPosterIfNeeded = useCallback(
        async (dataUrl: string) => {
            if (!hasLogin || !posterData) return;
            try {
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const fileName = `${posterData.totalScore.name || "poster"}.png`;
                const file = new File([blob], fileName, { type: "image/png" });
                await AuthAPI.uploadUserPoster(file);
            } catch (error) {
                console.error("upload user poster failed", error);
            }
        },
        [hasLogin, posterData],
    );

    // 生成海报并设置海报图片URL
    const handleGenerateAndSetPosterImageUrl = useCallback(async () => {
        if (!posterRef.current || !posterData) return;
        setExporting(true);
        try {
            const dataUrl = await buildPngWithRetry(posterRef.current);
            setPosterImageUrl(dataUrl);
        } catch (error) {
            console.error("generate poster failed", error);
        } finally {
            setExporting(false);
        }
    }, [posterData, setPosterImageUrl]);

    useEffect(() => {
        if (activePanel === "preview") {
            handleGenerateAndSetPosterImageUrl();
        }
    }, [activePanel, handleGenerateAndSetPosterImageUrl]);

    // 下载并上传海报
    const handleDownloadAndUploadPoster = useCallback(async () => {
        if (!posterImageUrl) return;
        await uploadPosterIfNeeded(posterImageUrl);
        const link = document.createElement("a");
        link.href = posterImageUrl;
        link.download = `${hasMatchDocument ? posterData?.totalScore?.name || "poster" : "poster"}.png`;
        link.click();
    }, [posterImageUrl, hasMatchDocument, posterData, uploadPosterIfNeeded]);

    // 生成海报并显示预览
    const handleGenerateAndShowPreview = useCallback(async (type: "download" | "preview") => {
        setExporting(true);
        if (isMobile) {
            if (type === "preview") {
                setActivePanel("preview");
                return;
            } else if (type === "download") {
                await handleDownloadAndUploadPoster();
                setExporting(false);
                return;
            }
        } else {
            await posterAll()
            setExporting(false);
        }

    }, [handleGenerateAndSetPosterImageUrl, handleDownloadAndUploadPoster, isMobile]);

    // 通用函数：根据 DOM 节点生成 PNG，若小于 500KB 则重试，最终返回 dataUrl
    const buildPngWithRetry = useCallback(
        async (element: HTMLElement): Promise<string> => {
            const MIN_SIZE_BYTES = 500 * 1024;
            const MAX_ATTEMPTS = 10;

            const getPngSizeBytes = (dataUrl: string) => {
                const base64 = dataUrl.split(",")[1] || "";
                return Math.ceil((base64.length * 3) / 4);
            };

            let dataUrl = "";
            let attempts = 0;

            while (attempts < MAX_ATTEMPTS) {
                dataUrl = await toPng(element, {
                    pixelRatio: 2,
                    cacheBust: true,
                    backgroundColor: "transparent",
                });

                const sizeBytes = getPngSizeBytes(dataUrl);
                if (sizeBytes >= MIN_SIZE_BYTES) {
                    break;
                }

                attempts += 1;
            }

            return dataUrl;
        },
        [],
    );

    const posterAll = useCallback(async () => {
        if (!posterRef.current || !posterData) return;
        try {
            const dataUrl = await buildPngWithRetry(posterRef.current);
            await uploadPosterIfNeeded(dataUrl);
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${hasMatchDocument ? posterData?.totalScore?.name || "poster" : "poster"}.png`;
            link.click();
        } catch (error) {
            console.error("generate poster failed", error);
        }
    }, [buildPngWithRetry, posterData, uploadPosterIfNeeded, hasMatchDocument]);


    const posterStyleOptions = [
        {
            key: "scaleCrop" as const,
            labelZh: "缩放裁切",
            labelEn: "Scale & crop",
            icon: "/images/icons/缩放裁切.svg",
        },
        {
            key: "fixedRatio" as const,
            labelZh: "固定比例",
            labelEn: "Fixed ratio",
            icon: "/images/icons/固定比例.svg",
        },
        {
            key: "original" as const,
            labelZh: "原始尺寸",
            labelEn: "Original size",
            icon: "/images/icons/全展示.svg",
        },
    ];

    const labelFor = useCallback(
        (item: { labelZh: string; labelEn: string }) => (i18n.language === "zh" ? item.labelZh : item.labelEn),
        [i18n.language],
    );


    const rankText =
        visibleFields.rank && posterData?.totalScore.rank
            ? `No.${posterData?.totalScore.rank}`
            : undefined;

    const totalTimeText =
        visibleFields.personalResult && posterData?.totalScore.timespan !== undefined
            ? formatTime(Number(posterData.totalScore.timespan || 0))
            : undefined;

    const realTimeText =
        visibleFields.personalResult && posterData?.totalScore.realTimespan !== undefined
            ? formatTime(Number(posterData.totalScore.realTimespan || 0))
            : undefined;

    const bibText = visibleFields.personalResult ? posterData?.totalScore.markNo : undefined;
    // 分组名称
    const groupText = visibleFields.personalResult ? i18n.language === "zh" ? currentDocument?.matchGroup.nameZh || currentDocument?.matchGroup.nameEn || "--" : currentDocument?.matchGroup.nameEn || currentDocument?.matchGroup.nameZh || "--" : undefined;

    const disableGenerate = useMemo(() => {
        if (loading || exporting || !posterData) return true;
        if (!hasMatchDocument && introPoster) return true;
        return false;
    }, [posterData, exporting, loading, hasMatchDocument, introPoster]);

    const displayName = useMemo(() => {
        const name = posterData?.totalScore.name || "";
        if (!name) return "--";
        if (hasMatchDocument) return name;
        if (name.length <= 1) return name;
        return `${name[0]}${"*".repeat(name.length - 1)}`;
    }, [hasMatchDocument, posterData?.totalScore.name]);

    const displayBib = useMemo(() => {
        if (!bibText) return "--";
        if (hasMatchDocument) return bibText;
        if (bibText.length < 3) {
            return "*".repeat(Math.max(1, bibText.length));
        }
        return `${bibText[0]}${"*".repeat(bibText.length - 2)}${bibText[bibText.length - 1]}`;
    }, [hasMatchDocument, bibText]);


    const goToMatchDocument = () => {
        if (!hasLogin) {
            router.push("/login");
        } else {
            router.push("/user");
        }
    };

    const showPreview = !isMobile || activePanel === "preview";
    const showControls = !isMobile || activePanel === "controls";

    return (
        <div className={styles.posterGenerator}>
            {showPreview && (
                <div className={styles.previewWrapper}>
                    <div className={styles.posterPreview} style={{ display: loading ? "none" : "flex" }}>
                        <div className={`${styles.posterCard} ${styles[`posterCard-${posterStyle}`]}`} ref={posterRef}>
                            <div className={styles.hero} style={{ backgroundImage: posterStyle === "scaleCrop" ? `url(${posterImage})` : "" }}>
                                {posterStyle !== "scaleCrop" && <img src={posterImage} className={styles.heroImage} alt="poster" />}
                                <div className={styles.heroOverlay} />
                                {(!visibleFields.schoolInfo || !introPoster) && <div className={styles.qrPlaceholder}>
                                    <div className={styles.qrBox} >
                                        <Image src="/images/icons/website-qr.svg" alt="website" width={60} height={60} />
                                    </div>
                                    <div className={styles.qrHint}>{t("posterGenerator.scanToViewOfficialWebsite")}</div>
                                </div>}
                                <div className={styles.heroTitle}>{i18n.language === "zh" ? currentDocument?.match.nameZh || currentDocument?.match.nameEn || "--" : currentDocument?.match.nameEn || currentDocument?.match.nameZh || "--"}</div>
                            </div>

                            {introPoster && <div className={styles.statRow}>
                                {rankText && (
                                    <div className={`${styles.statItem} ${styles.statRank}`}>
                                        <div className={styles.statValue}>{rankText}</div>
                                        <Image src="/images/icons/ranking.svg" alt="rank" width={26} height={24} />
                                        {/* 当前选中的榜单名称 */}
                                        <div className={styles.statLabel}>
                                            {getRankTypeByChinese(posterData?.rankName || "") ? t(`raceResult.rankList.${getRankTypeByChinese(posterData?.rankName || "")}` as any) as string : posterData?.rankName}
                                        </div>
                                    </div>
                                )}
                                {totalTimeText && (
                                    <div className={`${styles.statItem} ${styles.statGun}`}>
                                        <div className={styles.statValue}>{totalTimeText}</div>
                                        <Image src="/images/icons/timer1.svg" alt="gun time" width={26} height={24} />
                                        <div className={styles.statLabel}>{t("raceResult.raceTime")}</div>
                                    </div>
                                )}
                                {realTimeText && (
                                    <div className={`${styles.statItem} ${styles.statNet}`}>
                                        <div className={styles.statValue}>{realTimeText}</div>
                                        <Image src="/images/icons/timer2.svg" alt="net time" width={26} height={24} />
                                        <div className={styles.statLabel}>{t("raceResult.realTime")}</div>
                                    </div>
                                )}
                            </div>}

                            <div style={{ display: visibleFields.personalInfo && introPoster ? "grid" : "none" }} className={styles.infoRow}>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoValue}>{displayName}</div>
                                    <div className={styles.infoLabel}>{t("raceResult.name")}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoValue}>{posterData?.totalScore.gender === 0 ? t("raceResult.genderList.male") : t("raceResult.genderList.female") || "--"}</div>
                                    <div className={styles.infoLabel}>{t("raceResult.gender")}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    {/* 有档案时显示档案名称，没有档案时替换除了第一个字符和最后一个字符以外的所有字符为*，并显示为*号，如果长度小于3，则显示为*号 */}
                                    <div className={styles.infoValue}>{displayBib}</div>
                                    <div className={styles.infoLabel}>{t("raceResult.number")}</div>
                                </div>
                                <div className={styles.infoItem}>
                                    <div className={styles.infoValue}>{groupText || "--"}</div>
                                    <div className={styles.infoLabel}>{t("raceResult.project")}</div>
                                </div>
                            </div>

                            <div style={{ display: visibleFields.schoolInfo && introPoster ? "flex" : "none" }} className={styles.footerRow}>
                                <div className={styles.footerSchoolLogo}>
                                    <Image
                                        src={documentList.find((item) => item.id === selectedDocumentId)?.school?.logoUrl || ""}
                                        style={{
                                            aspectRatio: 3 / 2,
                                            objectFit: "contain",
                                        }}
                                        width={135}
                                        height={90}
                                        alt={documentList.find((item) => item.id === selectedDocumentId)?.school?.nameEn || ""}
                                    />
                                </div>
                                <div className={styles.qrPlaceholder}>
                                    <div className={styles.qrBox} >
                                        <Image src="/images/icons/website-qr.svg" alt="website" width={60} height={60} />
                                    </div>
                                    <div className={styles.qrHint}>{t("posterGenerator.scanToViewOfficialWebsite")}</div>
                                </div>
                            </div>
                        </div>
                        {posterImageUrl && <div className={styles.posterImageUrl}>
                            <img src={posterImageUrl} alt="poster" />
                        </div>}
                        <div className={styles.previewActions}>
                            <button
                                type="button"
                                className={styles.downloadButton}
                                disabled={disableGenerate}
                                onClick={() => handleGenerateAndShowPreview("download")}
                            >
                                {exporting || loading ? t("common.loadingText") : t("common.downloadPoster")}
                            </button>
                            {isMobile && (
                                <button
                                    type="button"
                                    className={styles.backButton}
                                    onClick={() => {
                                        setActivePanel("controls");
                                        setPosterImageUrl("");
                                    }}
                                >
                                    {t("common.back")}
                                </button>
                            )}
                        </div>
                    </div>
                    {loading && <div className={styles.loading}>
                        <Image src="/images/icons/loading.svg" alt="loading" width={200} height={200} />
                        <div className={styles.loadingText}>{t("common.loadingText")}</div>
                    </div>}
                </div>
            )}

            {showControls && (
                <div className={styles.controls}>
                    <div className={styles.titleRow}>
                        <div className={styles.title}>{t("posterGenerator.title")}</div>
                        <div className={styles.titleUnderline} />
                    </div>
                    {introPoster && !hasMatchDocument && <div className={styles.noDocument} onClick={goToMatchDocument}>
                        <div className={styles.noDocumentText}>{t("posterGenerator.noDocument")}</div>
                        <div className={styles.noDocumentArrow}>
                            <Image src="/images/icons/arrow-right1.svg" alt="no document" width={24} height={24} />
                        </div>
                    </div>}
                    <div className={styles.optionCard}>
                        <div className={styles.optionContent}>
                            <div className={styles.optionTitle}>
                                {t("posterGenerator.intro")}
                            </div>
                            <div className={styles.optionDesc}>
                                {t("posterGenerator.introDesc")}
                            </div>
                        </div>
                        <button
                            type="button"
                            className={`${styles.toggle} ${introPoster ? styles.toggleActive : ""}`}
                            onClick={() => setIntroPoster((prev) => !prev)}
                            aria-pressed={introPoster}
                        >
                            <span className={styles.toggleThumb} />
                        </button>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>{t("posterGenerator.selectStyle")}</div>
                        <div className={styles.styleOptions}>
                            {posterStyleOptions.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    className={`${styles.styleOption} ${posterStyle === item.key ? styles.styleActive : ""}`}
                                    onClick={() => setPosterStyle(item.key)}
                                >
                                    <div className={styles.styleIcon}>
                                        <Image src={item.icon} alt={item.labelZh} width={44} height={44} />
                                    </div>
                                    <div className={styles.styleLabel}>{labelFor(item)}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionLabel}>{t("posterGenerator.selectMatch")}</div>
                        <div className={styles.selectRow}>
                            <SelectDropdown
                                value={selectedDocumentId ?? ""}
                                onChange={(val) => setSelectedDocumentId(Number(val))}
                                options={
                                    documentList.map((item) => ({
                                        label: i18n.language === "zh" ? item.match.nameZh : item.match.nameEn,
                                        value: item.id,
                                    })) || []
                                }
                                placeholder={t("posterGenerator.noMatch")}
                                disabled={!documentList.length || loading}
                                style={{ width: "100%" }}
                            />
                        </div>
                    </div>

                    {introPoster && <div className={styles.section}>
                        <div className={styles.sectionLabel}>
                            {t("posterGenerator.selectInfo")}
                        </div>
                        <div className={styles.infoList}>
                            <div className={styles.infoItem}>
                                <label className={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={visibleFields.rank}
                                        onChange={() => toggleField("rank")}
                                    />
                                </label>
                                <div className={styles.selectRow}>
                                    <SelectDropdown
                                        value={selectedRankId ?? ""}
                                        onChange={(val) => setSelectedRankId(Number(val))}
                                        leftText={t("posterGenerator.rank")}
                                        options={
                                            rankList.map((item) => ({
                                                label: getRankTypeByChinese(item.name) ? t(`raceResult.rankList.${getRankTypeByChinese(item.name)}` as any) as string : item.name,
                                                value: item.id,
                                            })) || []
                                        }
                                        placeholder={t("posterGenerator.noRank")}
                                        disabled={!visibleFields.rank || !rankList.length || loading}
                                        style={{ width: "100%" }}
                                    />
                                </div>
                            </div>

                            <label className={styles.infoItem}>
                                <div className={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={visibleFields.personalResult}
                                        onChange={() => toggleField("personalResult")}
                                    />
                                    <span>{t("posterGenerator.personalResult")}</span>
                                </div>
                            </label>

                            <label className={styles.infoItem}>
                                <div className={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={visibleFields.personalInfo}
                                        onChange={() => toggleField("personalInfo")}
                                    />
                                    <span>{t("posterGenerator.personalInfo")}</span>
                                </div>
                            </label>

                            <label className={styles.infoItem}>
                                <div className={styles.checkboxRow}>
                                    <input
                                        type="checkbox"
                                        checked={visibleFields.schoolInfo}
                                        onChange={() => toggleField("schoolInfo")}
                                    />
                                    <span>{t("posterGenerator.schoolInfo")}</span>
                                </div>
                            </label>
                        </div>
                    </div>}

                    <div className={styles.actions}>
                        <button
                            className={styles.generateButton}
                            disabled={disableGenerate}
                            onClick={() => handleGenerateAndShowPreview("preview")}
                        >
                            {exporting || loading ? t("common.loadingText") : isMobile ? t("common.generatePoster") : t("common.downloadPoster")}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultPosterGenerator;
