import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import PageHeader from '../PageHeader';
import LoadingImg from '../LoadingImg';
import { NewsAPI } from '@/api';
import { formatDate } from '@/utils/tool';
import styles from './newsDetail.module.scss';

interface NewsDetailProps {
    /** 资讯ID */
    id: string;
    /** 自定义页面标题 */
    customTitle?: string;
    /** 自定义背景图片 */
    customBackgroundImage?: string;
    /** 是否显示页面头部 */
    showPageHeader?: boolean;
    /** 是否启用图片模态框（仅对图片类型有效） */
    enableImageModal?: boolean;
    /** 自定义样式类名 */
    className?: string;
    /** 是否显示学校列表 */
    showSchoolList?: boolean;
}

/**
 * 通用资讯详情组件
 * 根据传入的ID自动请求资讯数据，并根据不同的资讯类型展示相应的内容
 * 
 * 资讯类型说明：
 * - type=1: 资讯文章（显示富文本内容）
 * - type=2: 精选相册（显示图片列表）
 * - type=3: 精选视频（显示视频列表）
 */
const NewsDetail: React.FC<NewsDetailProps> = ({
    id,
    customTitle,
    customBackgroundImage,
    showPageHeader = true,
    enableImageModal = true,
    className = '',
    showSchoolList = true,
}) => {
    const router = useRouter();
    const { locale } = router;
    const { t } = useTranslation('common');

    const [loading, setLoading] = useState<boolean>(false);
    const [newsDetail, setNewsDetail] = useState<API.NewsListItem>();
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // 监听页面宽度变化
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth <= 768);
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

    // 请求资讯详情数据
    useEffect(() => {
        if (id) {
            getNewsDetail();
        }
    }, [id]);

    const getNewsDetail = () => {
        if (loading) {
            return;
        }
        setNewsDetail(undefined);
        setLoading(true);
        NewsAPI.getNewsDetail(id).then((res) => {
            setNewsDetail(res.data.data.article as API.NewsListItem);
            setLoading(false);
        }).catch((err) => {
            setLoading(false);
        });
    };

    // 图片模态框相关功能
    const openImageModal = (index: number) => {
        if (isMobile || !enableImageModal) {
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

    // 获取页面标题
    const getPageTitle = () => {
        if (customTitle) return customTitle;

        if (newsDetail?.type === 2) {
            return t('header.raceImageList.selectedAlbum');
        } else if (newsDetail?.type === 3) {
            return t('header.raceImageList.selectedVideo');
        }
        return '';
    };

    // 获取背景图片
    const getBackgroundImage = () => {
        if (customBackgroundImage) return customBackgroundImage;
        return newsDetail?.coverUrl || '/images/title_bg/race_info_page_bg.png';
    };

    // 渲染加载状态
    const renderLoading = () => (
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
    );

    // 渲染无数据状态
    const renderNoData = () => (
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
    );

    // 渲染资讯标题和时间
    const renderTitleAndTime = () => (
        <div className={styles.newsDetailTitle}>
            <div className={styles.newsDetailTitleContent}>
                {(showSchoolList && newsDetail?.schoolList && newsDetail.schoolList?.length > 0) ? (
                    <>
                        <div className={styles.card_school}>
                            {newsDetail.schoolList?.map((school) => (
                                <div key={school.id} className={styles.card_school_item}>
                                    <img src={school.logoUrl} alt={school.nameZh} />
                                </div>
                            ))}
                        </div>
                        <div className={styles.newsDetailTitleLine}></div>
                        <div className={styles.newsDetailTitleText}>
                            {locale === 'zh' ? newsDetail?.titleZh : newsDetail?.titleEn}
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.newsDetailTitleText}>
                            {locale === 'zh' ? newsDetail?.titleZh : newsDetail?.titleEn}
                        </div>
                        <div className={styles.newsDetailTitleLine}></div>
                    </>)
                }
            </div>
            <div className={styles.newsDetailTime}>
                {formatDate(Number(newsDetail?.createdAt) * 1000)}
            </div>
            <div className={styles.newsDetailTitleTextMobile}>
                {locale === 'zh' ? newsDetail?.titleZh : newsDetail?.titleEn}
            </div>
        </div>
    );

    // 渲染资讯文章内容（type=1）
    const renderArticleContent = () => (
        <div className={styles.newsDetailContent}>
            <div
                className={styles.rich_text}
                dangerouslySetInnerHTML={{
                    __html: (locale === 'zh' ? newsDetail?.contentZh : newsDetail?.contentEn) || ''
                }}
            />
        </div>
    );

    // 渲染图片列表（type=2）
    const renderImageList = () => {
        const imageList = newsDetail?.imageList || [];
        const gridClass = imageList.length > 2 ? styles.newsDetailImageList : styles.newsDetailSingleImageList;

        return (
            <div className={gridClass}>
                {imageList.map((item: any, index: number) => (
                    <div
                        key={item.id}
                        className={styles.newsDetailImage}
                        onClick={() => openImageModal(index)}
                    >
                        <LoadingImg
                            style={{ width: '100%', height: '100%' }}
                            src={item.url}
                            alt={item.url}
                            width={400}
                            height={208}
                        />
                    </div>
                ))}
            </div>
        );
    };

    // 渲染视频列表（type=3）
    const renderVideoList = () => {
        const videoList = newsDetail?.imageList || [];
        const gridClass = videoList.length > 2 ? styles.newsDetailImageList : styles.newsDetailVideoList;

        return (
            <div className={gridClass}>
                {videoList.map((item: any) => (
                    <div key={item.id} className={styles.newsDetailVideo}>
                        <video
                            src={item.url}
                            controls
                            style={{ width: '100%', height: '100%' }}
                            crossOrigin="anonymous"
                        />
                    </div>
                ))}
            </div>
        );
    };

    // 渲染图片模态框
    const renderImageModal = () => {
        if (!isModalOpen || !newsDetail?.imageList || isMobile) {
            return null;
        }

        return (
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
        );
    };

    return (
        <div className={`${styles.newsDetail} ${className}`}>
            {/* 页面头部 */}
            {showPageHeader && (
                <PageHeader
                    title={getPageTitle()}
                    backgroundImage={getBackgroundImage()}
                />
            )}

            <div className={showSchoolList ? styles.newsDetailContainer : styles.newsDetailContainerMobile}>
                <div className={styles.newsDetailContentWrapper}>
                    {/* 加载状态 */}
                    {loading && renderLoading()}

                    {/* 无数据状态 */}
                    {!loading && !newsDetail?.id && renderNoData()}

                    {/* 资讯内容 */}
                    {!loading && newsDetail?.id && (
                        <>
                            {renderTitleAndTime()}

                            {/* 根据资讯类型渲染不同内容 */}
                            {newsDetail.type === 1 && renderArticleContent()}
                            {newsDetail.type === 2 && renderImageList()}
                            {newsDetail.type === 3 && renderVideoList()}
                        </>
                    )}
                </div>
            </div>

            {/* 图片模态框 */}
            {renderImageModal()}
        </div>
    );
};

export default NewsDetail;