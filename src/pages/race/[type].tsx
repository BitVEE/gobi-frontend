import { useRouter } from 'next/router'
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';

import styles from './registration.module.scss'
import PageHeader from '@/components/PageHeader';
import TagSelector from '@/components/TagSelector';
import MatchDetailCard from '@/components/MatchDetailCard';
import Modal from '@/components/Modal';
import { addToast } from "@/redux/slice/toastSlice";

type Props = {};

const Registration = (props: Props) => {
    const router = useRouter()
    const { type } = router.query;
    const { t, i18n } = useTranslation("common");
    const token = useSelector((state: any) => state.commonSlice.token);
    const dispatch = useDispatch();

    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>(
        typeof type === 'string' ? type : ''
    );
    const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>()
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGroup, setCurrentGroup] = useState();

    const triggerYouMeng = (category: string, action: string, label: string) => {
        (window as any)._czc && (window as any)._czc.push(["_trackEvent", category, action, label]);
    }

    const handleDetailToFormat = (detail: API.HomeCurrentData) => {
        setCurrentMatchInfo(detail.currentMatch || undefined)
    }

    const submitRegistration = () => {
        setIsModalOpen(false)
        router.push({
            pathname: '/race/info',
            query: {
                groupInfo: JSON.stringify(currentGroup),
            }
        });
    }

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
            <PageHeader backgroundImage='/images/title_bg/registration.png' title={t('header.race')} />
            <div className={styles.tag_box} id='registration'>
                <TagSelector
                    tags={[
                        { title: t("header.race"), value: "registration" },
                        { title: t('header.raceList.notice'), value: "notice" }
                    ]}
                    styleType='text'
                    selectedValue={selectedSubTitle}
                    onChange={(value) => { router.push(`/${router.locale}/race/${value}`); }}
                />
            </div>
            <MatchDetailCard pageName='detail' detailToFormat={handleDetailToFormat} />
            <div className={styles.match_box}>
                <div className={styles.info_box}>
                    {
                        currentMatchInfo?.groups && currentMatchInfo.state === 1 && currentMatchInfo.groups.length > 0 &&
                        currentMatchInfo.groups.map((group: any) => {
                            return (
                                <div className={styles.group_box} key={group.id}>
                                    <div className={styles.cell}>
                                        <div className={styles.cell_title}>
                                            {group?.[i18n.language === 'zh' ? 'nameZh' : 'nameEn'] || t('common.nodataText')}
                                        </div>
                                        {
                                            group?.cost > 0 &&
                                            <div className={styles.cell_price}>
                                                {`¥${group.cost}/${t('header.registration.person')}`}
                                            </div>
                                        }
                                        <button disabled={currentMatchInfo?.state !== 1} className={styles.cell_btn} onClick={() => {
                                            if (token) { setIsModalOpen(true); setCurrentGroup(group); triggerYouMeng("赛事报名页面", '点击', '立即报名按钮'); } else {
                                                dispatch(addToast({
                                                    message: t("header.registration.loginTips"),
                                                    timeout: 3000
                                                }))
                                            }
                                        }}>
                                            {t('registration.raceStatus.open')}
                                        </button>
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
                            {t('header.raceList.notice')}
                            <div className={styles.match_description_title_divider}>
                            </div>
                        </div>
                        <div className={styles.match_description_text}>
                            {currentMatchInfo?.[i18n.language === 'zh' ? 'pdfUrlZh' : 'pdfUrlEn'] && <a href={currentMatchInfo?.[i18n.language === 'zh' ? 'pdfUrlZh' : 'pdfUrlEn']} target='_blank'>
                                <img src='/images/icons/pdf.svg' alt='pdf' />
                                {t('registration.pdf')}
                                {currentMatchInfo?.[i18n.language === 'zh' ? 'pdfUrlZh' : 'pdfUrlEn'].split('.').pop()}
                            </a>}
                            {!currentMatchInfo?.[i18n.language === 'zh' ? 'pdfUrlZh' : 'pdfUrlEn'] && <div className={styles.match_description_text_empty}>
                                {t('common.nodataText')}
                            </div>}
                        </div>
                    </div>
                </div>

                <div className={styles.contact_box}>
                    <div className={styles.contact_title}>
                        {t('header.aboutList.contactUs')}
                    </div>
                    <div className={styles.contact_qrcode_group}>
                        <div className={styles.contact_qrcode}>
                            <div className={styles.contact_title_box}>
                                {t('header.wxQrcode')}
                            </div>
                            <Image src="/images/contactQRCode.jpg" width={150} height={150} alt='contact' />
                        </div>

                        <div className={styles.contact_qrcode}>
                            <div className={styles.contact_title_box} style={{ marginBottom: '5px' }}>
                                {t('header.adminWxQrcode')}
                            </div>
                            <Image src="/images/adminQRCode.png" width={140} height={140} alt='contact' />
                        </div>

                        <div className={styles.contact_qrcode}>
                            <div className={styles.contact_title_box} style={{ marginBottom: '5px' }}>
                                {t('header.adminWAQrcode')}
                            </div>
                            <Image src="/images/adminWAQRCode.png" width={140} height={140} alt='contact' />
                        </div>

                        <div className={styles.contact_qrcode}>
                            <div className={styles.contact_title_box}>
                                {t('header.email')}
                            </div>
                            <div className={styles.contact_email}>
                                yaolan@exploring.cn
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isClickOutsideToClose={true}
                title={t('header.registration.disclaimerTitle')}
            >
                <div className={styles.modal_content}>
                    <div className={styles.modal_text}>
                        {t('header.registration.disclaimerText')}
                    </div>
                    <div className={styles.modal_btn_group}>
                        <div className={styles.modal_cancel_btn} onClick={() => setIsModalOpen(false)}>
                            {t('header.registration.disagree')}
                        </div>
                        <div className={styles.modal_btn} onClick={() => submitRegistration()}>
                            {t('header.registration.agree')}
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
