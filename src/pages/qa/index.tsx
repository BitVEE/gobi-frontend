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
                        <h2 className={styles.sectionTitle}>{item.theme}</h2>
                        <div className={styles.sectionDivider}></div>
                        <div className={styles.cardContainer} style={{justifyContent: item.content.length <= 2 ? 'flex-start' : 'space-between', gap: item.content.length <= 2 ? '20px' : '0'}}>
                            {
                                item.content.map((item: { title: string, answer: string }, index: any) =>
                                    <div className={styles.card} key={index}>
                                        <div className={styles.cardTitle}>{item.title}</div>
                                        <div className={styles.cardText}>{item.answer}</div>
                                    </div>
                                )
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