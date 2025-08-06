import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/user.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
const User = () => {
    const { t } = useTranslation("common", { keyPrefix: "user" });
    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>('myEnroll');
    const [selectedTag, setSelectedTag] = useState<string | number>('all');

    return (
        <div className={styles.user}>
            <PageHeader title={t("title")} backgroundImage="/images/title_bg/user_page_bg.png" />
            <div className={styles.userContainer}>
                {/* 二级导航 */}
                <TagSelector
                    tags={[
                        { title: t('myEnroll'), value: 'myEnroll' },
                        { title: t('commonEnroll'), value: 'commonEnroll' }
                    ]}
                    styleType='text'
                    selectedValue={selectedSubTitle}
                    onChange={(value) => { setSelectedSubTitle(value); }}
                />
                {selectedSubTitle === 'myEnroll' && (
                    <div className={styles.my_enroll}>
                        <div className={styles.my_enroll_tag}>
                            <TagSelector
                                tags={[
                                    { title: t('all'), value: 'all' },
                                    { title: t('waitPay'), value: 'waitPay' },
                                    { title: t('paySuccess'), value: 'paySuccess' },
                                    { title: t('refund'), value: 'refund' },
                                    { title: t('payFail'), value: 'payFail' },
                                ]}
                                styleType='outlined'
                                selectedValue={selectedTag}
                                onChange={(value) => { setSelectedTag(value); }}
                            />
                        </div>
                        <div className={styles.my_enroll_table}>
                        </div>
                    </div>
                )}
                {selectedSubTitle === 'commonEnroll' && (
                    <>
                        <h2>{t('commonEnroll')}</h2>
                    </>
                )}
            </div>
        </div>
    )
}

export default User
export const getStaticProps = getLocaleProps(["common"]);