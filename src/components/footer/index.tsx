import { useRouter } from 'next/router'
import styles from './footer.module.scss'
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import routerList from '@/utils/routerList';

type RouterChild = {
    name: string;
    path: string;
    link?: string;
    dividerBefore?: boolean;
};

type RouterItem = {
    name: string;
    path?: string;
    children?: RouterChild[];
    isDisplay?: boolean;
};

type Props = {};

(routerList as RouterItem[]).forEach((item) => {
    item.isDisplay = false;
});

const Footer = (props: Props) => {
    const router = useRouter()
    const { t } = useTranslation("common");
    const [linksList, setLinksList] = useState(routerList)

    const displaySubmenu = (name: string) => {
        if (window.innerWidth <= 768) {
            let data = linksList
            data.map((val: RouterItem) => val.isDisplay = val.name === name)
            setLinksList(JSON.parse(JSON.stringify(data)))
        }
    }

    return (
        <div className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerLogo}>
                    <Image className={styles.logo} width={153} height={44} src="/images/logo-202609.svg" alt="GOBI" />
                    <div className={styles.followUs}>
                        {t("home.followUs")}
                        <div className={styles.iconsContainer}>
                            <div className={styles.qrcode}>
                                <Image className={styles.qrcodeImg} src="/images/contactQRCode.jpg" width={150} height={150} alt='contact' />
                                <Image className={styles.icons} width={24} height={24} src="/images/icons/wechat1.svg" alt="wechat" />
                            </div>

                            <div className={styles.qrcode}>
                                <Image className={styles.qrcodeImg} style={{ padding: "15px 10px 10px 10px" }} src="/images/adminQRCode.png" width={150} height={150} alt='contact' />
                                <Image className={styles.icons} width={22} height={22} src="/images/icons/wechat2.svg" alt="wechat" />
                            </div>
                            <div className={styles.qrcode}>
                                <Image className={styles.qrcodeImg} style={{ padding: "12px 5px 5px 10px" }} src="/images/adminWAQRCode.png" width={150} height={150} alt='contact' />
                                <Image className={styles.icons} width={22} height={22} src="/images/icons/whatsapp.svg" alt="whatsapp" />
                            </div>
                            <a href="mailto:yaolan@exploring.cn" target="_blank">
                                <Image className={styles.icons} width={24} height={24} src="/images/icons/email.svg" alt="email" />
                            </a>
                        </div>
                    </div>

                </div>
                <div className={styles.footerDivider}>
                </div>
                <div className={styles.footerLinks}>
                    {
                        linksList.map((item: RouterItem) => (
                            <div key={item.name} className={styles.footerLinkItem}>
                                {!item.children ? (
                                    <a href={"/" + router.locale + item.path} className={styles.link_title}>{t(`header.${item.name}` as any)}</a>
                                ) : (
                                    <div className={styles.dropdown}>
                                        <div className={styles.link_title} onClick={() => displaySubmenu(item.name)}>
                                            {t(`header.${item.name}` as any)}
                                        </div>
                                        {
                                            (window.innerWidth > 768 || item.isDisplay) && (
                                                <div className={styles.dropdownContent}>
                                                    {item.children?.map((child) => (
                                                        child?.link ?
                                                            <a className={styles.dropdownItem} target="_blank" key={child.path} href={child.link}>
                                                                {t(`header.${child.name}` as any)}
                                                            </a>
                                                            :
                                                            <a className={`${styles.dropdownItem} ${child.dividerBefore ? styles.separatedItem : ''}`} key={child.path} href={"/" + router.locale + child.path}>
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
                    {t("home.copyright")}
                </div>
            </div>
        </div>
    )
}

export default Footer
