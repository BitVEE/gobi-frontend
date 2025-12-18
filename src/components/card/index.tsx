import { useRouter } from 'next/router'
import { useState } from 'react';
import styles from './card.module.scss'
import LoadingImg from '../LoadingImg';

type Props = {
    title?: string;
    text?: string;
    imgSrc?: string;
    link?: string;
    showSchoolList?: boolean;
    schoolList?: API.School[];
    clickItem?: () => void;
};

const Card = ({ title = "", text = "", imgSrc = "/images/icons/loading-img.svg", link, showSchoolList = true, schoolList, clickItem = () => { } }: Props) => {
    const router = useRouter()
    const [isHovered, setIsHovered] = useState(false);


    return (
        <div className={styles.card} onClick={() => (link && router.push(link)) || clickItem()}>
            <div>
                <div className={styles.card_image}>
                    <LoadingImg
                        style={showSchoolList ?
                            { width: "auto", height: "100%", aspectRatio: 4 / 3, objectFit: "cover" } :
                            { width: "auto", height: "100%", aspectRatio: 4 / 1.1, objectFit: "cover" }}
                        src={imgSrc}
                        alt={imgSrc}
                        width={400}
                        height={300}
                    />
                </div>
            </div>
            <div className={styles.card_content} style={{ backgroundColor: isHovered ? "#FF6A14" : "#F8F8F8", color: isHovered ? "#FFFFFF" : "#121212" }} onTouchStartCapture={() => setIsHovered(true)} onTouchEndCapture={() => setIsHovered(false)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                <div className={styles.card_box}>
                    {showSchoolList && schoolList && schoolList?.length > 0 && (
                        <div className={styles.card_school}>
                            {schoolList?.map((school) => (
                                <div key={school.id} className={styles.card_school_item}>
                                    <img src={school.logoUrl} alt={school.nameZh} />
                                </div>
                            ))}
                        </div>
                    )}
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