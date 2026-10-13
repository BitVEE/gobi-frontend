import React from 'react'
import Header from '../Header'
import Footer from '../footer'
import styles from './index.module.scss'
import Toast from '../Toast'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Forbidden from '@/pages/403'
import { AUTH_REQUIRED_PATHS } from '@/utils/shareMeta'

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const token = useSelector((state: any) => state.commonSlice.token);
    const router = useRouter()
    const { pathname } = router

    return (
        <div className={styles.layout}>
            <Header />
            {!AUTH_REQUIRED_PATHS.has(pathname) || token ? (
                <main className={styles.main}>{children}</main>
            ) : (
                <Forbidden />
            )}
            <Footer />
            <Toast />
        </div>
    )
}

export default Layout
