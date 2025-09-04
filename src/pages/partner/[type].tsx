import { useRouter } from 'next/router'
import styles from './partner.module.scss'
import { useTranslation } from "next-i18next";
import getLocaleProps from "@/utils/getLocaleProps"
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import LoadingImg from '@/components/LoadingImg';

type Props = {};

const Contributors = (props: Props) => {
    const { t } = useTranslation("common", { keyPrefix: "partner" });
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

    }, [router])


    return (
        <div className={styles.partner}>
            <PageHeader title={t(type as any)} backgroundImage="/images/partner/flags.png" />

            <div className={styles.bar}>
                <TagSelector
                    tags={[
                        { title: t('joinSchool'), value: 'joinSchool' },
                        { title: t('partner'), value: 'partner' },
                        // { title: t('shop'), value: 2 },
                        // { title: t('community'), value: 3 }
                    ]}
                    styleType='text'
                    selectedValue={selectedSubTitle}
                    onChange={(value) => { router.push(`/${router.locale}/partner/${value}`); }}
                />

                <a href="" className={styles.anchor1}></a>
                <a href="" className={styles.anchor2}></a>
            </div>


            <div className={styles.partners} id='joinSchool'>
                <div className={styles.titleBox}>
                    <div className={styles.text}>{t("joinSchool")}</div>
                    <hr className={styles.orangeLine} />
                </div>
                <div className={styles.partner_list}>
                    {
                        new Array(24).fill(0).map((item, idx) => (
                            <div className={styles.partner_item} key={idx}>
                                <LoadingImg noPlaceholder src={`/images/school/${idx + 1}.png`} style={{ width: '100%', height: '100%' }} width={189} height={189} />
                            </div>
                        ))
                    }
                </div>
            </div>

            <div className={styles.partners} id='partner'>
                <div className={styles.titleBox}>
                    <div className={styles.text}>{t("partner")}</div>
                    <hr className={styles.orangeLine} />
                </div>
                <div>
                    {Array.from({ length: 18 }, (_, i) => <span key={i}><div className={styles.card}></div></span>)}
                </div>
            </div>


        </div>
    )
}

export default Contributors
export const getStaticProps = getLocaleProps(["common"]);

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking',
    }
}