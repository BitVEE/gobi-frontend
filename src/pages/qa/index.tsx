import getLocaleProps from "@/utils/getLocaleProps";
import { useTranslation } from "next-i18next";
import styles from './index.module.scss'
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { useRouter } from "next/router";


const RaceImage = () => {
    const router = useRouter();
    const { tag } = router.query;
    const { t } = useTranslation("common", { keyPrefix: "qa" });

    const raceCards = t("cards.raceCards", { returnObjects: true });
    const healthCards = t("cards.healthCards", { returnObjects: true });

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
            <div className={styles.middleSection}>
                <h2 className={styles.sectionTitle}>{t("raceQuestions")}</h2>
                <div className={styles.sectionDivider}></div>
                <div className={styles.cardContainer}>
                    {
                        (t("raceQa", { returnObjects: true }) as Array<{ title: string, answer: string }>).map((item: { title: string; answer: string }, idx: any) => (
                            <div className={styles.card} key={idx}>
                                <div className={styles.cardTitle}>{item.title}</div>
                                <div className={styles.cardText}>{item.answer}</div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default RaceImage
export const getStaticProps = getLocaleProps(["common"]);