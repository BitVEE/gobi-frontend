import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from '@/styles/raceImage.module.scss'
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { useRouter } from "next/router";
import { GetStaticPaths } from "next";
import { NewsAPI } from '@/api'
import NewsList from "@/components/newList";

const RaceImage = () => {
    const router = useRouter();
    const { type } = router.query;
    const { t } = useTranslation("common");
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [newsList, setNewsList] = useState<API.NewsListItem[]>([]);

    useEffect(() => {
        if (type == 'selectedAlbum' || type == 'selectedVideo') {
            if (page !== 1) {
                setPage(1);
            } else {
                getNewsList();
            }
        }
    }, [type, page]);

    const getNewsList = () => {
        if (loading) {
            return;
        }
        setNewsList([]);
        setTotal(0);
        setLoading(true);
        NewsAPI.getNewsList({
            page: page,
            size: 9,
            type: type == 'selectedAlbum' ? 2 : type == 'selectedVideo' ? 3 : 0,
        }).then((res) => {
            setNewsList(res.data.data.articles);
            setTotal(res.data.data.total);
            setLoading(false);
        }).catch((err) => {
            setLoading(false);
        })
    }

    return (
        <div className={styles.raceImage}>
            <PageHeader title={t("header.raceImage")} backgroundImage="/images/title_bg/race_image_page_bg.png" />
            <div className={styles.raceImageContainer}>
                <TagSelector
                    tags={[
                        { title: t('header.raceImageList.selectedAlbum'), value: 'selectedAlbum' },
                        { title: t('header.raceImageList.selectedVideo'), value: 'selectedVideo' },
                    ]}
                    styleType='text'
                    selectedValue={type as string}
                    loading={loading}
                    onChange={(value) => {
                        router.push({
                            pathname: router.pathname,
                            query: {
                                type: value,
                            }
                        })
                    }}
                />
                <div className={styles.raceImageContent}>
                    <NewsList
                        newsList={newsList}
                        loading={loading}
                        page={page}
                        total={total}
                        onPageChange={(page) => {
                            setPage(page);
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default RaceImage
export const getStaticPaths: GetStaticPaths = async () => ({
    paths: [],
    fallback: 'blocking',
});
export const getStaticProps = getLocaleProps(["common"]);