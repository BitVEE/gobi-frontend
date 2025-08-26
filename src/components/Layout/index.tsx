import React from 'react'
import Header from '../Header'
import Footer from '../footer'
import styles from './index.module.scss'
import Toast from '../Toast'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Forbidden from '@/pages/403'

interface LayoutProps {
    children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const token = useSelector((state: any) => state.commonSlice.token);
    const whiteList = ['/user']
    const router = useRouter()
    const { pathname } = router

    return (
        <div className={styles.layout}>
            <Header />
            {!whiteList.includes(pathname) || token ? (
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
