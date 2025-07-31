import React, { useEffect } from 'react'
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next'
import styles from './Header.module.scss'
import routerList from '@/utils/routerList';

const Header = () => {
    const router = useRouter()
    const { t } = useTranslation("common")

    const handleLanguageChange = (key: any) => {
        router.push(router.route, router.asPath, {
            locale: key,
        });
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <img className={styles.logo} src="/images/logo.png" alt="GOBI" />
                <nav className={styles.nav}>
                    {routerList.map((item) => (
                        <div key={item.path} className={styles.navItem} >
                            {!item.children ? (
                                <a href={"/" + router.locale + item.path} className={router.pathname === item.path ? styles.active : ''}>{t(`header.${item.name}`)}</a>
                            ) : (
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownTrigger}>
                                        {t(`header.${item.name}`)}
                                        <img className={styles.dropdownTriggerArrow} src="/images/arrow-down.svg" alt="arrow" />
                                    </div>
                                    <div className={styles.dropdownContent}>
                                        {item.children?.map((child) => (
                                            <a className={styles.dropdownItem} key={child.path} href={"/" + router.locale + child.path}>
                                                {t(`header.${child.name}`)}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
                <div className={styles.languageProfile}>
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownTrigger}>
                            <img className={styles.languageIcon} src="/images/translate.svg" alt="translate" />
                        </div>
                        <div className={styles.dropdownContent}>
                            <div className={router.locale === 'en' ? styles.dropdownItemActive : styles.dropdownItem} onClick={() => handleLanguageChange('en')}>{t('common.english')}</div>
                            <div className={router.locale === 'zh' ? styles.dropdownItemActive : styles.dropdownItem} onClick={() => handleLanguageChange('zh')}>{t('common.chinese')}</div>
                        </div>
                    </div>
                    <img className={styles.profileIcon} src="/images/profile.svg" alt="profile" />
                </div>
            </div>
        </header>
    )
}

export default Header
