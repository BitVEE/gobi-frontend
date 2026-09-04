import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { MaterialAPI } from '@/api';
import getLocaleProps from '@/utils/getLocaleProps';
import {
  formatAccessDate,
  formatFileSize,
  getTimestampMilliseconds,
  mapMaterialResource,
} from '@/features/resources/model';
import ResourceLayout from '@/components/OfficialResources/ResourceLayout';
import UsageTerms from '@/components/OfficialResources/UsageTerms';
import styles from '@/components/OfficialResources/resources.module.scss';

type AccessState = 'loading' | 'active' | 'expired' | 'error';

export default function ResourceDownloadPage() {
  const { t } = useTranslation('common', { keyPrefix: 'resources' });
  const { query, locale, isReady } = useRouter();
  const [state, setState] = useState<AccessState>('loading');
  const [access, setAccess] = useState<API.MaterialAccessResult['data'] | null>(null);
  const token = typeof query.token === 'string' ? query.token.trim() : '';
  const resourceLocale = locale === 'en' ? 'en' : 'zh';

  useEffect(() => {
    if (!isReady) return;
    if (!token) {
      setAccess(null);
      setState('expired');
      return;
    }

    let active = true;
    setState('loading');
    MaterialAPI.getAccess(token)
      .then(response => {
        if (!active) return;
        const body = response.data;
        if (body.code !== 0 || !body.data || !Array.isArray(body.data.materials)) {
          setAccess(null);
          setState('expired');
          return;
        }
        if (getTimestampMilliseconds(body.data.expiresAt) <= Date.now()) {
          setAccess(body.data);
          setState('expired');
          return;
        }
        setAccess(body.data);
        setState('active');
      })
      .catch(() => {
        if (!active) return;
        setAccess(null);
        setState('error');
      });

    return () => { active = false; };
  }, [isReady, token]);

  if (!isReady || state === 'loading') {
    return <ResourceLayout><p className={styles.statusMessage} role="status">{t('download.loading')}</p></ResourceLayout>;
  }

  if (state === 'error') {
    return <ResourceLayout><p className={styles.statusMessage} role="alert">{t('download.loadFailed')}</p></ResourceLayout>;
  }

  if (!access) {
    return (
      <ResourceLayout>
        <div className={styles.downloadLayout}>
          <aside className={styles.accessCard} aria-label={t('download.linkStatus')}>
            <h2>{t('download.linkStatus')}</h2>
            <p className={styles.expiredLabel}>{t('download.expired')}</p>
          </aside>
          <div className={styles.downloadCards}>
            <article className={styles.downloadCard}>
              <h2>{t('download.expiredHeading')}</h2>
              <p className={styles.usageCopy}>{t('download.expiredBody')}</p>
            </article>
          </div>
        </div>
      </ResourceLayout>
    );
  }

  const isExpired = state === 'expired';
  const expiresAtMilliseconds = getTimestampMilliseconds(access.expiresAt);
  const resources = access.materials
    .map(mapMaterialResource)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <ResourceLayout>
      <div className={styles.downloadLayout}>
        <aside className={styles.accessCard} aria-label={t('download.reviewStatus')}>
          <h2>{t('download.reviewStatus')}</h2>
          <img className={styles.approvedIcon} src="/images/resources/approved.svg" alt="" width={44} height={44} />
          <p className={styles.approvedLabel}>{t('download.approved')}</p>
          <hr />
          <h3>{t(isExpired ? 'download.linkStatus' : 'download.validity')}</h3>
          <div className={isExpired ? styles.expiredValidity : styles.validity}>
            {isExpired && <span>{t('download.expired')}</span>}
            <time dateTime={new Date(expiresAtMilliseconds).toISOString()}>
              {formatAccessDate(access.expiresAt, resourceLocale)}
            </time>
          </div>
        </aside>

        <div className={styles.downloadCards}>
          {resources.length ? resources.map(resource => (
            <article className={styles.downloadCard} key={resource.id}>
              <h2>{resource.name[resourceLocale]}</h2>
              <p className={styles.packageDescription}>
                {resource.description[resourceLocale] || t('download.description')}
              </p>
              <p className={styles.packageMeta}>
                {t('download.fileMeta', {
                  fileName: resource.fileName,
                  size: formatFileSize(resource.fileSize, resourceLocale),
                })}
              </p>
              <button
                type="button"
                className={styles.primaryButton}
                disabled={isExpired}
                aria-label={`${t(isExpired ? 'download.expiredButton' : 'download.button')} · ${resource.name[resourceLocale]}`}
                onClick={isExpired ? undefined : () => window.location.assign(MaterialAPI.getDownloadUrl(token, resource.id))}
              >
                {t(isExpired ? 'download.expiredButton' : 'download.button')}
              </button>
              {isExpired ? (
                <>
                  <h3>{t('download.expiredHeading')}</h3>
                  <p className={styles.usageCopy}>{t('download.expiredBody')}</p>
                </>
              ) : (
                <>
                  <h3>{t('download.usageHeading')}</h3>
                  <p className={styles.usageCopy}>{t('download.usageBody')}<UsageTerms />{t('consentSuffix')}</p>
                </>
              )}
            </article>
          )) : (
            <article className={styles.downloadCard}>
              <p className={styles.usageCopy}>{t('download.noResources')}</p>
            </article>
          )}
        </div>
      </div>
    </ResourceLayout>
  );
}

export const getStaticProps = getLocaleProps(['common']);
