import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import PageHeader from '@/components/PageHeader';
import styles from './resources.module.scss';

export default function ResourceLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common', { keyPrefix: 'resources' });
  return (
    <div className={styles.page}>
      <Head>
        <meta name="description" content={t('pageDescription')} />
      </Head>
      <PageHeader
        className={styles.hero}
        title={t('title')}
        backgroundImage="/images/resources/hero.jpg"
      />
      <section className={styles.section} aria-label={t('title')}>
        {children}
      </section>
    </div>
  );
}
