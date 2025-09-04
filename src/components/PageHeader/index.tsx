import React, { useEffect, useState } from 'react';
import LoadingImg from '../LoadingImg';
import styles from './index.module.scss';

interface PageHeaderProps {
  backgroundImage: string;
  title: string;
}



const PageHeader: React.FC<PageHeaderProps> = ({ backgroundImage, title }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 监听页面宽度变化
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      } else {
        setIsMobileMenuOpen(true);
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
  return (
    <header className={styles.header}>
      <div className={styles.backgroundImageContainer}>
        <LoadingImg
          src={backgroundImage}
          width={1920}
          height={440}
          alt="Header background"
          style={isMobileMenuOpen ? {
            height: '12rem',
            objectFit: 'cover',
          } : {
            width: '10rem',
            objectFit: 'cover',
          }}
        />
        <div className={styles.overlay} />
      </div>
      <h1>{title}</h1>
    </header>
  );
};

export default PageHeader;