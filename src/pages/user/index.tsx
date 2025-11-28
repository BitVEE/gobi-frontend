import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/user.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { AuthAPI } from "@/api";
import TableComponent from "@/components/Table";
import { useRouter } from "next/router";
import { SignupStateMap } from "@/utils/map";
const User = () => {
    const { t } = useTranslation("common", { keyPrefix: "user" });
    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>('myEnroll');
    const [selectedTag, setSelectedTag] = useState<number>(0);
    const [signupHistory, setSignupHistory] = useState<API.SignupHistoryItem[]>([]);
    const [filteredSignupHistory, setFilteredSignupHistory] = useState<API.SignupHistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { locale } = useRouter();
    const router = useRouter()
    const [page, setPage] = useState<number>(1);
    const [total, setTotal] = useState<number>(0);

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
    }, [page])

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


    return (
        <div className={styles.user}>
            <PageHeader title={t("title")} backgroundImage="/images/title_bg/user_page_bg.png" />
            <div className={styles.userContainer}>
                <TagSelector
                    tags={[
                        { title: t('myEnroll'), value: 'myEnroll' },
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
            </div>
        </div>
    )
}

export default User
export const getStaticProps = getLocaleProps(["common"]);