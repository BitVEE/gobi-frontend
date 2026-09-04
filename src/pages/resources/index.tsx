import { useTranslation } from 'next-i18next';
import getLocaleProps from '@/utils/getLocaleProps';
import ResourceLayout from '@/components/OfficialResources/ResourceLayout';
import ApplicationForm from '@/components/OfficialResources/ApplicationForm';
import styles from '@/components/OfficialResources/resources.module.scss';

export default function ResourceApplicationPage() {
  const { t } = useTranslation('common', { keyPrefix: 'resources' });
  const steps = ['identity', 'details', 'access'] as const;
  return (
    <ResourceLayout>
      <div className={styles.applicationLayout}>
        <aside className={styles.guidance}>
          <h2>{t('guidanceTitle')}</h2>
          <p className={styles.guidanceIntro}>{t('guidanceIntro')}</p>
          <hr />
          <h3>{t('process')}</h3>
          <ol className={styles.steps}>
            {steps.map((step, index) => (
              <li key={step}>
                <span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span>
                <div><h4>{t(`steps.${step}.title`)}</h4><p>{t(`steps.${step}.body`)}</p></div>
              </li>
            ))}
          </ol>
        </aside>
        <ApplicationForm />
      </div>
    </ResourceLayout>
  );
}

export const getStaticProps = getLocaleProps(['common']);
