

import React from 'react';
import Image from 'next/image';
import PaginationIndicator from '../PaginationIndicator';
import { useTranslation } from 'next-i18next';
import styles from './newList.module.scss';
import { useRouter } from 'next/router';
import { useState } from 'react';

import Modal from '@/components/Modal';

interface NewsListProps {
    posterList: API.UserPosterItem[];
    loading: boolean;
    page?: number;
    total?: number;
    pageSize?: number;
    onPageChange?: (page: number) => void;
    clickItem?: (id: number) => void;
}

const NewsList: React.FC<NewsListProps> = ({
    posterList,
    loading,
    page,
    total,
    pageSize = 9,
    onPageChange,
    clickItem = (id: number) => { },
}) => {
    const { t } = useTranslation("common");
    const { locale } = useRouter();

    const [isShowModal, setIsShowModal] = useState(false);
    const [currentPosterUrl, setCurrentPosterUrl] = useState<string | null>(null);

    return (
        <div className={styles.news_list}>
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
            {!loading && posterList.length === 0 && (
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
            {!loading && posterList.length > 0 && (
                <div className={styles.news_list_wrapper_no_school}>
                    {
                        posterList.map((item) => (
                            <Image
                                key={item.id}
                                src={item.url}
                                alt={item.createdAt}
                                width={180}
                                height={240}
                                className={styles.poster_image}
                                // onClick={() => { setIsShowModal(true); setCurrentPosterUrl(item.url) }}
                            />
                        ))
                    }
                </div>
            )}
            {!loading && onPageChange && posterList.length > 0 && page && total && (
                <div className={styles.pagination}>
                    <PaginationIndicator
                        current={page}
                        total={total}
                        pageSize={pageSize}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
            <Modal
                isOpen={isShowModal}
                onClose={() => setIsShowModal(false)}
                showCloseButton
                title=""
            // isFullscreenModal={isMobile}
            >
                <Image
                    src={currentPosterUrl || ''}
                    alt={'poster'}
                    width={180}
                    height={240}
                    // className={styles.poster_image}
                />
            </Modal>
        </div>
    );
};

export default NewsList;