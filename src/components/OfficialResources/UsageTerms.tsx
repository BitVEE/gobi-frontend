import { useTranslation } from 'next-i18next';
import styles from './resources.module.scss';

export default function UsageTerms() {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'resources' });
  return (
    <button
      type="button"
      className={styles.termsLink}
      onClick={() => window.open(`/protocol/青戈赛官方物料使用条款${i18n.language === 'zh' ? '' : '_EN'}.pdf`, '_blank')}
    >
      {t('terms')}
    </button>
  );
}
