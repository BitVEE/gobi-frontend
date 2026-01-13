import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next'
import styles from './index.module.scss'
import routerList from '@/utils/routerList';
import { store } from '@/redux/store';
import Image from 'next/image';
import { clearToken } from '@/redux/slice/commonSlice';
import { useSelector } from 'react-redux';
import { AuthAPI } from '@/api';
import Link from 'next/link';

const Header = () => {
    const router = useRouter()
    const { t } = useTranslation("common")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dropdownOpenName, setDropdownOpenName] = useState("");
    const token = useSelector((state: any) => state.commonSlice.token);

    const handleLanguageChange = (key: any) => {
        router.push({
            pathname: router.pathname,
            query: {
                ...router.query,
            }
        }, router.asPath, {
            locale: key,
        });
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    // 监听页面宽度变化
    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== 'undefined' && window.innerWidth > 768) {
                setIsMobileMenuOpen(false);
            }
        };
        if (typeof window !== 'undefined') {
            handleResize();
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [router])

    const handleLogout = async () => {
        await AuthAPI.logout()
        store.dispatch(clearToken());
        router.push("/")
    };

    const handleDropdownClick = (e: any, item: any) => {
        if (isMobileMenuOpen) {
            e.preventDefault();
            dropdownOpenName === item.name ? setDropdownOpenName("") : setDropdownOpenName(item.name)
        }
    };

    const triggerYouMeng = () => {
        (window as any)._czc && (window as any)._czc.push(["_trackEvent", "顶部导航", '点击', '登录按钮']);
    }

    return (
        <header className={styles.header} id='site-header'>
            <div className={styles.container}>
                <Link href="/" onClick={() => { router.push('/') }}  >
                    <Image width={900} height={227} className={styles.logo} src="/images/logo.png" alt="GOBI" />
                </Link>
                <div className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
                    <Image width={30} height={30} className={styles.mobileMenuIcon} src={isMobileMenuOpen ? "/images/icons/close.svg" : "/images/icons/menu.svg"} alt="menu" />
                </div>
                <div className={`${styles.navContainer} ${isMobileMenuOpen ? styles.mobileNavContainerOpen : ''}`}>
                    <nav className={styles.nav}>
                        {routerList.map((item) => (
                            <div key={item.name} className={styles.navItem} >
                                {!item.children ? (
                                    <Link href={item.path} className={router.pathname === item.path ? styles.active : ''}>{t(`header.${item.name}` as any)}</Link>
                                ) : (
                                    <div className={`${styles.dropdown} ${item.name === router.pathname.split('/')[1] ? styles.active : ''}`}>
                                        <Link href={item.children[0].path} className={styles.dropdownTrigger} onClick={(e) => handleDropdownClick(e, item)}>
                                            {t(`header.${item.name}` as any)}
                                            <div className={styles.dropdownTriggerArrow} />
                                        </Link>
                                        <div className={`${styles.dropdownContent} ${dropdownOpenName === item.name ? styles.dropdownContentOpen : ''}`}>
                                            {item.children?.map((child) => (
                                                child?.link ?
                                                    <Link className={router.asPath === child.path ? styles.dropdownItemActive : styles.dropdownItem} key={child.path} target="_blank" href={child.link}>
                                                        {t(`header.${child.name}` as any)}
                                                    </Link> :
                                                    <Link className={router.asPath === child.path ? styles.dropdownItemActive : styles.dropdownItem} key={child.path} href={child.path}>
                                                        {t(`header.${child.name}` as any)}
                                                    </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>
                    <div className={styles.divider} />
                    <div className={styles.languageProfile}>
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownTrigger} onClick={() => dropdownOpenName === "language" ? setDropdownOpenName("") : setDropdownOpenName("language")}>
                                <Image width={20} height={20} className={styles.languageIcon} src={isMobileMenuOpen ? "/images/icons/translate-black.svg" : "/images/icons/translate.svg"} alt="translate" />
                            </div>
                            <div className={`${styles.dropdownContent} ${dropdownOpenName === "language" ? styles.dropdownContentOpen : ''}`}>
                                <div className={router.locale === 'en' ? styles.dropdownItemActive : styles.dropdownItem} onClick={() => handleLanguageChange('en')}>{t('common.english')}</div>
                                <div className={router.locale === 'zh' ? styles.dropdownItemActive : styles.dropdownItem} onClick={() => handleLanguageChange('zh')}>{t('common.chinese')}</div>
                            </div>
                        </div>
                        {token ?
                            <div className={styles.dropdown}>
                                <div className={styles.dropdownTrigger} onClick={() => dropdownOpenName === "profile" ? setDropdownOpenName("") : setDropdownOpenName("profile")}>
                                    <Image width={30} height={30} className={styles.profileIcon} src={isMobileMenuOpen ? "/images/icons/profile-black.svg" : "/images/icons/profile.svg"} alt="profile" />
                                </div>
                                <div className={`${styles.dropdownContent}  ${dropdownOpenName === "profile" ? styles.dropdownContentOpen : ''}`}>
                                    <div className={styles.dropdownItem} onClick={() => handleLogout()}>{t('header.logout')}</div>
                                    <div className={`${styles.dropdownItem} ${router.pathname == '/user' ? styles.dropdownItemActive : ''} `} onClick={() => router.push("/user")}>{t('header.personalCenter')}</div>
                                </div>
                            </div>
                            : <Link href={"/login"} onClick={() => triggerYouMeng()} className={styles.loginButton}>{t('header.login')}</Link>
                        }
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header