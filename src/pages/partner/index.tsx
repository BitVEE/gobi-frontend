import { useRouter } from 'next/router'
import styles from './partner.module.scss'
import { useTranslation } from "next-i18next";
import Image from 'next/image'
import getLocaleProps from "@/utils/getLocaleProps"
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { AuthAPI } from "@/api";
import TableComponent from "@/components/Table";

type Props={};

const Contributors = (props: Props) => {
    const { t } = useTranslation("common", { keyPrefix: "partner" });
    const router = useRouter();
    const [selectedTag, setSelectedTag] = useState<number>(0);

    return(
        <div className={styles.partner}>
            <PageHeader title={t('title')} backgroundImage="/images/partner/flags.png" />

            <div className={styles.bar}>
                <TagSelector
                    tags={[
                        { title: t('title'), value: 0 },
                        { title: t('schools'), value: 1 },
                        { title: t('shop'), value: 2 },
                        { title: t('community'), value: 3 }
                    ]}
                    styleType='text'
                    selectedValue={selectedTag}
                    onChange={(value) => { setSelectedTag(Number(value)); }}
                />

                <a href="" className={styles.anchor1}></a>
                <a href="" className={styles.anchor2}></a>
            </div>



            {selectedTag===0 && <div className={styles.partners} >
                <div className={styles.titleBox}>
                    <div className={styles.text}>{t("title")}</div>
                    <hr className={styles.orangeLine}/>
                </div>
                <div>
                    {Array.from({ length: 18 }, (_, i) => <span key={i}><div className={styles.card}></div></span>)}
                </div>
            </div>}

            {selectedTag===1 && <div className={styles.partners} >
                <div className={styles.titleBox}>
                    <div className={styles.text}>{t("schools")}</div>
                    <hr className={styles.orangeLine}/>
                </div>
                <div>
                    {Array.from({ length: 18 }, (_, i) => <span key={i}><div className={styles.card}></div></span>)}
                </div>
            </div>}
            
        </div>
    )
}

export default Contributors
export const getStaticProps = getLocaleProps(["common"]);