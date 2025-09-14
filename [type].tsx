import { useRouter } from 'next/router'
import styles from './about.module.scss'
import { useTranslation } from "next-i18next";
import Image from 'next/image'
import getLocaleProps from "@/utils/getLocaleProps"
import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TagSelector from "@/components/TagSelector";
import { AuthAPI } from "@/api";
import TableComponent from "@/components/Table";

type Props={};

const About = (props: Props) => {
    const { t } = useTranslation("common", { keyPrefix: "about" });
    const router = useRouter();
    const { type } = router.query;
    const [selectedSubTitle, setSelectedSubTitle] = useState<string | number>(
        typeof type === 'string' ? type : ''
    );


    useEffect(() => {
        if (type) {
            if (typeof type === 'string') {
                setSelectedSubTitle(type)
            } else if (Array.isArray(type) && type.length > 0) {
                setSelectedSubTitle(type[0])
            }

            const element = document.getElementById(type as string);
            const headerElement = document.getElementById('site-header');
            const headerOffset = headerElement?.getBoundingClientRect().height ?? 0;

            if (element) {
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 10;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        }

    }, [type])


    return(
        <div className={styles.about}>
            <PageHeader title={t('title')} backgroundImage="/images/about/header.png" />

            <div className={styles.all}>
                <div>
                    <TagSelector
                        tags={[
                            { title: t('brandStory'), value: 'brandStory' },
                            { title: t('contactUs'), value: 'contactUs' }
                        ]}
                        styleType='text'
                        selectedValue={selectedSubTitle}
                        onChange={(value) => { router.push(`/${router.locale }/about/${value}`);  }}
                    />
                </div>

              

                



                <div className={styles.partners} id='brandStory'>
                    <div className={styles.box1}> 
                        <div className={styles.box2}>
                            <div className={styles.titletex}><b>{t("brandStory")}</b></div>
                            <hr className={styles.orangeLine}/>
                        </div>

                        <div className={styles.box3}>
                             <div className={styles.text1}>{t("text")}</div>
                             <div className={styles.text}>{t("text")}</div>

                        </div>

                        <div className={styles.box3}>
                             <div className={styles.text1}>{t("text")}</div>
                             <div className={styles.text}>{t("text")}</div>

                        </div>

                         <div className={styles.box4}>
                             <div className={styles.text1}>{t("text")}</div>
                             <div className={styles.text}>{t("text")}</div>

                        </div>
                    </div>
                </div>







                
                <div className={styles.partners} id='contactUs'>
                   <div className={styles.box1}> 
                        <div className={styles.box2}>
                            <div className={styles.titletex}><b>{t("contactUs")}</b></div>
                            <hr className={styles.orangeLine}/>
                    </div>
                         <div className={styles.contact_qrcode}>
                            <Image src="/images/contactQRCode.jpg" width={100} height={100}  alt='contact'/>
                        </div>
                    </div>
                </div>
                    {/* "cards":{
                        "card1":{image}
                        "crad2":{image}
                           
                    } */}

            </div>
            
        </div> 
)}
    


export default About
export const getStaticProps = getLocaleProps(["common"]);

export async function getStaticPaths() {
    return {
        paths: [],
        fallback: 'blocking',
    }
}