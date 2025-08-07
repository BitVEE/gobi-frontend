import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/user.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { AuthAPI } from "@/api";
import TableComponent from "@/components/Table";
import { useRouter } from "next/router";
import { SignupStateMap } from "@/types/map";
const User = () => {
    const { t } = useTranslation("common", { keyPrefix: "user" });
    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>('myEnroll');
    const [selectedTag, setSelectedTag] = useState<number>(0);
    const [signupHistory, setSignupHistory] = useState<API.SignupHistoryItem[]>([]);
    const [filteredSignupHistory, setFilteredSignupHistory] = useState<API.SignupHistoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const { locale } = useRouter();

    useEffect(() => {
        setLoading(true);
        AuthAPI.getSignupHistory({
            page: 1,
            size: 10,
        }).then((res) => {
            if (res.data.code === 0) {
                setSignupHistory(res.data.data.signUpList);
                setFilteredSignupHistory(res.data.data.signUpList);
            } else {
                setSignupHistory([]);
            }
        }).finally(() => {
            setLoading(false);
        })
    }, [])

    useEffect(() => {
        if (selectedTag === 0) {
            setFilteredSignupHistory(signupHistory);
        } else {
            setFilteredSignupHistory(signupHistory.filter((item) => item.state === Number(selectedTag)));
        }

    }, [selectedTag])

    const signupColumns = [
        { title: t('name'), dataIndex: 'name', key: 'name', render: (text: string, record: API.SignupHistoryItem) => <div className={styles.name}>{locale == "en" ? record.enName : text}</div> },
        { title: t('raceName'), dataIndex: 'matchId', key: 'matchId' },
        { title: t('group'), dataIndex: 'matchGroupId', key: 'matchGroupId' },
        { title: t('status'), dataIndex: 'state', key: 'state', render: (text: string) => <div className={styles.status}>{t(SignupStateMap[Number(text)])}</div> },
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
                                total: filteredSignupHistory.length,
                                current: 1,
                                pageSize: 10,
                            }} loading={loading} columns={signupColumns} dataSource={filteredSignupHistory} />
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