import { useRouter } from 'next/router'
import styles from './about.module.scss'
import { useTranslation } from "next-i18next";
import Image from 'next/image'
import getLocaleProps from "@/utils/getLocaleProps"
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";

type Props = {};

const About = (props: Props) => {
    const { t } = useTranslation("common", { keyPrefix: "about" });
    const router = useRouter();
    const { type } = router.query;
    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>(
        typeof type === 'string' ? type : ''
    );


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

    }, [type, router])


    return (
        <div className={styles.about}>
            <PageHeader title={t('title')} backgroundImage="/images/about/header.png" />

            <div className={styles.all}>
                <TagSelector
                    tags={[
                        { title: t('brandStory'), value: 'brandStory' },
                        { title: t('creator'), value: 'creator' },
                        { title: t('contactUs'), value: 'contactUs' },
                    ]}
                    styleType='text'
                    selectedValue={selectedSubTitle}
                    onChange={(value) => { router.push(`/${router.locale}/about/${value}`); }}
                />
            </div>

            <div className={styles.contact_box} id='brandStory'>
                <div className={styles.contact_title}>
                    {t('brandStory')}
                </div>
                <div className={styles.story_text}>
                    {t('storyDes')}
                </div>
            </div>

            <div className={styles.contact_box} id='creator'>
                <div className={styles.contact_title}>
                    {t('creator')}
                </div>
                <div className={styles.story_text}>
                    {t('creatorName')}
                </div>
            </div>


            <div className={styles.contact_box} id='contactUs'>
                <div className={styles.contact_title}>
                    {t('contactUs')}
                </div>
                <div className={styles.contact_qrcode_group}>
                    <div className={styles.contact_qrcode}>
                        <div className={styles.contact_title_box}>
                            {t('wxQrcode')}
                        </div>

                        <Image src="/images/contactQRCode.jpg" width={150} height={150} alt='contact' />
                    </div>

                    <div className={styles.contact_qrcode}>
                        <div className={styles.contact_title_box} style={{ marginBottom: '5px' }}>
                            {t('adminWxQrcode')}
                        </div>
                        <Image src="/images/adminQRCode.png" width={140} height={140} alt='contact' />
                    </div>

                    <div className={styles.contact_qrcode}>
                        <div className={styles.contact_title_box} style={{ marginBottom: '5px' }}>
                            {t('adminWAQrcode')}
                        </div>
                        <Image src="/images/adminWAQRCode.png" width={140} height={140} alt='contact' />
                    </div>

                    <div className={styles.contact_qrcode}>
                        <div className={styles.contact_title_box}>
                            {t('email')}
                        </div>
                        <div className={styles.contact_email}>
                            yaolan@exploring.cn
                        </div>
                    </div>
                </div>
            </div>

        </div>

    )
}



export default About
export const getStaticProps = getLocaleProps(["common"]);

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking',
    }
}