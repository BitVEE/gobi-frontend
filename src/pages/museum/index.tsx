import getLocaleProps from '@/utils/getLocaleProps';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { MuseumAPI } from '@/api';
import PaginationIndicator from '@/components/PaginationIndicator';
import styles from './museum.module.scss';
import PageHeader from '@/components/PageHeader';
import Image from 'next/image';

const PAGE_SIZE = 6;

function museumTitle(item: API.MuseumItem, locale?: string) {
  if (locale === 'zh') {
    return (item.titleZh && item.titleZh.trim()) || item.titleEn || '';
  }
  return (item.titleEn && item.titleEn.trim()) || item.titleZh || '';
}

function museumExcerpt(item: API.MuseumItem, locale?: string) {
  const raw =
    locale === 'zh'
      ? (item.contentZh && item.contentZh.trim()) || item.contentEn
      : (item.contentEn && item.contentEn.trim()) || item.contentZh;
  const text = (raw || '').replace(/\s+/g, ' ').trim();
  return text;
}

const MuseumPage = () => {
  const { t } = useTranslation('common');
  const { locale } = useRouter();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<API.MuseumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const lntList = useMemo(() => {
    const raw = t('museum.lnt.principles.list', { returnObjects: true }) as unknown;
    return Array.isArray(raw) ? (raw as string[]) : [];
  }, [t, locale]);
  const lntHeadlines = useMemo(() => {
    const raw = t('museum.lnt.heading');
    return (typeof raw === 'string' ? raw : '').split('\n').map((s) => s.trim()).filter(Boolean);
  }, [t, locale]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    MuseumAPI.getMuseumItemList({ page, size: PAGE_SIZE })
      .then((res: any) => {
        if (cancelled) return;
        const body = res?.data;
        const data = body?.data ?? body;
        setTotal(Number(data?.total ?? 0));
        setItems(Array.isArray(data?.museumItems) ? data.museumItems : []);
      })
      .catch(() => {
        if (!cancelled) {
          setTotal(0);
          setItems([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page]);


  return (
    <div className={styles.museum}>
      <PageHeader title={t('museum.title')} backgroundImage="/images/title_bg/museum.jpg" />
      <div className={styles.sections}>
        <section>
          <div className={styles.tagWrap}>
            <div className={styles.tagContent}>
              {t('museum.overview.title')}
            </div>
            <div className={styles.tagLine} />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.imageWrap}>
              <img className={styles.sectionImg} src="/images/museum/overview.jpg" alt="" />
            </div>
            <div className={styles.textCol}>
              <h2 className={styles.blockTitle}>{t('museum.overview.heading')}</h2>
              <p className={styles.bodyText}>{t('museum.overview.body')}</p>
              <h3 className={styles.subheading}>{t('museum.overview.jointOrg')}</h3>
              <div className={styles.jointOrgRow}>
                <img
                  className={styles.jointOrgImg}
                  src="/images/museum/org1.svg"
                  alt=""
                />
                <img
                  className={styles.jointOrgImg}
                  src="/images/museum/org2.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className={styles.tagWrap}>
            <div className={styles.tagContent}>
              {t('museum.feature.title')}
            </div>
            <div className={styles.tagLine} />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.textCol}>
              <h2 className={styles.blockTitle}>{t('museum.feature.heading')}</h2>
              <p className={styles.bodyText}>{t('museum.feature.body')}</p>
            </div>
            <div className={styles.imageWrap}>
              <img className={styles.sectionImg} src="/images/museum/philosophy.jpg" alt="" />
            </div>
          </div>
        </section>
        <section>
          <div className={styles.tagWrap}>
            <div className={styles.tagContent}>
              {t('museum.objectives.title')}
            </div>
            <div className={styles.tagLine} />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.imageWrap}>
              <img className={styles.sectionImg} src="/images/museum/vision.jpg" alt="" />
            </div>
            <div className={styles.textCol}>
              <h2 className={styles.blockTitle}>{t('museum.objectives.heading')}</h2>
              <p className={styles.bodyText}>{t('museum.objectives.body')}</p>
            </div>
          </div>
        </section>
        <section>
          <div className={styles.tagWrap}>
            <div className={`${styles.tagContent} ${styles.galleryTagContent}`}>
              {t('museum.gallery.title')}
            </div>
            <div className={styles.tagLine} />
          </div>
        </section>
        <section className={styles.gallerySection}>
          <div className={styles.galleryGrid}>
            {loading && (
              <div className={styles.loading}>
                <Image
                  src='/images/icons/loading.svg'
                  alt="loading"
                  width={120}
                  height={200}
                  className={styles.loadingIcon}
                />
                <div className={styles.text}>{t('common.loadingText')}</div>
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className={styles.nodata}>
                <Image
                  src='/images/icons/nodata.svg'
                  alt="nodata"
                  width={365}
                  height={300}
                  className={styles.nodataIcon}
                />
                <div className={styles.text}>{t('common.nodataText')}</div>
              </div>
            )}
            {!loading && items.length > 0 && (
              items.map((item, index) => {
                return (
                  <Link
                    key={item.id}
                    href={`/museum/${item.id}`}
                    locale={locale}
                    className={styles.card}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img className={styles.cardCover} src={item.coverUrlList?.[0] || ''} alt="" />
                    <div className={styles.cardBody}>
                      <span className={styles.cardMetaLabel}>
                        {t('museum.gallery.exhibition')}
                      </span>
                      <div className={styles.cardTitle}>{museumTitle(item, locale)}</div>
                      <p className={styles.cardExcerpt}>{museumExcerpt(item, locale)}</p>
                      <span className={styles.readMore}>{t('museum.gallery.readMore')}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
          <div className={styles.paginationWrap}>
            <PaginationIndicator
              total={total}
              current={page}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </section>
      </div>
      <section className={styles.lnt} aria-label={t('museum.lnt.title')}>
        <div className={styles.lntBg} aria-hidden="true">
          <img
            className={styles.lntBgImg}
            src="/images/museum/leave-no-trace1.jpg"
            alt=""
          />
          <div className={styles.lntBgGradient} />
        </div>
        <div className={styles.lntInner}>
          <div className={styles.lntKickerRow}>
            <div className={styles.lntKickerBlock}>
              <p className={styles.lntKicker}>{t('museum.lnt.title')}</p>
              <div className={styles.lntKickerLine} />
            </div>
          </div>
          <div className={styles.lntMainRow}>
            <div className={styles.lntTextCol}>
              <h2 className={styles.lntHeadline}>
                {lntHeadlines.map((line, i) => (
                  <span key={i} className={styles.lntHeadlineLine}>
                    {line}
                  </span>
                ))}
              </h2>
              <p className={styles.lntBody}>{t('museum.lnt.body')}</p>
              {lntList.length > 0 && (
                <div className={styles.lntPrinciples}>
                  <h3 className={styles.lntPrinciplesTitle}>
                    {t('museum.lnt.principles.title')}
                  </h3>
                  <ul className={styles.lntList}>
                    {lntList.map((line, idx) => (
                      <li key={idx} className={styles.lntListItem}>
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className={styles.lntLearnRow}>
                <span className={styles.lntLearnText}>{t('museum.lnt.learnMore')}</span>
                <a
                  className={styles.lntLink}
                  href="https://lnt.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  lnt.org
                </a>
              </div>
            </div>
            <div className={styles.lntLogoCol}>
              <img
                className={styles.lntLogo}
                src="/images/museum/lnt1.svg"
                alt="Leave No Trace"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MuseumPage;

export const getStaticProps = getLocaleProps(['common']);
