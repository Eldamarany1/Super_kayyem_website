// =============================================================
//  FlipbookReader.jsx — Interactive Flipbook Story Reader
//  Route: /reader/:id
//  Supports: PDF, image array, single image, and sample mode.
//  Sample mode: blocks page turns beyond 25% of total pages.
// =============================================================
import { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import apiClient from '../api/client';

// ── Helpers ────────────────────────────────────────────────────────────────
function isPdf(url) {
  return url?.toLowerCase().endsWith('.pdf');
}

function isJsonArray(str) {
  try { const v = JSON.parse(str); return Array.isArray(v); }
  catch { return false; }
}

// ── Single book page (forwarded ref required by react-pageflip) ────────────
const Page = forwardRef(({ children, pageNumber, total }, ref) => (
  <div ref={ref} className="fbr-page">
    <div className="fbr-page__inner">{children}</div>
    <div className="fbr-page__number">{pageNumber} / {total}</div>
  </div>
));
Page.displayName = 'FlipbookPage';

// ── PDF frame page ─────────────────────────────────────────────────────────
const PdfPage = forwardRef(({ src, pageNumber, total }, ref) => (
  <div ref={ref} className="fbr-page fbr-page--pdf">
    <iframe
      className="fbr-pdf-frame"
      src={`${src}#page=${pageNumber}`}
      title={`Page ${pageNumber}`}
      loading="lazy"
    />
    <div className="fbr-page__number">{pageNumber} / {total}</div>
  </div>
));
PdfPage.displayName = 'PdfPage';

// ── Loading skeleton ───────────────────────────────────────────────────────
function ReaderSkeleton() {
  return (
    <div className="fbr-skeleton">
      <div className="fbr-skeleton__book" />
      <div className="fbr-skeleton__controls" />
    </div>
  );
}

// ── Content Locked Overlay ─────────────────────────────────────────────────
function LockedOverlay({ storyId, onReturn }) {
  const navigate = useNavigate();

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.82)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
      zIndex: 50,
      borderRadius: 16,
      padding: '30px 24px',
      textAlign: 'center',
      animation: 'fbrLockIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <style>{`
        @keyframes fbrLockIn {
          from { opacity:0; transform: scale(0.9); }
          to   { opacity:1; transform: scale(1);   }
        }
        @keyframes fbrLockPulse {
          0%, 100% { transform: scale(1);    filter: drop-shadow(0 0 12px #fbbf24aa); }
          50%       { transform: scale(1.08); filter: drop-shadow(0 0 22px #fbbf24cc); }
        }
      `}</style>

      {/* Padlock icon */}
      <div style={{
        fontSize: '4rem',
        marginBottom: 18,
        animation: 'fbrLockPulse 2.5s ease-in-out infinite',
        lineHeight: 1,
      }}>
        🔒
      </div>

      <h2 style={{
        color: '#fff',
        fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
        fontWeight: 900,
        margin: '0 0 14px',
        lineHeight: 1.4,
        fontFamily: "'Cairo', sans-serif",
      }}>
        محتوى مقفول
      </h2>

      <p style={{
        color: 'rgba(255,255,255,0.8)',
        fontSize: 'clamp(0.85rem, 2vw, 1rem)',
        maxWidth: 320,
        lineHeight: 1.7,
        margin: '0 0 28px',
        fontFamily: "'Cairo', sans-serif",
      }}>
        لقد وصلت لنهاية العينة المجانية.
        لشراء القصة وإكمال القراءة...
      </p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          id="locked-buy-story-btn"
          onClick={() => navigate(`/library`)}
          style={{
            padding: '13px 28px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: '#fff',
            border: 'none',
            borderRadius: 50,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 6px 25px rgba(37,99,235,0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(37,99,235,0.55)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(37,99,235,0.45)'; }}
        >
          <span>💳</span>
          شراء القصة
        </button>

        <button
          id="locked-return-library-btn"
          onClick={onReturn}
          style={{
            padding: '13px 28px',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: 50,
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
        >
          <span>📚</span>
          العودة للمكتبة
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function FlipbookReader() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const flipRef   = useRef(null);

  // sample mode via query param
  const [searchParams] = useSearchParams();
  const isSample = searchParams.get('sample') === 'true';

  const [story,       setStory]       = useState(null);
  const [pages,       setPages]       = useState([]);    // URL strings
  const [pdfUrl,      setPdfUrl]      = useState(null);  // set if content is a PDF
  const [pdfPages,    setPdfPages]    = useState(1);     // estimated page count for PDF
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping,  setIsFlipping]  = useState(false);
  const [locked,      setLocked]      = useState(false); // sample content locked

  // Dimension state (responsive)
  const [bookSize, setBookSize] = useState({ width: 480, height: 640 });

  // ── Responsive sizing ────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const vw = window.innerWidth;
      if (vw < 600)       setBookSize({ width: Math.min(vw - 32, 340), height: 480 });
      else if (vw < 1000) setBookSize({ width: 380, height: 540 });
      else                setBookSize({ width: 480, height: 640 });
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Fetch story data ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) { setError('معرّف القصة مفقود.'); setLoading(false); return; }

    apiClient.get(`/stories/${id}`)
      .then((res) => {
        if (!res.success) throw new Error(res.message ?? 'القصة غير موجودة.');
        const data = res.data;
        setStory(data);

        const contentUrl = data.contentUrl;

        if (!contentUrl) {
          setPages([data.coverImageUrl || '']);
          return;
        }

        if (isPdf(contentUrl)) {
          setPdfUrl(contentUrl);
          setPdfPages(data.pageCount ?? 1);
        } else if (isJsonArray(contentUrl)) {
          setPages(JSON.parse(contentUrl));
        } else {
          setPages([contentUrl]);
        }
      })
      .catch((err) => setError(err.message || 'تعذّر تحميل القصة.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Derived values ───────────────────────────────────────────────────────
  const totalPages = pdfUrl ? pdfPages : pages.length;

  // In sample mode: only the first 25% of pages are allowed
  const maxSamplePages = isSample ? Math.ceil(totalPages * 0.25) : totalPages;

  // ── Navigation handlers ──────────────────────────────────────────────────
  const flipNext = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    flipRef.current?.pageFlip()?.flipNext();
    setTimeout(() => setIsFlipping(false), 600);
  }, [isFlipping]);

  const flipPrev = useCallback(() => {
    if (isFlipping) return;
    setIsFlipping(true);
    flipRef.current?.pageFlip()?.flipPrev();
    setTimeout(() => setIsFlipping(false), 600);
  }, [isFlipping]);

  // ── onFlip handler with sample gating ───────────────────────────────────
  const handleFlip = useCallback((e) => {
    const newPage = e.data; // 0-indexed page index from react-pageflip
    setCurrentPage(newPage);

    if (isSample && newPage >= maxSamplePages) {
      // Turn the book back immediately
      setTimeout(() => {
        flipRef.current?.pageFlip()?.flip(maxSamplePages - 1);
      }, 100);
      setLocked(true);
    }
  }, [isSample, maxSamplePages]);

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (locked) return; // block keyboard when locked
      if (e.key === 'ArrowRight') flipPrev();
      if (e.key === 'ArrowLeft')  flipNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipNext, flipPrev, locked]);

  // ── Render states ─────────────────────────────────────────────────────────
  if (loading) return <div className="fbr-wrapper"><ReaderSkeleton /></div>;

  if (error) return (
    <div className="fbr-wrapper fbr-error" dir="rtl">
      <div className="fbr-error__card">
        <span className="fbr-error__icon">📖</span>
        <h2>تعذّر تحميل القصة</h2>
        <p>{error}</p>
        <button className="fbr-btn" onClick={() => navigate(-1)}>العودة</button>
      </div>
    </div>
  );

  return (
    <div className="fbr-wrapper" dir="rtl">

      {/* ── Story header ─────────────────────────────────────── */}
      <div className="fbr-header">
        <button className="fbr-back-btn" onClick={() => navigate(-1)} aria-label="العودة">
          ←
        </button>
        <h1 className="fbr-story-title">{story?.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="fbr-page-indicator">{currentPage + 1} / {totalPages}</span>
          {isSample && (
            <span style={{
              background: '#fbbf24',
              color: '#92400e',
              padding: '3px 12px',
              borderRadius: 20,
              fontSize: '0.78rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}>
              🆓 عينة مجانية — {maxSamplePages}/{totalPages} صفحة
            </span>
          )}
        </div>
      </div>

      {/* ── Sample progress bar ──────────────────────────────── */}
      {isSample && (
        <div style={{ padding: '0 20px 10px', maxWidth: 600, margin: '0 auto' }}>
          <div style={{
            height: 6,
            background: 'var(--border-color)',
            borderRadius: 10,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              borderRadius: 10,
              width: `${Math.min(((currentPage + 1) / maxSamplePages) * 100, 100)}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <p style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            margin: '5px 0 0',
            fontFamily: "'Cairo', sans-serif",
          }}>
            أنت في العينة المجانية — الصفحة {currentPage + 1} من {maxSamplePages} المتاحة
          </p>
        </div>
      )}

      {/* ── Book stage ──────────────────────────────────────────────────── */}
      <div className="fbr-stage" aria-label="قارئ الكتاب" style={{ position: 'relative' }}>

        {pdfUrl ? (
          // ── PDF mode ─────────────────────────────────────────────────────
          <HTMLFlipBook
            ref={flipRef}
            width={bookSize.width}
            height={bookSize.height}
            size="fixed"
            minWidth={280}
            maxWidth={600}
            minHeight={380}
            maxHeight={800}
            showCover
            mobileScrollSupport
            onFlip={handleFlip}
            className="fbr-book"
            flippingTime={600}
          >
            {Array.from({ length: pdfPages }, (_, i) => (
              <PdfPage key={i} src={pdfUrl} pageNumber={i + 1} total={pdfPages} />
            ))}
          </HTMLFlipBook>
        ) : (
          // ── Image / single URL mode ───────────────────────────────────────
          <HTMLFlipBook
            ref={flipRef}
            width={bookSize.width}
            height={bookSize.height}
            size="fixed"
            minWidth={280}
            maxWidth={600}
            minHeight={380}
            maxHeight={800}
            showCover
            mobileScrollSupport
            onFlip={handleFlip}
            className="fbr-book"
            flippingTime={600}
          >
            {pages.map((src, i) => (
              <Page key={i} pageNumber={i + 1} total={pages.length}>
                <img
                  src={src}
                  alt={`Page ${i + 1}`}
                  className="fbr-page__image"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </Page>
            ))}
          </HTMLFlipBook>
        )}

        {/* ── Locked overlay (sample limit reached) ── */}
        {locked && (
          <LockedOverlay
            storyId={id}
            onReturn={() => navigate('/library')}
          />
        )}
      </div>

      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="fbr-controls" role="group" aria-label="تحكم في الصفحات">
        <button
          id="fbr-prev"
          className="fbr-btn fbr-btn--nav"
          onClick={flipPrev}
          disabled={isFlipping || currentPage === 0 || locked}
          aria-label="الصفحة السابقة"
        >
          ← السابق
        </button>

        <span className="fbr-controls__hint">
          {locked
            ? '🔒 اشترِ القصة لمتابعة القراءة'
            : 'اضغط على الكتاب أو استخدم الأسهم للتنقل'}
        </span>

        <button
          id="fbr-next"
          className="fbr-btn fbr-btn--nav"
          onClick={flipNext}
          disabled={isFlipping || currentPage >= totalPages - 1 || locked}
          aria-label="الصفحة التالية"
        >
          التالي →
        </button>
      </div>

    </div>
  );
}
