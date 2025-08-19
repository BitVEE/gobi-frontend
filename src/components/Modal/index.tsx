import { useEffect, useState } from 'react';
import styles from './modal.module.scss';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    showCloseButton?: boolean;
    isClickOutsideToClose?: boolean;
}

const Modal = ({
    isOpen,
    onClose,
    children,
    title = 'title',
    showCloseButton = true,
    isClickOutsideToClose = false,
}: ModalProps) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const handleEsc = (e: any) => {
            if (e.key === 'Escape') {
                handleClose();
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

    const handleClose = () => {
        if(!isClickOutsideToClose) return;
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200); // 匹配动画时长
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div
            className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
            onClick={handleClose}
        >
            <div
                className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h3>{title}</h3>
                    <div className={styles.modalHeaderDivider}>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;