// =============================================================
//  FlipbookReader.jsx — Interactive Flipbook Story Reader
//  Route: /reader/:id
//  Uses react-pageflip (HTMLFlipBook) to render story pages.
//  Supports two content modes:
//    1. PDF  → rendered inside an iframe
//    2. Image list (JSON array in contentUrl) → rendered as pages
//    3. Single image/URL fallback → full-page reader
// =============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { forwardRef } from 'react';

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

// ── Main component ─────────────────────────────────────────────────────────
export default function FlipbookReader() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const flipRef   = useRef(null);

  const [story,      setStory]      = useState(null);
  const [pages,      setPages]      = useState([]);    // URL strings
  const [pdfUrl,     setPdfUrl]     = useState(null);  // set if content is a PDF
  const [pdfPages,   setPdfPages]   = useState(1);     // estimated page count for PDF
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping,  setIsFlipping]  = useState(false);

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
          // No content — show a single placeholder page
          setPages([data.coverImageUrl || '']);
          return;
        }

        if (isPdf(contentUrl)) {
          setPdfUrl(contentUrl);
          // We don't know exact page count without parsing; default to 1
          // A real implementation could add a pageCount field to StoryResponse
          setPdfPages(data.pageCount ?? 1);
        } else if (isJsonArray(contentUrl)) {
          setPages(JSON.parse(contentUrl));
        } else {
          // Single image or unknown — treat as one page
          setPages([contentUrl]);
        }
      })
      .catch((err) => setError(err.message || 'تعذّر تحميل القصة.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Navigation handlers ──────────────────────────────────────────────────
  const totalPages = pdfUrl ? pdfPages : pages.length;

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

  const handleFlip = (e) => setCurrentPage(e.data);

  // ── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') flipPrev();
      if (e.key === 'ArrowLeft')  flipNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipNext, flipPrev]);

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
        <span className="fbr-page-indicator">{currentPage + 1} / {totalPages}</span>
      </div>

      {/* ── Book stage ──────────────────────────────────────────────────── */}
      <div className="fbr-stage" aria-label="قارئ الكتاب">

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
      </div>

      {/* ── Controls ─────────────────────────────────────────── */}
      <div className="fbr-controls" role="group" aria-label="تحكم في الصفحات">
        <button
          id="fbr-prev"
          className="fbr-btn fbr-btn--nav"
          onClick={flipPrev}
          disabled={isFlipping || currentPage === 0}
          aria-label="الصفحة السابقة"
        >
          ← السابق
        </button>

        <span className="fbr-controls__hint">اضغط على الكتاب أو استخدم الأسهم للتنقل</span>

        <button
          id="fbr-next"
          className="fbr-btn fbr-btn--nav"
          onClick={flipNext}
          disabled={isFlipping || currentPage >= totalPages - 1}
          aria-label="الصفحة التالية"
        >
          التالي →
        </button>
      </div>

    </div>
  );
}
