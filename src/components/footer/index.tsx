import { useRouter } from 'next/router'
import styles from './footer.module.scss'
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import routerList from '@/utils/routerList';

type Props = {};

const Footer = (props: Props) => {
    const router = useRouter()
    const { t } = useTranslation("common");

    return (
        <div className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLogo}>
                    <Image className={styles.logo} width={54.6} height={21} src="/images/logo.png" alt="GOBI" />
                    <div className={styles.followUs}>
                        {t("home.followUs" as any)}
                        <div className={styles.iconsContainer}>
                            <Image className={styles.icons} width={24} height={24} src="/images/icons/twitch.svg" alt="twitch" />
                            <Image className={styles.icons} width={24} height={24} src="/images/icons/snapchat.svg" alt="twitch" />
                            <Image className={styles.icons} width={24} height={24} src="/images/icons/facebook.svg" alt="twitch" />
                            <Image className={styles.icons} width={24} height={24} src="/images/icons/youtube.svg" alt="twitch" />
                        </div>
                    </div>

                </div>
                <div className={styles.footerDivider}>
                </div>
                <div className={styles.footerLinks}>
                    {
                        routerList.map((item) => (
                            <div key={item.name} className={styles.footerLinkItem}>
                                {!item.children ? (
                                    <a href={"/" + router.locale + item.path} className={styles.link_title}>{t(`header.${item.name}` as any)}</a>
                                ) : (
                                    <div className={styles.dropdown}>
                                        <div className={styles.link_title}>
                                            {t(`header.${item.name}` as any)}
                                        </div>
                                        {
                                            window.innerWidth > 768 && (
                                                <div className={styles.dropdownContent}>
                                                    {item.children?.map((child) => (
                                                        <a className={styles.dropdownItem} key={child.path} href={"/" + router.locale + child.path}>
                                                            {t(`header.${child.name}` as any)}
                                                        </a>
                                                    ))}
                                                </div>
                                            )
                                        }
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>

                <div className={styles.copyright}>
                    {t("home.copyright" as any)}
                </div>
            </div>
        </div>
    )
}

export default Footer