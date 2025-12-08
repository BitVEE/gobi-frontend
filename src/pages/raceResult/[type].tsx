import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/raceResult.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import TableComponent, { TableColumn } from "@/components/Table";
import { useRouter } from "next/router";
import { GetStaticPaths } from "next";
import { MatchAPI, ResultAPI } from '@/api'
import Image from "next/image";
import { formatTime } from "@/utils/tool";
import { getCompletionStateByChinese, getRankTypeByChinese } from "@/utils/map";
import SelectDropdown from "@/components/SelectDropdown";
const RaceResult = () => {
    const router = useRouter();
    const { locale } = router;
    const { type } = router.query;
    const { t } = useTranslation("common", { keyPrefix: "raceResult" });
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);
    const [matchList, setMatchList] = useState<API.MatchesListType[]>([]);
    const [matchId, setMatchId] = useState<number>(0);
    const teamResultColumns: TableColumn[] = [
        {
            title: t("index"),
            dataIndex: "index",
            key: "index",
        },
        {
            title: t("teamName"),
            dataIndex: "name",
            key: "name",
        },
        {
            title: t("raceTime"),
            dataIndex: "time",
            key: "time",
            render: (text: string) => formatTime(Number(text)),
        },
        {
            title: t("length"),
            dataIndex: "length",
            key: "length",
        },
        {
            title: t("realTime"),
            dataIndex: "realTime",
            key: "realTime",
            render: (text: string) => formatTime(Number(text)),
        },
        {
            title: t("state"),
            dataIndex: "state",
            key: "state",
            render: (text: string, record: API.ResultRankDetailItem) => <div className={styles.state}>
                {(getCompletionStateByChinese(text) ? t(`completionState.${getCompletionStateByChinese(text)}` as any) : text) as string}
                <button className={styles.state_button} onClick={() => {
                    router.push({
                        pathname: "/raceResult/detail",
                        query: {
                            type: type,
                            matchId: matchId,
                            id: record.id,
                            rankId: selectedRank,
                            matchNameEn: matchList.find(item => item.id === matchId)?.nameEn,
                            matchNameZh: matchList.find(item => item.id === matchId)?.nameZh,
                            groupNameEn: groupList.find(item => item.id === selectedGroup)?.nameEn,
                            groupNameZh: groupList.find(item => item.id === selectedGroup)?.nameZh,
                        }
                    })
                }}>{t("detail")}</button>
            </div>
        },
    ]
    const personalResultColumns: TableColumn[] = [
        {
            title: t("index"),
            dataIndex: "index",
            key: "index",
        },
        {
            title: t("name"),
            dataIndex: "name",
            key: "name",
        },
        {
            title: t("number"),
            dataIndex: "mark",
            key: "mark",
        },
        {
            title: t("raceTime"),
            dataIndex: "time",
            key: "time",
            render: (text: string) => formatTime(Number(text)),
        },
        {
            title: t("length"),
            dataIndex: "length",
            key: "length",
        },
        {
            title: t("realTime"),
            dataIndex: "realTime",
            key: "realTime",
            render: (text: string) => formatTime(Number(text)),
        },
        {
            title: t("state"),
            dataIndex: "state",
            key: "state",
            render: (text: string, record: API.ResultRankDetailItem) => {
                return <div className={styles.state}>
                    {(getCompletionStateByChinese(text) ? t(`completionState.${getCompletionStateByChinese(text)}` as any) : text) as string}
                    <button className={styles.state_button} onClick={() => {
                        router.push({
                            pathname: "/raceResult/detail",
                            query: {
                                type: type,
                                matchId: matchId,
                                id: record.id,
                                rankId: selectedRank,
                                matchNameEn: matchList.find(item => item.id === matchId)?.nameEn,
                                matchNameZh: matchList.find(item => item.id === matchId)?.nameZh,
                                groupNameEn: groupList.find(item => item.id === selectedGroup)?.nameEn,
                                groupNameZh: groupList.find(item => item.id === selectedGroup)?.nameZh,
                            }
                        })
                    }}>{t("detail")}</button>
                </div>
            }
        },
    ]
    const [groupList, setGroupList] = useState<any[]>([])
    const [selectedGroup, setSelectedGroup] = useState<number>(0);
    const [keyword, setKeyword] = useState<string>('');
    const [rankList, setRankList] = useState<API.ResultRankListItem[]>([]);
    const [selectedRank, setSelectedRank] = useState<number>(0);
    const [resultList, setResultList] = useState<API.ResultRankDetailItem[]>([]);

    useEffect(() => {
        if (loading) {
            return
        }
        setLoading(true)
        MatchAPI.getMatchList({
            page: 1,
            size: 10,
        }).then(res => {
            if (res.data.code === 0) {
                try {
                    const data = res.data.data as any
                    setMatchId(data.matches[0].id)
                    setGroupList(data.matches[0].groups)
                    setSelectedGroup(data.matches[0].groups[0].id)
                    setMatchList(data.matches)
                } catch (error) {
                    console.log(error)
                }
            }
        }).catch(err => {
            console.log(err)
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    // 获取排名列表
    useEffect(() => {
        if (matchId && selectedGroup && type) {
            getRankList()
        }
    }, [matchId, selectedGroup, type])

    // 排名列表
    const getRankList = async () => {
        if (loading) {
            return
        }
        setLoading(true)
        const res = await ResultAPI.getResultRankList({
            matchId: matchId,
            matchGroupId: selectedGroup,
            type: type == "team" ? 1 : type == "personal" ? 2 : 0,
            gender: 0,
        })
        if (res.data.code === 0) {
            setRankList(res.data.data.rankList)
            setSelectedRank(res.data.data.rankList[0].id)
        }
        setLoading(false)
    }

    // page 改变时获取成绩列表
    useEffect(() => {
        if (page > 0 && matchId && selectedGroup && selectedRank) {
            getResultList()
        }
    }, [page])

    // 排名或keyword改变时获取成绩列表
    useEffect(() => {
        if (matchId && selectedGroup && selectedRank) {
            if (page == 1) {
                getResultList()
            } else {
                setPage(1)
            }
            setTotal(0)
        }
    }, [selectedRank, keyword])

    // 成绩列表
    const getResultList = async () => {
        if (loading) {
            return
        }
        setLoading(true)
        try {
            const res = await ResultAPI.getResultRankDetail({
                page: page,
                size: 15,
                matchId: matchId,
                matchGroupId: selectedGroup,
                rankId: selectedRank,
                keyword: keyword ? keyword : undefined
            })
            if (res.data.code === 0) {
                setTotal(res.data.data.recordCount)
                setResultList(res.data.data.list)
            } else {
                setTotal(0)
                setResultList([])
            }
        } catch (error) {
            console.log(error)
            setTotal(0)
            setResultList([])
        }
        setLoading(false)
    }


    return (
        <div className={styles.raceResult}>
            <PageHeader title={t("title")} backgroundImage="/images/title_bg/race_result_page_bg.png" />
            <div className={styles.raceResultContainer}>
                <TagSelector
                    tags={[
                        { title: t('personalResult'), value: 'personal' },
                        { title: t('teamResult'), value: 'team' },
                    ]}
                    styleType='text'
                    selectedValue={type as string}
                    loading={loading}
                    onChange={(value) => {
                        router.push({
                            pathname: router.pathname,
                            query: {
                                ...router.query,
                                type: value,
                            }
                        })
                    }}
                />
                <div className={styles.raceResultContent}>
                    <div className={styles.raceResultFilter}>
                        {matchId > 0 && <div className={styles.searchBox}>
                            <input
                                id='searchInput'
                                placeholder={t('search')}
                                type='text'
                                disabled={loading}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (loading) {
                                            return
                                        }
                                        const input = document.getElementById('searchInput') as HTMLInputElement
                                        setKeyword(input.value)
                                    }
                                }}
                                onChange={(e) => {
                                    if (!e.target.value) {
                                        setKeyword('')
                                    }
                                }}
                            />
                            <button onClick={() => {
                                if (loading) {
                                    return
                                }
                                const input = document.getElementById('searchInput') as HTMLInputElement
                                setKeyword(input.value)
                            }}>
                                <Image width={20} height={20} src="/images/icons/search.svg" alt="search" />
                            </button>
                        </div>}

                        <div className={styles.raceResultFilterItem}>
                            {matchList?.length > 0 && (
                                <SelectDropdown
                                    id="matchSelect"
                                    value={matchId}
                                    disabled={loading}
                                    leftIconSrc="/images/icons/calendar.svg"
                                    options={matchList.map((item) => ({
                                        value: item.id as number,
                                        label: locale === "en" ? item.nameEn || "" : item.nameZh || "",
                                    }))}
                                    onChange={(value) => {
                                        setMatchId(Number(value));
                                        setGroupList(matchList.find(item => item.id === value)?.groups || []);
                                        setSelectedGroup(0);
                                    }}
                                />
                            )}
                            {groupList?.length > 0 && (
                                <SelectDropdown
                                    id="groupSelect"
                                    value={selectedGroup}
                                    disabled={loading}
                                    leftIconSrc="/images/icons/people.svg"
                                    options={groupList.map((item) => ({
                                        value: item.id as number,
                                        label: locale === "en" ? item.nameEn : item.nameZh,
                                    }))}
                                    onChange={(value) => {
                                        setSelectedGroup(Number(value));
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    {rankList?.length > 0 && <TagSelector
                        loading={loading}
                        tags={rankList.map(item => ({ title: getRankTypeByChinese(item.name) ? t(`rankList.${getRankTypeByChinese(item.name)}` as any) as string : item.name, value: item.id }))}
                        styleType="outlined"
                        selectedValue={selectedRank}
                        onChange={(value) => {
                            setSelectedRank(Number(value))
                        }}
                    />}
                    <div className={styles.raceResultTable}>
                        <TableComponent rowKey='id'
                            pagination={{ total: total, current: page, pageSize: 15, }}
                            loading={loading}
                            columns={type == "team" ? teamResultColumns : type == "personal" ? personalResultColumns : []}
                            dataSource={resultList}
                            setPage={setPage}
                        />
                    </div>
                    <div className={styles.divider} />
                </div>
            </div>
        </div>
    )
}

export default RaceResult
export const getStaticPaths: GetStaticPaths = async () => ({
    paths: [],
    fallback: 'blocking',
});
export const getStaticProps = getLocaleProps(["common"]);