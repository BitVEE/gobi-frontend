import { useRouter } from 'next/router'
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';

import styles from './registration.module.scss'
import PageHeader from '@/components/PageHeader';
import TagSelector from '@/components/TagSelector';
import MatchDetailCard from '@/components/MatchDetailCard';
import Modal from '@/components/Modal';
import { MatchAPI } from '@/api';

type Props = {};

const Registration = (props: Props) => {
    const router = useRouter()
    const { type } = router.query;
    const { t, i18n } = useTranslation("common", { keyPrefix: "header" });
    const token = useSelector((state: any) => state.commonSlice.token);

    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>(
        typeof type === 'string' ? type : ''
    );
    const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGroup, setCurrentGroup] = useState();


    const getMatchInfo = async () => {
        const res = await MatchAPI.getMatchList({ page: 1, size: 10 })
        if (res.data.code === 0) {
            const data = res.data.data as API.MatchInfoType | null;
            if (data) {
                setCurrentMatchInfo(data.matches[0])
            }

        }
    }


    const submitRegistration = () => {
        setIsModalOpen(false)
        router.push({
            pathname: '/race/info',
            query: {
                matchDetail: JSON.stringify(currentMatchInfo),
                groupInfo: JSON.stringify(currentGroup),
            }
        });
    }

    useEffect(() => {
        getMatchInfo()
    }, [])

    useEffect(() => {
        if (type) {
            if (typeof type === 'string') {
                setSelectedSubTitle(type)
            } else if (Array.isArray(type) && type.length > 0) {
                setSelectedSubTitle(type[0])
            }

            const element = document.getElementById(type as string);
            const headerElement = document.getElementById('site-header');
            const headerOffset = headerElement?.getBoundingClientRect().height ?? 0;

            if (element) {
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 10;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }

    }, [router])

    return (
        <div className={styles.registration} id='registration'>
            <PageHeader backgroundImage='/images/title_bg/registration.png' title={t('race')} />
            <div className={styles.tag_box} id='registration'>
                <TagSelector
                    tags={[
                        { title: t("race"), value: "registration" },
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
                    onChange={(value) => { router.push(`/${router.locale}/race/${value}`); }}
                />
            </div>

            <div className={styles.match_box}>
                <div className={styles.info_box}>
                    {currentMatchInfo && <MatchDetailCard matchDetail={currentMatchInfo} />}
                    {
                        currentMatchInfo?.groups && currentMatchInfo.groups.length > 0 &&
                        currentMatchInfo.groups.map((group: any) => {
                            return (
                                <div className={styles.group_box} key={group.id}>
                                    <div className={styles.cell}>
                                        <div className={styles.cell_title}>
                                            {group?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn'] || t('registration.nodataText')}
                                        </div>
                                        <div className={styles.cell_price}>
                                            {`¥${group.cost}/${t('registration.person')}`}
                                        </div>
                                        <div className={styles.cell_btn} onClick={() => { if(token) {setIsModalOpen(true); setCurrentGroup(group)} else{ alert(t('registration.loginTips'))} }}>
                                            {t('registration.now')}
                                        </div>
                                    </div>
                                </div>
                            )
                        }
                        )
                    }

                </div>

                <div className={styles.match_description}>
                    <div className={styles.match_description_box} id='notice'>
                        <div className={styles.match_description_title}>
                            {t('raceList.notice')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'signUpNoticeZh' : 'signUpNoticeEn'] || t('registration.nodataText')}
                        </div>
                    </div>

                    <div className={styles.match_description_box} id='changePolicy'>
                        <div className={styles.match_description_title}>
                            {t('raceList.changePolicy')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'quitPolicyZh' : 'quitPolicyEn'] || t('registration.nodataText')}
                        </div>
                    </div>


                    <div className={styles.match_description_box} id='qualification'>
                        <div className={styles.match_description_title}>
                            {t('raceList.qualification')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'joinQualificationZh' : 'joinQualificationEn'] || t('registration.nodataText')}
                        </div>
                    </div>

                    <div className={styles.match_description_box} id='insurance'>
                        <div className={styles.match_description_title}>
                            {t('raceList.insurance')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'insuranceInfoZh' : 'insuranceInfoEn'] || t('registration.nodataText')}
                        </div>
                    </div>

                    <div className={styles.match_description_box} id='fee'>
                        <div className={styles.match_description_title}>
                            {t('raceList.fee')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'expenseInfoZh' : 'expenseInfoEn'] || t('registration.nodataText')}
                        </div>
                    </div>

                    <div className={styles.match_description_box} id='rule'>
                        <div className={styles.match_description_title}>
                            {t('raceList.rule')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'matchRulesZh' : 'matchRulesEn'] || t('registration.nodataText')}
                        </div>
                    </div>

                    <div className={styles.match_description_box} id='schedule'>
                        <div className={styles.match_description_title}>
                            {t('raceList.schedule')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'matchRulesZh' : 'matchRulesEn'] || t('registration.nodataText')}
                        </div>
                    </div>
                </div>

                <div className={styles.contact_box}>
                    <div className={styles.contact_title}>
                        {t('aboutList.contactUs')}
                    </div>
                    <div className={styles.contact_qrcode_group}>
                        <div className={styles.contact_qrcode}>

                        </div>

                        <div className={styles.contact_qrcode}>

                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isClickOutsideToClose={true}
                title={t('registration.disclaimerTitle')}
            >
                <div className={styles.modal_content}>
                    <div className={styles.modal_text}>
                        {t('registration.disclaimerText')}
                    </div>
                    <div className={styles.modal_btn_group}>
                        <div className={styles.modal_cancel_btn} onClick={() => setIsModalOpen(false)}>
                            {t('registration.disagree')}
                        </div>
                        <div className={styles.modal_btn} onClick={() => submitRegistration()}>
                            {t('registration.agree')}
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default Registration

export const getStaticProps = getLocaleProps(["common"]);

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking',
    }
}
