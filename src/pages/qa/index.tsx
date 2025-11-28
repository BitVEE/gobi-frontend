import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from './index.module.scss'
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { useRouter } from "next/router";
import { useState } from "react";
import Image from "next/image";


const RaceImage = () => {
    const router = useRouter();
    const { tag } = router.query;
    const { t } = useTranslation("common", { keyPrefix: "qa" });
    const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

    const toggleCard = (cardKey: string) => {
        setExpandedCards(prev => ({
            ...prev,
            [cardKey]: !prev[cardKey]
        }));
    };

    return (
        <div className={styles.qa}>
            <PageHeader
                title={t("raceQuestions")}
                backgroundImage="/images/q&a/qa_header.png"
            />

            <div className={styles.raceImageContainer}>
                <TagSelector
                    tags={[
                        { title: t('raceQuestions'), value: 'raceQuestions' },
                    ]}
                    styleType='text'
                    selectedValue={'raceQuestions'}
                    loading={false}
                    onChange={(value) => {
                        router.push({
                            pathname: router.pathname
                        })
                    }}
                />
            </div>

            {
                (t("raceQa", { returnObjects: true }) as unknown as Array<{ theme: string, content: any }>).map((item: { theme: string; content: any }, idx: any) => (
                    <div className={styles.middleSection} key={idx}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>{item.theme}</h2>
                            <div className={styles.sectionDivider}></div>
                        </div>
                        <div className={styles.cardContainer}>
                            {
                                item.content.map((item: { title: string, answer: string }, index: any) => {
                                    const cardKey = `${idx}-${index}`;
                                    const isExpanded = expandedCards[cardKey];

                                    return (
                                        <div
                                            className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}
                                            key={index}
                                            onClick={() => toggleCard(cardKey)}
                                        >
                                            <div className={styles.cardHeader}>
                                                <div className={styles.cardTitle}>{item.title}</div>
                                                <div className={styles.arrowContainer}>
                                                    <Image className={`${styles.arrow} ${isExpanded ? styles.arrowUp : styles.arrowDown}`} src='/images/icons/arrow-square-right.svg' width={24} height={24} alt='arrow-square-right'></Image>
                                                </div>
                                            </div>
                                            <div onClick={(e) => e.stopPropagation()} className={`${styles.cardContent} ${isExpanded ? styles.contentVisible : styles.contentHidden}`}>
                                                <div className={styles.cardText}>{item.answer}</div>
                                            </div>
                                        </div>
                                    );
                                })
                            }
                        </div>

                    </div>
                ))
            }
        </div>
    )
}

export default RaceImage
export const getStaticProps = getLocaleProps(["common"]);