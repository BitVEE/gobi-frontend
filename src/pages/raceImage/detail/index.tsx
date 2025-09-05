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
import LoadingImg from "@/components/LoadingImg";

const RaceImageDetail = () => {
    const router = useRouter();
    const { locale } = router;
    const { id } = router.query;
    const { t } = useTranslation("common");
    const [loading, setLoading] = useState<boolean>(false);
    const [newsDetail, setNewsDetail] = useState<API.NewsListItem>();
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    // 监听页面宽度变化
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined' && window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            } else {
                setIsMobileMenuOpen(true);
            }
        };
        if (typeof window !== 'undefined') {
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

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

    const openImageModal = (index: number) => {
        if (isMobileMenuOpen) {
            return;
        }
        setCurrentImageIndex(index);
        setIsModalOpen(true);
    };

    const closeImageModal = () => {
        setIsModalOpen(false);
    };

    const goToPreviousImage = () => {
        if (newsDetail?.imageList && newsDetail.imageList.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? newsDetail.imageList.length - 1 : prevIndex - 1
            );
        }
    };

    const goToNextImage = () => {
        if (newsDetail?.imageList && newsDetail.imageList.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === newsDetail.imageList.length - 1 ? 0 : prevIndex + 1
            );
        }
    };

    return (
        <div className={styles.raceImage}>
            <PageHeader title={newsDetail?.type == 2 ? t("header.raceImageList.selectedAlbum") : newsDetail?.type == 3 ? t("header.raceImageList.selectedVideo") : ""} backgroundImage="/images/title_bg/race_image_page_bg.png" />
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
                            {newsDetail?.type == 2 && <div className={styles.raceImageDetailImageList}>
                                {newsDetail?.imageList?.map((item: any, index: number) => (
                                    <div key={item.id} className={styles.raceImageDetailImage} onClick={() => openImageModal(index)}>
                                        <LoadingImg
                                            style={{ width: '100%', height: '100%' }}
                                            src={item.url}
                                            alt={item.url}
                                            width={400}
                                            height={208}
                                        />
                                    </div>
                                ))}
                            </div>}
                            {newsDetail?.type == 3 && <div className={newsDetail?.imageList?.length > 2 ? styles.raceImageDetailImageList : styles.raceVideoDetailImageList}>
                                {newsDetail?.imageList?.map((item: any) => (
                                    <div key={item.id} className={styles.raceImageDetailImage}>
                                        <video src={item.url} controls style={{ width: '100%', height: '100%' }} crossOrigin="anonymous" />
                                    </div>
                                ))}
                            </div>}
                        </>
                    }
                </div>
            </div>

            {/* 图片放大展示模态框 */}
            {isModalOpen && newsDetail?.imageList && (
                <div className={styles.imageModal} onClick={closeImageModal}>
                    <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.modalCloseButton} onClick={closeImageModal}>
                            ×
                        </button>
                        <button className={styles.modalPrevButton} onClick={goToPreviousImage}>
                            ‹
                        </button>
                        <div className={styles.modalImageContainer}>
                            <LoadingImg
                                style={{ width: '100%', height: '100%' }}
                                src={newsDetail.imageList[currentImageIndex].url}
                                alt={newsDetail.imageList[currentImageIndex].url}
                                width={800}
                                height={416}
                            />
                        </div>
                        <button className={styles.modalNextButton} onClick={goToNextImage}>
                            ›
                        </button>
                        <div className={styles.modalImageCounter}>
                            {currentImageIndex + 1} / {newsDetail.imageList.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RaceImageDetail
export const getStaticProps = getLocaleProps(["common"]);