import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import LoadingImg from '@/components/LoadingImg';
import Modal from '@/components/Modal';
import NewsList from '@/components/newList';
import NewsDetail from '@/components/NewsDetail';
import styles from './schoolList.module.scss';
import { NewsAPI, SchoolAPI } from '@/api';
import Image from 'next/image';

interface SchoolListProps {
}

const SchoolList: React.FC<SchoolListProps> = () => {
    const { t } = useTranslation("common");
    const [schoolList, setSchoolList] = useState<API.SchoolListResult['data']>([]);
    const [loadingSchoolList, setLoadingSchoolList] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [school, setSchool] = useState<API.SchoolListItem>({} as API.SchoolListItem);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [newsList, setNewsList] = useState<API.NewsListItem[]>([]);
    const [isNewsDetailModalOpen, setIsNewsDetailModalOpen] = useState(false);
    const [newsId, setNewsId] = useState<string | number>('');

    const fetchSchoolList = async () => {
        if (loadingSchoolList) {
            return;
        }
        setLoadingSchoolList(true);
        const result = await SchoolAPI.getSchoolList();
        setLoadingSchoolList(false);
        if (result.data.code === 0) {
            setSchoolList(result.data.data.data);
        } else {
            console.error("Failed to fetch school list:", result.data.msg);
        }
    }

    const handleNews = (school: API.SchoolListItem) => {
        setIsModalOpen(true);
        setSchool(school);
    };

    useEffect(() => {
        fetchSchoolList();
    }, []);

    useEffect(() => {
        if (school.id) {
            if (page !== 1) {
                setPage(1);
            }
        } else {
            setPage(0);
        }
    }, [school.id]);

    useEffect(() => {
        if (page !== 0 && school.id) {
            getNewsList();
        }
    }, [page]);

    const getNewsList = () => {
        if (loading) {
            return;
        }
        setNewsList([]);
        setTotal(0);
        setLoading(true);
        NewsAPI.getNewsList({
            page: page,
            size: 4,
            schoolId: school.id,
        }).then((res) => {
            setNewsList(res.data.data.articles);
            setTotal(res.data.data.total);
            setLoading(false);
        }).catch((err) => {
            setLoading(false);
        });
    };

    const clickItem = (id: number) => {
        setNewsId(id);
        setIsNewsDetailModalOpen(true);
        setIsModalOpen(false);
    };

    const handleBack = () => {
        setIsModalOpen(true);
        setIsNewsDetailModalOpen(false);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setIsNewsDetailModalOpen(false);
        setSchool({} as API.SchoolListItem);
    };

    return (
        <>
            {loadingSchoolList ?
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
                : <div className={styles.partner_list}>
                    {schoolList.length > 0 ? schoolList.map((item) => (
                        <div className={styles.partner_item} key={item.id}>
                            <LoadingImg noPlaceholder src={item.logoUrl} style={{ width: "var(--width)", height: "var(--height)", objectFit: "contain" }} width={500} height={300} alt={item.nameEn} />
                            {
                                item.articleCount > 0 ?
                                    <div className={styles.read_btn} onClick={() => handleNews(item)}>{t("partner.readNews")}</div>
                                    :
                                    <></>
                            }
                        </div>
                    )) :
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
                    }
                </div>
            }

            <Modal
                isOpen={isModalOpen}
                showCloseButton={true}
                isFullscreenModal={true}
                onClose={() => { setIsModalOpen(false); setSchool({} as API.SchoolListItem); }}
                title={t('partner.news')}
            >
                <div className={styles.modal_content}>
                    <div className={styles.news_school}>
                        <LoadingImg noPlaceholder src={school.logoUrl} style={{ width: '100%', height: '100%' }} width={500} height={300} alt={school.nameEn} />
                    </div>
                    <NewsList
                        newsList={newsList}
                        loading={loading}
                        page={page}
                        total={total}
                        pageSize={4}
                        showSchoolList={false}
                        onPageChange={(page) => {
                            setPage(page);
                        }}
                        clickItem={clickItem}
                    />
                </div>
            </Modal>
            <Modal
                isOpen={isNewsDetailModalOpen}
                showCloseButton={true}
                isFullscreenModal={true}
                onClose={handleClose}
                title={""}
                onBack={handleBack}
            >
                <div className={styles.modal_content}>
                    <NewsDetail
                        id={newsId as string}
                        showPageHeader={false}
                        enableImageModal={true}
                        showSchoolList={false}
                    />
                </div>
            </Modal>
        </>
    );
};

export default SchoolList;