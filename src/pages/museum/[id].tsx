import getLocaleProps from '@/utils/getLocaleProps';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { GetStaticPaths } from 'next';
import { MuseumAPI } from '@/api';
import { formatDate } from '@/utils/tool';
import styles from './museumDetail.module.scss';
import PageHeader from '@/components/PageHeader';
import ImageViewer from '@/components/ImageViewer';

function formatSealingDate(value: string | undefined) {
  if (value == null || value === '') return '';
  const n = Number(value);
  if (!Number.isNaN(n) && n !== 0) {
    const ms = n < 1e12 ? n * 1000 : n;
    return formatDate(ms);
  }
  return formatDate(value);
}

function museumTitle(item: API.MuseumItem, locale?: string) {
  if (locale === 'zh') {
    return (item.titleZh && item.titleZh.trim()) || item.titleEn || '';
  }
  return (item.titleEn && item.titleEn.trim()) || item.titleZh || '';
}

function museumContent(item: API.MuseumItem, locale?: string) {
  if (locale === 'zh') {
    return (item.contentZh && item.contentZh.trim()) || item.contentEn || '';
  }
  return (item.contentEn && item.contentEn.trim()) || item.contentZh || '';
}

function localizeField(en: string, zh: string, locale?: string) {
  if (locale === 'zh') return (zh && zh.trim()) || en;
  return (en && en.trim()) || zh;
}

const MuseumDetailPage = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { id } = router.query;
  const locale = router.locale;
  const [item, setItem] = useState<API.MuseumItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    locked: boolean | null;
    isMouse: boolean;
    lastDelta: number;
  } | null>(null);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setActiveIndex(0);
    MuseumAPI.getMuseumItemDetail({ id: Number(id) })
      .then((res: any) => {
        if (cancelled) return;
        const body = res?.data;
        const data = body?.data ?? body;
        const museumItem = data?.museumItem as API.MuseumItem | undefined;
        if (museumItem && museumItem.id != null) {
          setItem(museumItem);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const covers = useMemo(
    () => (item?.coverUrlList && item.coverUrlList.length > 0 ? item.coverUrlList : []),
    [item],
  );
  const activeImage = covers[activeIndex];

  const contributorRole =
    item?.contributorType === 2
      ? t('museum.gallery.contributorTeacher')
      : t('museum.gallery.contributorStudent');

  const goPrev = useCallback(() => {
    setActiveIndex((idx) => Math.max(0, idx - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((idx) => Math.min(covers.length - 1, idx + 1));
  }, [covers.length]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (covers.length <= 1) return;
      const isMouse = e.pointerType === 'mouse';
      if (isMouse && e.button !== 0) return;
      const target = e.currentTarget;
      try {
        target.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      dragStateRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        locked: isMouse ? true : null,
        isMouse,
        lastDelta: 0,
      };
    },
    [covers.length],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!state || state.pointerId !== e.pointerId) return;
    const dx = e.clientX - state.startX;
    const dy = e.clientY - state.startY;
    if (state.locked === null) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      state.locked = Math.abs(dx) > Math.abs(dy);
      if (!state.locked) return;
    }
    if (!state.locked) return;
    state.lastDelta = dx;
    setDragOffset(dx);
  }, []);

  const openViewer = useCallback((idx: number) => {
    setViewerIndex(idx);
    setViewerOpen(true);
  }, []);

  const handlePointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const state = dragStateRef.current;
      if (!state || state.pointerId !== e.pointerId) return;
      dragStateRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      const totalDx = e.clientX - state.startX;
      const totalDy = e.clientY - state.startY;
      const delta = state.lastDelta;
      setDragOffset(0);

      const isTap = Math.abs(totalDx) < 6 && Math.abs(totalDy) < 6;
      if (isTap) {
        openViewer(activeIndex);
        return;
      }
      if (!state.locked) return;
      const width = galleryRef.current?.clientWidth || 1;
      const threshold = Math.min(80, width * 0.15);
      if (delta <= -threshold) {
        goNext();
      } else if (delta >= threshold) {
        goPrev();
      }
    },
    [goNext, goPrev, openViewer, activeIndex],
  );

  const trackStyle = useMemo<React.CSSProperties>(() => {
    const isDragging = dragOffset !== 0;
    return {
      transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
      transition: isDragging ? 'none' : 'transform 0.3s ease',
    };
  }, [activeIndex, dragOffset]);

  return (
    <div className={styles.detail}>
      <PageHeader title={""} backgroundImage={activeImage || "/images/title_bg/museum.jpg"} />
      <div className={styles.container}>
        {loading && (
          <div className={styles.stateBox}>
            <div className={styles.loading}>
              <Image
                src="/images/icons/loading.svg"
                alt="loading"
                width={120}
                height={200}
                className={styles.loadingIcon}
              />
              <div className={styles.text}>{t('common.loadingText')}</div>
            </div>
          </div>
        )}

        {!loading && notFound && (
          <div className={styles.stateBox}>
            <div className={styles.nodata}>
              <Image
                src="/images/icons/nodata.svg"
                alt="nodata"
                width={365}
                height={300}
                className={styles.nodataIcon}
              />
              <div className={styles.text}>{t('common.nodataText')}</div>
            </div>
          </div>
        )}

        {!loading && item && (
          <article className={styles.card}>
            <div
              className={styles.gallery}
              ref={galleryRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              {covers.length > 0 && (
                <div className={styles.track} style={trackStyle}>
                  {covers.map((url, idx) => (
                    <div className={styles.slide} key={`${url}-${idx}`}>
                      <img
                        className={styles.galleryImg}
                        src={url}
                        alt={museumTitle(item, locale)}
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>
              )}
              {covers.length > 1 && (
                <>
                  <div
                    className={styles.pagerBar}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <div className={styles.counter}>
                      <span className={styles.counterCurrent}>{activeIndex + 1}</span>
                      <span className={styles.counterTotal}>/{covers.length}</span>
                    </div>
                    <div className={styles.arrowGroup}>
                      <button
                        type="button"
                        className={styles.arrowBtn}
                        onClick={goPrev}
                        disabled={activeIndex === 0}
                        aria-label="Previous image"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M15.0001 19.92L8.48006 13.4C7.71006 12.63 7.71006 11.37 8.48006 10.6L15.0001 4.07996"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={styles.arrowBtn}
                        onClick={goNext}
                        disabled={activeIndex === covers.length - 1}
                        aria-label="Next image"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M8.91003 19.92L15.43 13.4C16.2 12.63 16.2 11.37 15.43 10.6L8.91003 4.07996"
                            stroke="#fff"
                            strokeWidth="1.5"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${((activeIndex + 1) / covers.length) * 100}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            <div className={styles.titleBlock}>
              <div className={styles.exhibitionLabel}>{t('museum.detail.exhibition')}</div>
              <h1 className={styles.title}>{museumTitle(item, locale)}</h1>
            </div>

            <div className={styles.info}>
              <div className={styles.story}>
                <h2 className={styles.storyTitle}>{t('museum.detail.objectStory')}</h2>
                <p className={styles.storyBody}>{museumContent(item, locale)}</p>
              </div>

              <div className={styles.meta}>
                {item.accessionNumber ? (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>{t('museum.detail.accession')}</span>
                    <span className={styles.metaValue}>{item.accessionNumber}</span>
                  </div>
                ) : null}
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('museum.detail.contributor')}</span>
                  <span className={styles.metaValue}>
                    {localizeField(item.contributorEn, item.contributorZh, locale)}
                    / {contributorRole}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('museum.detail.affiliatedSchool')}</span>
                  <span className={styles.metaValue}>
                    {localizeField(item.affiliatedSchoolEn, item.affiliatedSchoolZh, locale)}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('museum.detail.sealingDate')}</span>
                  <span className={styles.metaValue}>{formatSealingDate(item.sealingDate)}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('museum.detail.origin')}</span>
                  <span className={styles.metaValue}>
                    {localizeField(item.originEn, item.originZh, locale)}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>{t('museum.detail.creator')}</span>
                  <span className={styles.metaValue}>
                    {localizeField(item.creatorEn, item.creatorZh, locale)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.lnt}>
              <div className={styles.lntBg} aria-hidden="true">
                <img
                  className={styles.lntBgImg}
                  src="/images/museum/leave-no-trace2.jpg"
                  alt=""
                />
                <div className={styles.lntBgGradient} />
              </div>
              <div className={styles.lntInner}>
                <div className={styles.lntText}>
                  <h3 className={styles.lntTitle}>{t('museum.detail.lntCommitment')}</h3>
                  <p className={styles.lntBody}>{t('museum.detail.lntDescription')}</p>
                </div>
                <div className={styles.lntLogoWrap}>
                  <img
                    className={styles.lntLogo}
                    src="/images/museum/lnt2.svg"
                    alt="Leave No Trace"
                  />
                </div>
              </div>
            </div>
          </article>
        )}
      </div>

      <ImageViewer
        open={viewerOpen}
        images={covers}
        initialIndex={viewerIndex}
        alt={item ? museumTitle(item, locale) : ''}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default MuseumDetailPage;

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps = getLocaleProps(['common']);
