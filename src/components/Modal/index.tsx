import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './modal.module.scss';
import { useTranslation } from 'next-i18next';
import { AuthAPI } from '@/api';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBack?: () => void;
    children: React.ReactNode;
    title?: string;
    bgc?: string;
    posterUrl?: string;
    posterFilename?: string;
    posterId?: number;
    page?: number;
    showCloseButton?: boolean;
    isFullscreenModal?: boolean;
    isClickOutsideToClose?: boolean;
    isShowPoster?: boolean;
    onPageRefresh?: (val: boolean) => void;
}

const Modal = ({
    isOpen,
    onClose,
    children,
    title = 'title',
    bgc = '#ffffffcc',
    posterUrl = '',
    posterFilename = 'poster.jpg',
    posterId = 0,
    page= 1,
    showCloseButton = false,
    isFullscreenModal = false,
    isClickOutsideToClose = false,
    isShowPoster = false,
    onPageRefresh,
    onBack,
}: ModalProps) => {
    const { t } = useTranslation("common");
    const [isClosing, setIsClosing] = useState(false);

    const startClosing = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200); // 匹配动画时长
    };

    const handleClose = () => {
        if (!isClickOutsideToClose) return;
        startClosing();
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(posterUrl);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = posterFilename || 'download.jpg';
            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    const handleDelete = () => {

        AuthAPI.deleteUserPoster(posterId).then(() => {
            startClosing();
            // window.location.reload();
            onPageRefresh?.(true);
        }).catch((error) => {
            console.error('Delete failed:', error);
        });
    }

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                startClosing();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
            style={{ backgroundColor: bgc }}
            onClick={handleClose}
        >
            <div
                className={`${styles.modalContent} ${isShowPoster ? styles.showPoster : ''} ${isFullscreenModal ? styles.fullscreenModalContent : styles.commonModalContent} ${isClosing ? styles.closing : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {title ? <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <div className={styles.modalHeaderDivider}>
                    </div>
                </div> : onBack && (
                    <div className={styles.modalBackButton} onClick={() => { setIsClosing(false); onBack() }}>
                        <h3>
                            <Image src="/images/icons/arrow-left.svg" width={24} height={24} alt="Back" />
                            {t('common.back')}
                        </h3>
                        <div className={styles.modalHeaderDivider} />
                    </div>
                )}

                {showCloseButton && (
                    <div className={styles.modalCloseButton} onClick={startClosing}>
                        <Image src={isShowPoster ? '/images/icons/circleclose.svg' : '/images/icons/closeModal.svg'} width={24} height={24} alt="Close" />
                    </div>
                )}

                {isShowPoster && (
                    <div className={styles.modalDownloadButton} onClick={handleDownload}>
                        <Image src="/images/icons/download.svg" width={20} height={20} alt="download" />
                    </div>
                )}

                {isShowPoster && (
                    <div className={styles.modalDeleteButton} onClick={handleDelete}>
                        <Image src="/images/icons/delete.svg" width={20} height={24} alt="delete" />
                    </div>
                )}
                <div className={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;