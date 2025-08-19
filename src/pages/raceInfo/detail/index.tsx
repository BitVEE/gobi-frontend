import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/raceImage.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { useRouter } from "next/router";
import { NewsAPI } from '@/api'
import { formatDate } from "@/utils/tool";
import Image from "next/image";

const RaceImageDetail = () => {
    const router = useRouter();
    const { locale } = router;
    const { id } = router.query;
    const { t } = useTranslation("common");
    const [loading, setLoading] = useState<boolean>(false);
    const [newsDetail, setNewsDetail] = useState<API.NewsListItem>();

    useEffect(() => {
        if (id) {
            getNewsDetail();
        }
    }, [id]);

    useEffect(() => {
        if (newsDetail?.type == 1) {
            router.push("/raceInfo/detail?id=" + id);
        }
    }, [newsDetail?.type]);

    const getNewsDetail = () => {
        if (loading) {
            return;
        }
        setNewsDetail(undefined);
        setLoading(true);
        NewsAPI.getNewsDetail(id as string).then((res) => {
            setNewsDetail(res.data.data.article as API.NewsListItem);
            setLoading(false);
        }).catch((err) => {
            setLoading(false);
        })
    }

    return (
        <div className={styles.raceImage}>
            <PageHeader title={""} backgroundImage={newsDetail?.coverUrl || ""} />
            <div className={styles.raceImageContainer}>
                <div className={styles.raceImageDetail}>
                    {loading && (
                        <div className={styles.loading}>
                            <Image
                                src='/images/icons/loading.svg'
                                alt="loading"
                                width={120}
                                height={200}
                                className={styles.loadingIcon}
                            />
                            <div className={styles.text}>{t('common.loadingText')}</div>
                        </div>
                    )}
                    {!loading && !newsDetail?.id && (
                        <div className={styles.nodata}>
                            <Image
                                src='/images/icons/nodata.svg'
                                alt="nodata"
                                width={365}
                                height={300}
                                className={styles.nodataIcon}
                            />
                            <div className={styles.text}>{t('common.nodataText')}</div>
                        </div>
                    )}
                    {!loading && newsDetail?.id &&
                        <>
                            <div className={styles.raceImageDetailTitle}>
                                <TagSelector
                                    tags={[
                                        { title: (locale === 'zh' ? newsDetail?.titleZh : newsDetail?.titleEn) || "", value: 0 },
                                    ]}
                                    styleType='text'
                                    selectedValue={0}
                                    onChange={() => { }}
                                />
                                <div className={styles.raceImageDetailTime}>
                                    {formatDate(Number(newsDetail?.createdAt) * 1000)}
                                </div>
                            </div>
                            {newsDetail?.type == 1 && <div className={styles.raceImageDetailContent}>
                                <div
                                    className={styles.rich_text}
                                    dangerouslySetInnerHTML={{ __html: (locale === 'zh' ? newsDetail?.contentZh : newsDetail.contentEn) || "" }}
                                />
                            </div>}
                        </>
                    }
                </div>
            </div>
        </div>
    )
}

export default RaceImageDetail
export const getStaticProps = getLocaleProps(["common"]);