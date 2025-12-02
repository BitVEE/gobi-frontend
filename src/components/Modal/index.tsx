import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './modal.module.scss';
import { useTranslation } from 'next-i18next';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBack?: () => void;
    children: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
    isFullscreenModal?: boolean;
    isClickOutsideToClose?: boolean;
}

const Modal = ({
    isOpen,
    onClose,
    children,
    title = 'title',
    showCloseButton = false,
    isFullscreenModal = false,
    isClickOutsideToClose = false,
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
            onClick={handleClose}
        >
            <div
                className={`${styles.modalContent} ${isFullscreenModal ? styles.fullscreenModalContent : styles.commonModalContent} ${isClosing ? styles.closing : ''}`}
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
                        <Image src="/images/icons/closeModal.svg" width={24} height={24} alt="Close" />
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