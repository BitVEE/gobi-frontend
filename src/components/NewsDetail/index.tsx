import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import PageHeader from '../PageHeader';
import LoadingImg from '../LoadingImg';
import { NewsAPI } from '@/api';
import { formatDate } from '@/utils/tool';
import styles from './newsDetail.module.scss';

// 提取 YouTube 视频 ID 的工具函数
const extractYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

// 学校列表项组件 - 提取到外部避免重复定义
const SchoolItem = React.memo<{ school: any }>(({ school }) => (
    <div className={styles.card_school_item}>
        <img src={school.logoUrl} alt={school.nameZh} />
    </div>
));
SchoolItem.displayName = 'SchoolItem';

// 图片项组件 - 提取到外部避免重复定义
const ImageItem = React.memo<{ item: any; index: number; onImageClick: (index: number) => void }>(
    ({ item, index, onImageClick }) => (
        <div
            className={styles.newsDetailImage}
            onClick={() => onImageClick(index)}
        >
            <LoadingImg
                style={{ width: '100%', height: 'auto' }}
                src={item.url}
                alt={item.url}
                width={400}
                height={208}
            />
        </div>
    )
);
ImageItem.displayName = 'ImageItem';

// 视频项组件 - 提取到外部避免重复定义
const VideoItem = React.memo<{ item: any }>(({ item }) => {
    const videoId = extractYouTubeVideoId(item.url);

    return (
        <div className={styles.newsDetailVideo}>
            {!videoId ? (
                <video
                    src={item.url}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    crossOrigin="anonymous"
                />
            ) : (
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={videoId}
                    frameBorder="0"
                    allowFullScreen
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                />
            )}
        </div>
    );
});
VideoItem.displayName = 'VideoItem';

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

    // 请求资讯详情数据
    const getNewsDetail = useCallback(() => {
        setNewsDetail(undefined);
        setLoading(true);
        NewsAPI.getNewsDetail(id).then((res) => {
            setNewsDetail(res.data.data.article as API.NewsListItem);
            setLoading(false);
        }).catch((err) => {
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (id) {
            getNewsDetail();
        }
    }, [id, getNewsDetail]);

    // 图片模态框相关功能
    const openImageModal = useCallback((index: number) => {
        if (!enableImageModal) {
            return;
        }
        setCurrentImageIndex(index);
        setIsModalOpen(true);
    }, [enableImageModal]);

    const closeImageModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const goToPreviousImage = useCallback(() => {
        if (newsDetail?.imageList && newsDetail.imageList.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === 0 ? newsDetail.imageList.length - 1 : prevIndex - 1
            );
        }
    }, [newsDetail?.imageList]);

    const goToNextImage = useCallback(() => {
        if (newsDetail?.imageList && newsDetail.imageList.length > 0) {
            setCurrentImageIndex((prevIndex) =>
                prevIndex === newsDetail.imageList.length - 1 ? 0 : prevIndex + 1
            );
        }
    }, [newsDetail?.imageList]);

    // 获取页面标题 - 使用 useMemo 缓存
    const pageTitle = useMemo(() => {
        if (customTitle) return customTitle;

        if (newsDetail?.type === 2) {
            return t('header.raceImageList.selectedAlbum');
        } else if (newsDetail?.type === 3) {
            return t('header.raceImageList.selectedVideo');
        }
        return '';
    }, [customTitle, newsDetail?.type, t]);

    // 获取背景图片 - 使用 useMemo 缓存
    const backgroundImage = useMemo(() => {
        if (customBackgroundImage) return customBackgroundImage;
        return newsDetail?.coverUrl || '/images/title_bg/race_info_page_bg.png';
    }, [customBackgroundImage, newsDetail?.coverUrl]);

    // 渲染加载状态 - 使用 useMemo 缓存
    const renderLoading = useMemo(() => (
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
    ), [t]);

    // 渲染无数据状态 - 使用 useMemo 缓存
    const renderNoData = useMemo(() => (
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
    ), [t]);

    // 渲染资讯标题和时间 - 使用 useMemo 缓存
    const renderTitleAndTime = useMemo(() => {
        if (!newsDetail) return null;

        const titleText = locale === 'zh' ? newsDetail.titleZh : newsDetail.titleEn;
        const formattedDate = formatDate(Number(newsDetail.createdAt) * 1000);

        return (
            <div className={styles.newsDetailTitle}>
                <div className={styles.newsDetailTitleContent}>
                    {(showSchoolList && newsDetail.schoolList && newsDetail.schoolList.length > 0) ? (
                        <>
                            <div className={styles.card_school}>
                                {newsDetail.schoolList.map((school) => (
                                    <SchoolItem key={school.id} school={school} />
                                ))}
                            </div>
                            <div className={styles.newsDetailTitleLine}></div>
                            <div className={styles.newsDetailTitleText}>
                                {titleText}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.newsDetailTitleText}>
                                {titleText}
                            </div>
                            <div className={styles.newsDetailTitleLine}></div>
                        </>)
                    }
                </div>
                <div className={styles.newsDetailTime}>
                    {formattedDate}
                </div>
                <div className={styles.newsDetailTitleTextMobile}>
                    {titleText}
                </div>
            </div>
        );
    }, [newsDetail, locale, showSchoolList]);

    // 渲染资讯文章内容（type=1）- 使用 useMemo 缓存
    const renderArticleContent = useMemo(() => {
        if (!newsDetail) return null;
        const content = locale === 'zh' ? newsDetail.contentZh : newsDetail.contentEn;
        return (
            <div className={styles.newsDetailContent}>
                <div
                    className={styles.rich_text}
                    dangerouslySetInnerHTML={{
                        __html: content || ''
                    }}
                />
            </div>
        );
    }, [newsDetail, locale]);

    // 渲染图片列表（type=2）- 使用 useMemo 缓存渲染结果
    const renderImageList = useMemo(() => {
        const imageList = newsDetail?.imageList || [];
        if (imageList.length === 0) return null;

        const gridClass = imageList.length > 2 ? styles.newsDetailImageList : styles.newsDetailSingleImageList;

        return (
            <div className={gridClass}>
                {imageList.map((item: any, index: number) => (
                    <ImageItem
                        key={item.id}
                        item={item}
                        index={index}
                        onImageClick={openImageModal}
                    />
                ))}
            </div>
        );
    }, [newsDetail?.imageList, openImageModal]);

    // 渲染视频列表（type=3）- 使用 useMemo 缓存
    const renderVideoList = useMemo(() => {
        const videoList = newsDetail?.imageList || [];
        if (videoList.length === 0) return null;

        const gridClass = videoList.length > 2 ? styles.newsDetailImageList : styles.newsDetailVideoList;

        return (
            <div className={gridClass}>
                {videoList.map((item: any) => (
                    <VideoItem key={item.id} item={item} />
                ))}
            </div>
        );
    }, [newsDetail?.imageList]);

    // 渲染图片模态框 - 使用 useMemo 缓存
    const renderImageModal = useMemo(() => {
        if (!isModalOpen || !newsDetail?.imageList || !newsDetail.imageList[currentImageIndex]) {
            return null;
        }

        const currentImage = newsDetail.imageList[currentImageIndex];

        return (
            <div className={styles.imageModal}>
                <div className={styles.imageModalContent}>
                    <div className={styles.modalImageContainer}>
                        <div className={styles.modalPrevButton} onClick={goToPreviousImage}>
                            <Image src="/images/icons/arrow-down.svg" width={24} height={24} alt="Prev" />
                        </div>
                        <LoadingImg
                            style={{ width: '100%', height: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                            src={currentImage.url}
                            alt={currentImage.url}
                            width={800}
                            height={416}
                        />
                        <div className={styles.modalGeneratePosterButton}>
                            <Image src="/images/icons/poster.svg" width={24} height={24} alt="Poster" />
                            <div className={styles.modalGeneratePosterButtonText}>{t('common.generatePoster')}</div>
                        </div>
                        <div className={styles.modalCancelButton} onClick={closeImageModal}>
                            <Image src="/images/icons/close.svg" width={24} height={24} alt="Close" />
                        </div>

                        <div className={styles.modalNextButton} onClick={goToNextImage}>
                            <Image src="/images/icons/arrow-down.svg" width={24} height={24} alt="Next" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [isModalOpen, newsDetail?.imageList, currentImageIndex, closeImageModal, goToPreviousImage, goToNextImage]);

    return (
        <div className={`${styles.newsDetail} ${className}`}>
            {/* 页面头部 */}
            {showPageHeader && (
                <PageHeader
                    title={pageTitle}
                    backgroundImage={backgroundImage}
                />
            )}

            <div className={styles.newsDetailContainer}>
                <div className={styles.newsDetailContentWrapper}>
                    {/* 加载状态 */}
                    {loading && renderLoading}

                    {/* 无数据状态 */}
                    {!loading && !newsDetail?.id && renderNoData}

                    {/* 资讯内容 */}
                    {!loading && newsDetail?.id && (
                        <>
                            {renderTitleAndTime}

                            {/* 根据资讯类型渲染不同内容 */}
                            {newsDetail.type === 1 && renderArticleContent}
                            {newsDetail.type === 2 && renderImageList}
                            {newsDetail.type === 3 && renderVideoList}
                        </>
                    )}
                </div>
            </div>

            {/* 图片模态框 */}
            {renderImageModal}
        </div>
    );
};

export default NewsDetail;