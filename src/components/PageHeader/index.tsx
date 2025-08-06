import React from 'react';
import styles from './index.module.scss';

interface PageHeaderProps {
  backgroundImage: string;
  title: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ backgroundImage, title }) => {
  return (
    <header className={styles.header} style={{ backgroundImage: `url(${backgroundImage})` }}>
      <h1>{title}</h1>
    </header>
  );
};

export default PageHeader;