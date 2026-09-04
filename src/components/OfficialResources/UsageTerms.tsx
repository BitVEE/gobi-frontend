import { useTranslation } from 'next-i18next';
import styles from './resources.module.scss';

export default function UsageTerms() {
  const { t } = useTranslation('common', { keyPrefix: 'resources' });
  return (
    <button
      type="button"
      className={styles.termsLink}
    >
      {t('terms')}
    </button>
  );
}
