import { useRouter } from 'next/router'
import { useState } from 'react';
import styles from './card.module.scss'
import Image from 'next/image';

type Props = {
    width?: number;
    height?: number;
    imgHeight?: number;
    title?: string;
    text?: string;
    imgSrc?: string;
    isShowBorder?: boolean;
};

const Card = ({ width = 400, height = 455, imgHeight = 208, title = "", text = "", imgSrc = "/images/home/poster.svg", isShowBorder = true }: Props) => {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className={styles.card} style={{ width: `${width}px`, height: `${height}px` }}>
            <div style={{ height: `${imgHeight}px` }}>
                <Image
                    src={imgSrc}
                    alt="News Poster"
                    width={width}
                    height={imgHeight}
                    className={styles.card_image}
                />
            </div>
            <div className={styles.card_content} style={{ height: `${height - imgHeight}px`, backgroundColor: isHovered ? "#FF6A14" : "#F8F8F8", color: isHovered ? "#FFFFFF" : "#121212" }} onTouchStartCapture={() => setIsHovered(true)} onTouchEndCapture={() => setIsHovered(false)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div className={styles.card_box}>
                    <div className={styles.card_title}>
                        {title}
                    </div>
                    <div className={styles.card_text} style={{ borderTop: isShowBorder ? `1px solid ${isHovered ? "#FFFFFF" : "#121212"}` : 'none' }} onClick={() => router.push('/news')}>
                        {text}
                        {
                            isShowBorder ?
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.90997 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.90997 4.07996" stroke={isHovered ? "#FFFFFF" : "#121212"} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                : null
                        }

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card