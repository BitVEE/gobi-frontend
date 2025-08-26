import { useDispatch, useSelector } from 'react-redux';
import { ToastItem, removeToast } from '@/redux/slice/toastSlice';
import styles from './toast.module.scss';
import { useEffect } from 'react';

export default function Toast() {
    const { queue } = useSelector((state: any) => state.toastSlice);

    if (!queue.length) return null;
    return (
        <div className={styles.container}>
            {queue.map((toast: ToastItem) => (
                <ToastItemComponent
                    key={toast.id}
                    {...toast}
                />
            ))}
        </div>
    );

}

const ToastItemComponent = ({ id, message, type, timeout = 3000 }: ToastItem) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(removeToast(id));
        }, timeout);
        return () => clearTimeout(timer);
    }, [id]);

    return (
        <div className={`${styles.toast} ${styles[type]}`}>
            {/* <span className={styles.icon}>此处添加类型图标</span> */}
            <div className={styles.message}>{message}</div>
            <button className={styles.close} onClick={() => dispatch(removeToast(id))}>
                ×
            </button>
        </div>
    );
}