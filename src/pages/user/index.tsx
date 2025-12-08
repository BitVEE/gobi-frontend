import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/user.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import SelectDropdown from "@/components/SelectDropdown";
import { AuthAPI, ResultAPI, UserMatchDocumentAPI } from "@/api";
import TableComponent from "@/components/Table";
import { useRouter } from "next/router";
import { getRankTypeByChinese, SignupStateMap } from "@/utils/map";
import { formatTime } from "@/utils/tool";
import RaceResultDetailContent from "@/components/RaceResultDetailContent";
import TagSelector from "@/components/TagSelector";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Modal from "@/components/Modal";
import BindProfile from "@/components/BindProfile";
const User = () => {
    const { t } = useTranslation("common", { keyPrefix: "user" });
    const { t: tRaceResult } = useTranslation("common", { keyPrefix: "raceResult" });
    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>('myResult');
    const [selectedTag, setSelectedTag] = useState<number>(0);
    const [signupHistory, setSignupHistory] = useState<API.SignupHistoryItem[]>([]);
    const [filteredSignupHistory, setFilteredSignupHistory] = useState<API.SignupHistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { locale } = useRouter();
    const router = useRouter()
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    // 从本地获取个人信息
    const hasMatchDocument = useSelector((state: RootState) => (state.commonSlice.userInfo?.hasMatchDocument || false));
    const [resultLoading, setResultLoading] = useState<boolean>(false);

    // 个人赛事档案
    const [documentList, setDocumentList] = useState<API.UserMatchDocumentItem[]>([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState<number>();

    // 榜单 & 成绩
    const [rankList, setRankList] = useState<API.ResultRankListItem[]>([]);
    const [selectedRankId, setSelectedRankId] = useState<number>();
    const [resultDetail, setResultDetail] = useState<API.ResultDetailResult>();
    const [cpList, setCpList] = useState<API.ResultCp[]>([]);
    const [averageSpeed, setAverageSpeed] = useState<number>(0);
    const [slowestSpeed, setSlowestSpeed] = useState<number>(0);
    const [fastestSpeed, setFastestSpeed] = useState<number>(0);
    const [certificateImageUrl, setCertificateImageUrl] = useState('');
    const [markNumber, setMarkNumber] = useState<string>();
    const [showBindModal, setShowBindModal] = useState<boolean>(false);


    const goToPay = (e: any) => {
        router.push({
            pathname: '/race/pay',
            query: {
                matchDetail: JSON.stringify(e.matchDetail),
                groupInfo: JSON.stringify(e.matchGroupDetail),
                registrationId: e.id
            }
        })
    }

    useEffect(() => {
        if (selectedSubTitle !== "myEnroll") {
            return
        }
        setLoading(true);
        AuthAPI.getSignupHistory({
            page: page,
            size: 10,
        }).then((res) => {
            if (res.data.code === 0) {
                setTotal(res.data.data.total);
                setSignupHistory(res.data.data.signUpList);
                setFilteredSignupHistory(res.data.data.signUpList.filter((item) => (Number(selectedTag) == 0 || item.state === Number(selectedTag))));
            } else {
                setSignupHistory([]);
            }
        }).finally(() => {
            setLoading(false);
        })
    }, [page, selectedSubTitle])

    useEffect(() => {
        if (selectedTag === 0) {
            setFilteredSignupHistory(signupHistory);
        } else {
            setFilteredSignupHistory(signupHistory.filter((item) => item.state === Number(selectedTag)));
        }
    }, [selectedTag])

    const signupColumns = [
        { title: t('name'), dataIndex: 'name', key: 'name', render: (text: string, record: API.SignupHistoryItem) => <div className={styles.name}>{locale == "en" ? record.enName : text}</div> },
        { title: t('raceName'), dataIndex: 'matchDetail', key: 'matchDetail', render: (text: any) => <div className={styles.name}>{locale == "en" ? text.nameEn : text.nameZh}</div> },
        { title: t('group'), dataIndex: 'matchGroupDetail', key: 'matchGroupDetail', render: (text: any) => <div className={styles.name}>{locale == "en" ? text.nameEn : text.nameZh}</div> },
        { title: t('status'), dataIndex: 'state', key: 'state', render: (text: string, record: API.SignupHistoryItem) => <div onClick={() => Number(text) == 1 && goToPay(record)} className={styles.status} style={{ color: Number(text) == 1 ? '#22A16A' : '#000000', textDecoration: Number(text) == 1 ? 'underline' : 'none' }}>{t(SignupStateMap[Number(text)])}</div> },
    ];

    // 获取个人赛事档案
    useEffect(() => {
        if (selectedSubTitle !== "myResult" || !hasMatchDocument) {
            return
        }
        setResultLoading(true);
        UserMatchDocumentAPI.getUserMatchDocumentList().then((res) => {
            const list = res.data.data?.documentList || [];
            if (list.length > 0) {
                setDocumentList(list);
                setSelectedDocumentId(list[0].id);
            }
        }).finally(() => {
            setResultLoading(false);
        })
    }, [selectedSubTitle]);

    const currentDocument = documentList.find((item) => item.id === selectedDocumentId);

    // 根据档案获取榜单列表
    useEffect(() => {
        if (selectedSubTitle !== "myResult") {
            return
        }
        const fetchRankList = async () => {
            if (!currentDocument) {
                setRankList([]);
                setSelectedRankId(undefined);
                return;
            }
            setResultLoading(true);
            try {
                const res = await ResultAPI.getResultRankList({
                    matchId: currentDocument.match.id,
                    matchGroupId: currentDocument.matchGroup.id,
                    type: 2, // 个人榜
                    gender: currentDocument.gender == 1 ? 1 : 2,
                });
                if (res.data.code === 0 && res.data.data.rankList?.length > 0) {
                    setRankList(res.data.data.rankList);
                    setSelectedRankId(res.data.data.rankList[0].id);
                } else {
                    setResultLoading(false);
                    setRankList([]);
                    setSelectedRankId(undefined);
                }
            } catch (error) {
                setRankList([]);
                setSelectedRankId(undefined);
                setResultLoading(false);
            }
        };
        fetchRankList();
    }, [selectedDocumentId]);

    // 根据榜单获取个人成绩（用档案的号码作为关键词），拿到第一条后请求成绩详情
    useEffect(() => {
        if (selectedSubTitle !== "myResult") {
            return
        }
        const fetchPersonalResult = async () => {
            if (!currentDocument || !selectedRankId) {
                setResultDetail(undefined);
                return;
            }
            setResultLoading(true);
            try {
                const res = await ResultAPI.getResultRankDetail({
                    page: 1,
                    size: 1,
                    matchId: currentDocument.match.id,
                    matchGroupId: currentDocument.matchGroup.id,
                    rankId: selectedRankId,
                    keyword: currentDocument.markNumber,
                });
                if (res.data.code === 0) {
                    const list = res.data.data.list || [];
                    if (list.length > 0) {
                        const first = list[0];
                        // 获取成绩详情
                        const detailRes = await ResultAPI.getResultDetail({
                            matchId: currentDocument.match.id,
                            id: Number(first.id),
                            rankId: selectedRankId,
                            type: 2,
                        });
                        if (detailRes.data.code === 0) {
                            const detailData = detailRes.data.data;
                            setResultDetail(detailData);
                            setMarkNumber(detailData.totalScore.markNo || "");
                            // 计算分段与速度
                            try {
                                const cps = detailData.memberList[0].segs.flatMap((item) => item.cps);
                                setCpList(cps);
                                const speeds = cps.filter(item => item.speedRaw > 0).map(item => item.speedRaw);
                                if (speeds.length > 0) {
                                    const maxSpeed = Math.max(...speeds);
                                    const minSpeed = Math.min(...speeds);
                                    setFastestSpeed(minSpeed * 60000);
                                    setSlowestSpeed(maxSpeed * 60000);
                                } else {
                                    setFastestSpeed(0);
                                    setSlowestSpeed(0);
                                }
                                const avgSpeed = (Number(detailData?.totalScore.realTimespan)) / (Number(detailData?.totalScore.length) / 1000)
                                setAverageSpeed(avgSpeed);
                            } catch (error) {
                                setCpList([]);
                            }
                        } else {
                            setResultDetail(undefined);
                        }
                    } else {
                        setResultDetail(undefined);
                    }
                } else {
                    setResultDetail(undefined);
                }
            } catch (error) {
                setResultDetail(undefined);
            } finally {
                setResultLoading(false);
            }
        };
        fetchPersonalResult();
    }, [selectedRankId]);

    // 证书图片地址
    useEffect(() => {
        if (markNumber && currentDocument) {
            const imageUrl = `${window.location.origin}/api/v1/match/certificate?matchId=${currentDocument.match.id}&markNumber=${markNumber}`
            setCertificateImageUrl(imageUrl);
        }
    }, [markNumber, currentDocument]);

    const handleBindSuccess = async () => {
        setShowBindModal(false);
        router.reload();
    };


    return (
        <div className={styles.user}>
            <PageHeader title={t("title")} backgroundImage="/images/title_bg/user_page_bg.png" />
            <div className={styles.userContainer}>
                <TagSelector
                    tags={[
                        { title: t('myEnroll'), value: 'myEnroll' },
                        { title: t('myResult'), value: 'myResult' },
                    ]}
                    styleType='text'
                    selectedValue={selectedSubTitle}
                    onChange={(value) => { setSelectedSubTitle(value); }}
                />
                {selectedSubTitle === 'myEnroll' && (
                    <div className={styles.my_enroll}>
                        <TagSelector
                            tags={[
                                { title: t('all'), value: 0 },
                                { title: t('waitPay'), value: 1 },
                                { title: t('paySuccess'), value: 2 },
                                { title: t('refund'), value: 3 },
                                { title: t('payFail'), value: 4 },
                            ]}
                            styleType='outlined'
                            selectedValue={selectedTag}
                            onChange={(value) => { setSelectedTag(Number(value)); }}
                        />
                        <div className={styles.my_enroll_table}>
                            <TableComponent rowKey='id' pagination={{
                                total: total,
                                current: page,
                                pageSize: 10,
                            }} loading={loading} columns={signupColumns} dataSource={filteredSignupHistory} setPage={setPage} />
                        </div>
                        <div className={styles.divider} />
                    </div>
                )}
                {selectedSubTitle === 'myResult' && hasMatchDocument && (
                    <div className={styles.my_result}>
                        <div className={styles.resultFilters}>
                            <SelectDropdown
                                id="documentSelect"
                                disabled={resultLoading || documentList.length === 0}
                                value={selectedDocumentId ?? ''}
                                options={documentList.map((item) => ({
                                    value: item.id,
                                    label: locale === "en" ? item.match.nameEn : item.match.nameZh,
                                }))}
                                onChange={(value) => {
                                    setSelectedDocumentId(Number(value));
                                    setSelectedRankId(0);
                                }
                                }
                                leftIconSrc="/images/icons/calendar.svg"
                                placeholder={t('raceName')}
                            />
                            <SelectDropdown
                                id="rankSelect"
                                disabled={resultLoading || rankList.length === 0}
                                value={selectedRankId ?? ''}
                                options={rankList.map((item) => ({
                                    value: item.id,
                                    label: getRankTypeByChinese(item.name) ? tRaceResult(`rankList.${getRankTypeByChinese(item.name)}` as any) as string : item.name,
                                }))}
                                onChange={(value) => setSelectedRankId(Number(value))}
                                placeholder={tRaceResult('rank')}
                            />
                        </div>
                        <RaceResultDetailContent
                            loading={resultLoading}
                            detail={resultDetail}
                            type="personal"
                            locale={locale}
                            matchNameZh={currentDocument?.match.nameZh}
                            matchNameEn={currentDocument?.match.nameEn}
                            groupNameZh={currentDocument?.matchGroup.nameZh}
                            groupNameEn={currentDocument?.matchGroup.nameEn}
                            averageSpeed={averageSpeed}
                            slowestSpeed={slowestSpeed}
                            fastestSpeed={fastestSpeed}
                            personalResultList={cpList}
                            teamResultList={[]}
                            certificateImageUrl={certificateImageUrl}
                            personalResultColumns={[
                                {
                                    title: tRaceResult("checkInPoint"),
                                    dataIndex: "cpName",
                                    key: "cpName",
                                },
                                {
                                    title: tRaceResult("checkInTime"),
                                    dataIndex: "cpStartTime",
                                    key: "cpStartTime",
                                    render: (text: string) => text.split(".")[1],
                                },
                                {
                                    title: tRaceResult("time"),
                                    dataIndex: "cpTimespan",
                                    key: "cpTimespan",
                                    render: (text: string) => formatTime(Number(text)),
                                },
                                {
                                    title: tRaceResult("length"),
                                    dataIndex: "circleLengthStr",
                                    key: "circleLengthStr"
                                },
                                {
                                    title: tRaceResult("speed"),
                                    dataIndex: "speed",
                                    key: "speed",
                                },
                            ]}
                            teamResultColumns={[]}
                        />
                    </div>
                )}
                {selectedSubTitle === 'myResult' && !hasMatchDocument &&
                    <div className={styles.bindEmpty}>
                        <img src="/images/icons/nodata.svg" alt={t('noBindDocument')} className={styles.bindImage} />
                        <p className={styles.bindText}>{t('noBindDocument')}</p>
                        <button className={styles.bindButton} onClick={() => setShowBindModal(true)}>
                            {t('bindDocument')}
                        </button>
                    </div>
                }
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

export default User
export const getStaticProps = getLocaleProps(["common"]);