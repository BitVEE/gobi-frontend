import Image from 'next/image';
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";

import styles from './matchDetailCard.module.scss'

type Props = {
    matchDetail: API.MatchesListType;
    groupInfo?: API.MatchesGroupInfoType
};

const MatchDetailCard = (props: Props) => {
    const { t, i18n } = useTranslation("common", { keyPrefix: "header" });
    const { matchDetail, groupInfo } = props;
    const [matchStatus, setMatchStatus] = useState<string>()
    const [startDateStatus, setStartDateStatus] = useState<boolean>(false)
    const [endDateStatus, setEndDateStatus] = useState<boolean>(false)
    const [matchDateStatus, setMatchDateStatus] = useState<boolean>(false)

    const getMatchStatus = () => {
        if (matchDetail?.state === 1) {
            setMatchStatus(t('registration.status.in'))
        } else if (matchDetail?.state === 2) {
            setMatchStatus(t('registration.status.registrationEnd'))
        } else if (matchDetail?.state === 3) {
            setMatchStatus(t('registration.status.matchEnd'))
        } else if (matchDetail?.state === 4) {
            setMatchStatus(t('registration.status.matchClosed'))
        }
    }

    const handleDateStatus = () => {
        const currentDate = new Date();

        const parseDate = (dateStr: any) => dateStr ? new Date(dateStr) : new Date(NaN);

        const startDate = parseDate(matchDetail?.startSignUpDate);
        const endDate = parseDate(matchDetail?.endSignUpDate);
        const matchDate = parseDate(matchDetail?.matchDate);

        let startStatus = false;
        let endStatus = false;
        let matchStatus = false;

        if (currentDate >= startDate) {
            startStatus = true;

            if (currentDate >= endDate) {
                endStatus = true;

                if (currentDate >= matchDate) {
                    matchStatus = true;
                }
            }
        }

        setStartDateStatus(startStatus);
        setEndDateStatus(endStatus);
        setMatchDateStatus(matchStatus);
    };


    useEffect(() => {
        if (matchDetail) {
            getMatchStatus()
            handleDateStatus();
        }
    }, [matchDetail, i18n.language])

    return (
        <div className={styles.matchDetailCard}>

            <div className={styles.detail}>
                <div className={styles.cover}>
                    {
                        matchDetail?.coverUrl &&
                        <Image className={styles.cover} src={matchDetail.coverUrl} width={615} height={355} alt='cover'></Image>
                    }
                </div>
                <div className={styles.registration_info}>
                    <div className={styles.title}>
                        <div className={styles.title_name}>
                            {matchDetail?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn']}
                        </div>
                        <div className={styles.title_status}>
                            {matchStatus}
                        </div>
                    </div>
                    <div className={styles.text}>
                        <div className={styles.text_title}>
                            {t('registration.place')}:
                        </div>
                        {matchDetail?.[i18n.language === 'zh' ? 'place' : 'place']}

                    </div>
                    <div className={styles.text}>

                        <div className={styles.text_title}>
                            {t('registration.contact')}:
                        </div>
                        {matchDetail?.[i18n.language === 'zh' ? 'contact' : 'contact']}
                    </div>
                    <div className={styles.date}>
                        <div className={styles.date_box} style={{ backgroundColor: startDateStatus ? '#FFD1B7' : '#E0E0E066' }}>
                            <div className={styles.date_title}>
                                {t('registration.startDate')}
                            </div>
                            <div className={styles.date_num}>
                                {matchDetail?.startSignUpDate}
                            </div>
                        </div>
                        <Image className={styles.date_arrow} src='/images/icons/arrow-square-right.svg' width={24} height={24} alt='arrow-square-right'></Image>
                        <div className={styles.date_box} style={{ backgroundColor: endDateStatus ? '#FFD1B7' : '#E0E0E066' }}>
                            <div className={styles.date_title}>
                                {t('registration.endDate')}
                            </div>
                            <div className={styles.date_num}>
                                {matchDetail?.endSignUpDate}
                            </div>
                        </div>
                        <Image className={styles.date_arrow} src='/images/icons/arrow-square-right.svg' width={24} height={24} alt='arrow-square-right'></Image>
                        <div className={styles.date_box} style={{ backgroundColor: matchDateStatus ? '#FFD1B7' : '#E0E0E066' }}>
                            <div className={styles.date_title}>
                                {t('registration.matchDate')}
                            </div>
                            <div className={styles.date_num}>
                                {matchDetail?.matchDate}
                            </div>
                        </div>
                    </div>
                    {
                        groupInfo && <div className={styles.group}>

                            <div className={styles.group_title}>
                                {t('registration.group')}:
                            </div>

                            <div className={styles.group_name}>
                                {groupInfo?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn'] || t('registration.nodataText')}
                            </div>
                        </div>
                    }

                    {
                        groupInfo && <div className={styles.group}>
                            <div className={styles.group_title}>
                                {t('registration.cost')}:
                            </div>

                            <div className={styles.group_name}>
                                <div className={styles.group_name}>{`¥${groupInfo?.cost}/${t('registration.person')}`}</div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export default MatchDetailCard