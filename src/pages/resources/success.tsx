import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import getLocaleProps from '@/utils/getLocaleProps';
import ResourceLayout from '@/components/OfficialResources/ResourceLayout';
import styles from '@/components/OfficialResources/resources.module.scss';

export default function ResourceApplicationSuccessPage() {
  const { t } = useTranslation('common', { keyPrefix: 'resources.success' });
  const router = useRouter();
  const applicationNo = typeof router.query.applicationNo === 'string'
    ? router.query.applicationNo.trim()
    : '';

  const details = [
    { label: t('applicationNo'), value: applicationNo || '—' },
    { label: t('reviewStatus'), value: t('pendingReview') },
    { label: t('estimatedReviewTime'), value: t('estimatedReviewValue') },
  ];

  return (
    <ResourceLayout>
      <div className={styles.successLayout}>
        <article className={styles.successCard} aria-labelledby="resource-success-title">
          <img
            className={styles.successIcon}
            src="/images/resources/success-check.svg"
            alt=""
            width={72}
            height={72}
          />
          <h2 id="resource-success-title">{t('title')}</h2>
          <p className={styles.successIntro}>{t('intro')}</p>
          <hr className={styles.successDivider} />

          <section className={styles.successSummary} aria-labelledby="resource-success-details">
            <h3 id="resource-success-details">{t('detailsTitle')}</h3>
            <dl className={styles.successDetails}>
              {details.map(detail => (
                <div className={styles.successDetailRow} key={detail.label}>
                  <dt>{detail.label}</dt>
                  <dd>{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.successNotice} aria-labelledby="resource-success-next">
            <h3 id="resource-success-next">{t('nextTitle')}</h3>
            <p>{t('nextBody')}</p>
          </section>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => router.push('/')}
          >
            {t('backHome')}
            <img src="/images/resources/arrow-right.svg" alt="" width={20} height={20} />
          </button>
        </article>
      </div>
    </ResourceLayout>
  );
}

export const getStaticProps = getLocaleProps(['common']);
