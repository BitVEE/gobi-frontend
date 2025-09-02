import { useRouter } from 'next/router'
import { useState } from 'react';
import styles from './card.module.scss'
import LoadingImg from '../LoadingImg';

type Props = {
    title?: string;
    text?: string;
    imgSrc?: string;
    link?: string;
};

const Card = ({ title = "", text = "", imgSrc = "/images/home/poster.png", link }: Props) => {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false);


    return (
        <div className={styles.card}>
            <div onClick={() => link && router.push(link)}>
                <div className={styles.card_image}>
                    <LoadingImg
                        style={{ width: "100%", height: "100%" }}
                        src={imgSrc}
                        alt={imgSrc}
                        width={400}
                        height={300}
                    />
                </div>
            </div>
            <div className={styles.card_content} style={{ backgroundColor: isHovered ? "#FF6A14" : "#F8F8F8", color: isHovered ? "#FFFFFF" : "#121212" }} onTouchStartCapture={() => setIsHovered(true)} onTouchEndCapture={() => setIsHovered(false)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div className={styles.card_box}>
                    <div className={styles.card_title}>
                        {title}
                    </div>
                    <div className={styles.card_text} style={{ borderTop: `1px solid ${isHovered ? "#FFFFFF" : "#121212"}` }}>
                        {text}
                        {link && (
                            <div className={styles.card_arrow}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.90997 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.90997 4.07996" stroke={isHovered ? "#FFFFFF" : "#121212"} strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Card