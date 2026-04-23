import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.scss';

type Props = {
  open: boolean;
  images: string[];
  initialIndex?: number;
  alt?: string;
  onClose: () => void;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;
const SWIPE_THRESHOLD = 60;
const TAP_MOVE_TOLERANCE = 6;
const DOUBLE_TAP_INTERVAL = 300;
const DOUBLE_TAP_DIST = 30;

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const distance = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

const ImageViewer = ({ open, images, initialIndex = 0, alt = '', onClose }: Props) => {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [animate, setAnimate] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartRef = useRef<null | {
    dist: number;
    scale: number;
    tx: number;
    ty: number;
    cx: number;
    cy: number;
  }>(null);
  const dragStartRef = useRef<null | {
    pointerId: number;
    x: number;
    y: number;
    tx: number;
    ty: number;
    scale: number;
    moved: boolean;
  }>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resetTransform = useCallback((withAnimate = false) => {
    setAnimate(withAnimate);
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const goPrev = useCallback(() => {
    setIndex((i) => {
      const len = images.length;
      if (len <= 1) return i;
      return (i - 1 + len) % len;
    });
  }, [images.length]);
  const goNext = useCallback(() => {
    setIndex((i) => {
      const len = images.length;
      if (len <= 1) return i;
      return (i + 1) % len;
    });
  }, [images.length]);

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      resetTransform(false);
    }
  }, [open, initialIndex, resetTransform]);

  useEffect(() => {
    resetTransform(false);
  }, [index, resetTransform]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, goPrev, goNext]);

  const clampTranslate = useCallback((nx: number, ny: number, s: number) => {
    const stage = stageRef.current;
    if (!stage || s <= 1) return { x: 0, y: 0 };
    const maxX = (stage.clientWidth * (s - 1)) / 2;
    const maxY = (stage.clientHeight * (s - 1)) / 2;
    return {
      x: clamp(nx, -maxX, maxX),
      y: clamp(ny, -maxY, maxY),
    };
  }, []);

  const applyZoom = useCallback(
    (nextScale: number, originX?: number, originY?: number, withAnimate = false) => {
      const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      let nx = tx;
      let ny = ty;
      if (originX != null && originY != null && stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        const cx = originX - rect.left - rect.width / 2;
        const cy = originY - rect.top - rect.height / 2;
        nx = cx - ((cx - tx) / scale) * s;
        ny = cy - ((cy - ty) / scale) * s;
      }
      const clamped = clampTranslate(nx, ny, s);
      setAnimate(withAnimate);
      setScale(s);
      setTx(clamped.x);
      setTy(clamped.y);
    },
    [tx, ty, scale, clampTranslate],
  );

  // Native (non-passive) wheel listener so we can preventDefault page scroll.
  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    if (!stage) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      applyZoom(scale * factor, e.clientX, e.clientY, false);
    };
    stage.addEventListener('wheel', handler, { passive: false });
    return () => stage.removeEventListener('wheel', handler);
  }, [open, applyZoom, scale]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setAnimate(false);
    if (pointersRef.current.size === 2) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      pinchStartRef.current = {
        dist: distance(p1, p2),
        scale,
        tx,
        ty,
        cx: (p1.x + p2.x) / 2,
        cy: (p1.y + p2.y) / 2,
      };
      dragStartRef.current = null;
    } else if (pointersRef.current.size === 1) {
      dragStartRef.current = {
        pointerId: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        tx,
        ty,
        scale,
        moved: false,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2 && pinchStartRef.current && stageRef.current) {
      const [p1, p2] = Array.from(pointersRef.current.values());
      const dist = distance(p1, p2);
      const start = pinchStartRef.current;
      const next = clamp((dist / start.dist) * start.scale, MIN_SCALE, MAX_SCALE);
      const rect = stageRef.current.getBoundingClientRect();
      const cx = start.cx - rect.left - rect.width / 2;
      const cy = start.cy - rect.top - rect.height / 2;
      const nx = cx - ((cx - start.tx) / start.scale) * next;
      const ny = cy - ((cy - start.ty) / start.scale) * next;
      const clamped = clampTranslate(nx, ny, next);
      setScale(next);
      setTx(clamped.x);
      setTy(clamped.y);
      return;
    }

    if (pointersRef.current.size === 1 && dragStartRef.current) {
      const start = dragStartRef.current;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > TAP_MOVE_TOLERANCE || Math.abs(dy) > TAP_MOVE_TOLERANCE) {
        start.moved = true;
      }
      if (start.scale > 1) {
        const clamped = clampTranslate(start.tx + dx, start.ty + dy, start.scale);
        setTx(clamped.x);
        setTy(clamped.y);
      }
    }
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasSingle = pointersRef.current.size === 1;
    pointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (pointersRef.current.size < 2) pinchStartRef.current = null;

    if (wasSingle && dragStartRef.current) {
      const start = dragStartRef.current;
      dragStartRef.current = null;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      if (start.scale === 1 && start.moved && Math.abs(dx) > Math.abs(dy)) {
        if (dx <= -SWIPE_THRESHOLD) {
          goNext();
          return;
        }
        if (dx >= SWIPE_THRESHOLD) {
          goPrev();
          return;
        }
      }

      if (!start.moved) {
        const now = Date.now();
        const x = e.clientX;
        const y = e.clientY;
        const last = lastTapRef.current;
        if (
          last &&
          now - last.time < DOUBLE_TAP_INTERVAL &&
          Math.hypot(x - last.x, y - last.y) < DOUBLE_TAP_DIST
        ) {
          lastTapRef.current = null;
          if (scale > 1) applyZoom(1, undefined, undefined, true);
          else applyZoom(DOUBLE_TAP_SCALE, x, y, true);
        } else {
          lastTapRef.current = { time: now, x, y };
        }
      }
    }
  };

  if (!mounted || !open || images.length === 0) return null;

  const trackStyle: React.CSSProperties = {
    transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
    transition: animate ? 'transform 0.25s ease' : 'none',
    cursor: scale > 1 ? 'grab' : 'auto',
  };

  const node = (
    <div className={styles.viewer} role="dialog" aria-modal="true">
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.toolbar} onClick={(e) => e.stopPropagation()}>
        <div className={styles.counter}>
          <span className={styles.counterCurrent}>{index + 1}</span>
          <span className={styles.counterTotal}>/ {images.length}</span>
        </div>
        <div className={styles.tools}>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => applyZoom(scale / 1.4, undefined, undefined, true)}
            disabled={scale <= MIN_SCALE + 0.001}
            aria-label="Zoom out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="7" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <span className={styles.scaleLabel}>{Math.round(scale * 100)}%</span>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => applyZoom(scale * 1.4, undefined, undefined, true)}
            disabled={scale >= MAX_SCALE - 0.001}
            aria-label="Zoom in"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="7" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="11" y1="7" x2="11" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => resetTransform(true)}
            disabled={scale === 1 && tx === 0 && ty === 0}
            aria-label="Reset"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 12a8 8 0 1 1 2.34 5.66"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="4 19 4 14 9 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.toolBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={styles.stage}
        ref={stageRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <img
          className={styles.image}
          src={images[index]}
          alt={alt}
          draggable={false}
          style={trackStyle}
        />
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navPrev}`}
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M15 19.92L8.48 13.4c-.77-.77-.77-2.03 0-2.8L15 4.08"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navNext}`}
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M8.91 19.92l6.52-6.52c.77-.77.77-2.03 0-2.8L8.91 4.08"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );

  return createPortal(node, document.body);
};

export default ImageViewer;
