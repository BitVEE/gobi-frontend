import { useRouter } from 'next/router'
import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";
import Image from "next/image";


import styles from './info.module.scss'
import MatchDetailCard from '@/components/MatchDetailCard';

type Props = {};

const Info = (props: Props) => {
    const router = useRouter()
    const { groupInfo, matchDetail } = router.query;
    const { t } = useTranslation();

    const [group, setGroup] = useState<any>();
    const [currentMatchInfo, setCurrentMatchInfo] = useState<API.MatchesListType>();


    useEffect(() => {
        if (groupInfo && matchDetail) {
            setGroup(JSON.parse(groupInfo as string));
            setCurrentMatchInfo(JSON.parse(matchDetail as string));
        }
    }, [groupInfo, matchDetail]);

    return (
        <div className={styles.info}>
            <div className={styles.detail_box}>
                {currentMatchInfo && <MatchDetailCard matchDetail={currentMatchInfo} />}
            </div>

            <div className={styles.group_box}>
                <div className={styles.cell_title}>
                    {t('header.registration.group')}
                </div>
                <div className={styles.cell_content}>
                    <div className={styles.cell_name}>
                        {t('header.registration.group')}
                    </div>
                    <div className={styles.group_name}>{group?.name}</div>
                </div>

                <div className={styles.cell_content}>
                    <div className={styles.cell_name}>
                        {t('header.registration.cost')}
                    </div>
                    <div className={styles.group_name}>{`¥${group?.cost}/人`}</div>
                </div>
            </div>
        </div>
    )
}

export default Info
export const getStaticProps = getLocaleProps(["common"]);
