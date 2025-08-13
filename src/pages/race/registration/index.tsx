import { useRouter } from 'next/router'
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";

import styles from './registration.module.scss'
import PageHeader from '@/components/PageHeader';
import TagSelector from '@/components/TagSelector';
import { MatchAPI } from '@/api';

type Props = {};

interface MatchesListType {
    contact?: string
    coverUrl?: string
    createdAt?: number
    detailEn?: string
    detailZh?: string
    endSignUpDate?: string
    expenseInfoEn?: string
    expenseInfoZh?: string
    geexekMatchId?: number
    groups?: any
    id?: number
    insuranceInfoEn?: string
    insuranceInfoZh?: string
    joinQualificationEn?: string
    joinQualificationZh?: string
    matchDate?: string
    matchManualEn?: string
    matchManualZh?: string
    matchRulesEn?: string
    matchRulesZh?: string
    nameEn?: string
    nameZh?: string
    place?: string
    quitPolicyEn?: string
    quitPolicyZh?: string
    signUpNoticeEn?: string
    signUpNoticeZh?: string
    startSignUpDate?: string
    state?: number
    updatedAt?: number
}

type MatchInfoType = {
    matches: Array<MatchesListType>,
    total: number
}

const Registration = (props: Props) => {
    const router = useRouter()
    const { t, i18n } = useTranslation("common", { keyPrefix: "header" });
    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>('race');
    const [currentMatchInfo, setCurrentMatchInfo] = useState<MatchesListType>()
    const [matchStatus, setMatchStatus] = useState<string>()

    const getMatchInfo = async () => {
        const res = await MatchAPI.getMatchList({ page: 1, size: 10 })
        if (res.data.code === 0) {
            const data = res.data.data as MatchInfoType | null;
            if (data) {
                setCurrentMatchInfo(data.matches[0])
            }

            console.log(currentMatchInfo)
        }
    }

    const getMatchStatus = () => {
        if (currentMatchInfo?.state === 1) {
            setMatchStatus(t('registration.status.in'))
        } else if (currentMatchInfo?.state === 2) {
            setMatchStatus(t('registration.status.registrationEnd'))
        } else if (currentMatchInfo?.state === 3) {
            setMatchStatus(t('registration.status.matchEnd'))
        } else if (currentMatchInfo?.state === 4) {
            setMatchStatus(t('registration.status.matchClosed'))
        }
    }

    useEffect(() => {
        getMatchInfo()
    }, [])

    useEffect(() => {

        getMatchStatus()


    }, [currentMatchInfo])

    return (
        <div className={styles.registration}>
            <PageHeader backgroundImage='/images/title_bg/registration.png' title={t('race')} />
            <div className={styles.tag_box}>

                <TagSelector
                    tags={[
                        { title: t("race"), value: "race" },
                        { title: t('raceList.notice'), value: "notice" },
                        { title: t('raceList.changePolicy'), value: "changePolicy" },
                        { title: t('raceList.qualification'), value: "qualification" },
                        { title: t('raceList.insurance'), value: "insurance" },
                        { title: t('raceList.fee'), value: "fee" },
                        { title: t('raceList.rule'), value: "rule" },
                        { title: t('raceList.schedule'), value: "schedule" },
                    ]}
                    styleType='text'
                    selectedValue={selectedSubTitle}
                    onChange={(value) => { setSelectedSubTitle(value); }}
                />
            </div>

            <div className={styles.match_box}>
                <div className={styles.info_box}>
                    <div className={styles.detail}>
                        <Image className={styles.cover} src={currentMatchInfo?.coverUrl ?? ''} width={615} height={355} alt='cover'></Image>
                        <div className={styles.registration_info}>
                            <div className={styles.title}>
                                <div className={styles.title_name}>
                                    {currentMatchInfo?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn']}
                                </div>
                                <div className={styles.title_status}>
                                    {matchStatus}
                                </div>
                            </div>
                            <div className={styles.text}>
                                <div className={styles.text_title}>
                                    {t('registration.place')}:
                                </div>
                                {currentMatchInfo?.[i18n.language === 'zh' ? 'place' : 'place']}

                            </div>
                            <div className={styles.text}>

                                <div className={styles.text_title}>
                                    {t('registration.contact')}:
                                </div>
                                {currentMatchInfo?.[i18n.language === 'zh' ? 'contact' : 'contact']}
                            </div>
                            <div className={styles.date}>
                                <div className={styles.date_box}>
                                    <div className={styles.date_title}>
                                        {t('registration.startDate')}
                                    </div>
                                    <div className={styles.date_num}>
                                        {currentMatchInfo?.startSignUpDate}
                                    </div>
                                </div>
                                <Image className={styles.date_arrow} src='/images/icons/arrow-square-right.svg' width={24} height={24} alt='arrow-square-right'></Image>
                                <div className={styles.date_box}>
                                    <div className={styles.date_title}>
                                        {t('registration.endDate')}
                                    </div>
                                    <div className={styles.date_num}>
                                        {currentMatchInfo?.endSignUpDate}
                                    </div>
                                </div>
                                <Image className={styles.date_arrow} src='/images/icons/arrow-square-right.svg' width={24} height={24} alt='arrow-square-right'></Image>
                                <div className={styles.date_box}>
                                    <div className={styles.date_title}>
                                        {t('registration.matchDate')}
                                    </div>
                                    <div className={styles.date_num}>
                                        {currentMatchInfo?.matchDate}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.group_box}>
                        <div className={styles.cell}>
                            <div className={styles.cell_title}>
                                中学组
                            </div>
                            <div className={styles.cell_price}>
                                888/人
                            </div>
                            <div className={styles.cell_btn}>
                                {t('registration.now')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Registration

export const getStaticProps = getLocaleProps(["common"]);
