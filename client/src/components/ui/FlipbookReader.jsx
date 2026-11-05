import { useState, useEffect, useRef, useCallback } from 'react';
import '../../styles/FlipbookReader.css';

const PDFJS_CDN_WORKERS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
];

async function ensurePdfJsLoaded() {
  if (window.pdfjsLib) {
    if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN_WORKERS[0];
    }
    return window.pdfjsLib;
  }

  const scripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  ];

  for (let i = 0; i < scripts.length; i++) {
    try {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = scripts[i];
        s.crossOrigin = 'anonymous';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN_WORKERS[i] || PDFJS_CDN_WORKERS[0];
        return window.pdfjsLib;
      }
    } catch {
      // Try next CDN
    }
  }
  throw new Error('تعذر تحميل مكتبة قارئ الكتب PDF.js');
}

function playPageFlipSound(audioCtxRef, enabled) {
  if (!enabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const duration = 0.2;
    const sampleRate = ctx.sampleRate;
    const bufferSize = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const env = Math.sin(Math.PI * Math.pow(t, 0.72)) * (1 - 0.35 * t);
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2 + white * 0.12) * env * 0.26;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + duration * 0.5);
    filter.frequency.exponentialRampToValueAtTime(850, ctx.currentTime + duration);
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch {
    // Ignore audio errors if blocked by browser autoplay policy
  }
}

function wrapArabicCanvasText(ctx, text, rightX, y, maxWidth, lineHeight) {
  const words = (text || '').split(' ');
  let line = '';
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), rightX, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), rightX, y);
  return y;
}

function generateCanvasesFromStoryPages(story) {
  const width = 900;
  const height = 1240;
  const rawPages = Array.isArray(story?.pages) && story.pages.length > 0
    ? story.pages
    : [{ pageNum: 1, content: story?.description || 'محتوى القصة متاح قريباً!' }];

  return rawPages.map((p, idx) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Warm cream storybook page background
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, width, height);

    // Child-friendly decorative frame in Super Kayyem Blue & Gold
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 4;
    ctx.strokeRect(48, 48, width - 96, height - 96);

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(62, 62, width - 124, height - 124);

    ctx.direction = 'rtl';
    ctx.textAlign = 'right';

    // Story header badge
    ctx.fillStyle = '#2563eb';
    ctx.font = '700 24px Tahoma, "Noto Sans Arabic", sans-serif';
    ctx.fillText(story?.title || 'قصة سوبر قيم', width - 96, 120);

    if (story?.category || story?.valueLearned) {
      ctx.fillStyle = '#d97706';
      ctx.font = '700 20px Tahoma, "Noto Sans Arabic", sans-serif';
      ctx.fillText(`القيمة: ${story.category || story.valueLearned}`, width - 96, 158);
    }

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(96, 182);
    ctx.lineTo(width - 96, 182);
    ctx.stroke();

    // Story page content
    const contentText = p.content || p.Content || '';
    ctx.fillStyle = '#1e293b';
    ctx.font = '500 34px Tahoma, "Noto Sans Arabic", sans-serif';
    wrapArabicCanvasText(ctx, contentText, width - 100, 290, width - 200, 64);

    // Page number footer
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '700 24px Tahoma, "Noto Sans Arabic", sans-serif';
    ctx.fillText(`— صفحة ${p.pageNum || idx + 1} —`, width / 2, height - 84);

    return canvas;
  });
}

export function FlipbookReader({ story }) {
  const wrapperRef = useRef(null);
  const stageRef = useRef(null);
  const zoomLayerRef = useRef(null);
  const viewportRef = useRef(null);
  const audioCtxRef = useRef(null);

  const [pageCanvases, setPageCanvases] = useState([]);
  const [pageAspect, setPageAspect] = useState(900 / 1240);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(10);
  const [loadingText, setLoadingText] = useState('جاري تجهيز صفحات القصة...');

  const [singleMode, setSingleMode] = useState(() => window.innerWidth <= 768);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [turningIndex, setTurningIndex] = useState(null);
  const [bookSize, setBookSize] = useState({ width: 700, height: 480 });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Simple Child-Friendly Zoom & Pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDraggingPan, setIsDraggingPan] = useState(false);

  // Load PDF from story.pdfUrl (via /api/stories/{id}/pdf proxy or direct URL), fallback to story.pages
  useEffect(() => {
    let cancelled = false;

    async function loadStoryBook() {
      setLoading(true);
      setLoadingProgress(10);
      setCurrentIndex(0);
      setZoom(1);
      setPan({ x: 0, y: 0 });

      const hasPdf = Boolean(story?.pdfUrl && String(story.pdfUrl).trim().length > 0);

      if (hasPdf) {
        try {
          setLoadingText('جاري فتح كتاب القصة المصور...');
          const pdfjsLib = await ensurePdfJsLoaded();

          // Try streaming proxy first to avoid CORS/MIME issues, fallback to direct story.pdfUrl
          const candidateUrls = [
            story?.id ? `/api/stories/${story.id}/pdf` : null,
            story.pdfUrl,
          ].filter(Boolean);

          let pdfDoc = null;
          for (const url of candidateUrls) {
            try {
              const res = await fetch(url);
              if (!res.ok) continue;
              const buf = await res.arrayBuffer();
              pdfDoc = await pdfjsLib.getDocument({ data: buf }).promise;
              if (pdfDoc) break;
            } catch {
              // Try next candidate URL
            }
          }

          if (pdfDoc && pdfDoc.numPages > 0) {
            const total = pdfDoc.numPages;
            const rendered = [];

            for (let pageNum = 1; pageNum <= total; pageNum++) {
              if (cancelled) return;
              setLoadingProgress(Math.round((pageNum / total) * 100));
              setLoadingText(`جاري تحضير صفحة ${pageNum} من ${total}...`);

              const page = await pdfDoc.getPage(pageNum);
              const baseVp = page.getViewport({ scale: 1.0 });
              const scale = Math.min(2.2, Math.max(1.4, 1350 / Math.max(baseVp.width, baseVp.height)));
              const vp = page.getViewport({ scale });

              const canvas = document.createElement('canvas');
              canvas.width = Math.floor(vp.width);
              canvas.height = Math.floor(vp.height);
              const ctx = canvas.getContext('2d', { alpha: false });
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              await page.render({ canvasContext: ctx, viewport: vp }).promise;
              rendered.push(canvas);

              if (pageNum === 1 && !cancelled) {
                setPageAspect(vp.width / vp.height);
              }
            }

            if (!cancelled) {
              setPageCanvases(rendered);
              setLoading(false);
            }
            return;
          }
        } catch (err) {
          console.warn('PDF load failed, falling back to illustrated text pages:', err);
        }
      }

      // Fallback: Render story.pages onto 3D canvases
      if (!cancelled) {
        const fallbackCanvases = generateCanvasesFromStoryPages(story);
        setPageAspect(fallbackCanvases[0].width / fallbackCanvases[0].height);
        setPageCanvases(fallbackCanvases);
        setLoading(false);
      }
    }

    loadStoryBook();
    return () => {
      cancelled = true;
    };
  }, [story]);

  // Responsive layout calculation (2-page spread on desktop, 1-page on mobile)
  const updateLayoutSize = useCallback(() => {
    const isMobile = window.innerWidth <= 768;
    setSingleMode(isMobile);

    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const availW = Math.max(240, rect.width - (isMobile ? 16 : 64));
    const availH = Math.max(320, rect.height - (isMobile ? 16 : 36));

    const targetRatio = isMobile ? pageAspect : pageAspect * 2;
    let w = availW;
    let h = w / targetRatio;

    if (h > availH) {
      h = availH;
      w = h * targetRatio;
    }

    setBookSize({ width: Math.round(w), height: Math.round(h) });
  }, [pageAspect]);

  useEffect(() => {
    updateLayoutSize(); // eslint-disable-line react-hooks/set-state-in-effect
    window.addEventListener('resize', updateLayoutSize);
    return () => window.removeEventListener('resize', updateLayoutSize);
  }, [updateLayoutSize, isFullscreen]);

  // Calculate maximum index based on mode
  const totalPages = pageCanvases.length;
  const maxIndex = singleMode
    ? Math.max(0, totalPages - 1)
    : Math.max(0, Math.floor((totalPages - 1) / 2));

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleToggleKidZoom = () => {
    if (zoom > 1.05) {
      resetZoom();
    } else {
      // Zoom smoothly to 1.75x anchored slightly toward the top half for easy reading
      const maxY = Math.max(0, (bookSize.height * 1.75 - bookSize.height) / 2);
      setZoom(1.75);
      setPan({ x: 0, y: maxY * 0.65 });
    }
  };

  const flipNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= maxIndex) return prev;
      setTurningIndex(prev);
      setTimeout(() => setTurningIndex(null), 700);
      playPageFlipSound(audioCtxRef, soundEnabled);
      return prev + 1;
    });
    resetZoom();
  }, [maxIndex, soundEnabled, resetZoom]);

  const flipPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      const target = prev - 1;
      setTurningIndex(target);
      setTimeout(() => setTurningIndex(null), 700);
      playPageFlipSound(audioCtxRef, soundEnabled);
      return target;
    });
    resetZoom();
  }, [soundEnabled, resetZoom]);

  // Keyboard arrows support
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        flipNext(); // In Arabic RTL, pressing Left advances to the next page
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        flipPrev();
      } else if (e.key === 'Escape' && zoom > 1.05) {
        resetZoom();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [flipNext, flipPrev, zoom, resetZoom]);

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Drag-to-pan (when zoomed) or Swipe-to-flip (when not zoomed)
  const gestureRef = useRef({ startX: 0, startY: 0, originPanX: 0, originPanY: 0, active: false });

  const clampPan = (px, py, z) => {
    if (z <= 1.02) return { x: 0, y: 0 };
    const maxX = Math.max(0, (bookSize.width * z - bookSize.width) / 2);
    const maxY = Math.max(0, (bookSize.height * z - bookSize.height) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, px)),
      y: Math.max(-maxY, Math.min(maxY, py)),
    };
  };

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    gestureRef.current = {
      startX: clientX,
      startY: clientY,
      originPanX: pan.x,
      originPanY: pan.y,
      active: true,
      moved: false,
    };
    if (zoom > 1.05) setIsDraggingPan(true);
  };

  const onPointerMove = (e) => {
    if (!gestureRef.current.active) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const dx = clientX - gestureRef.current.startX;
    const dy = clientY - gestureRef.current.startY;

    if (Math.hypot(dx, dy) > 8) {
      gestureRef.current.moved = true;
    }

    if (zoom > 1.05) {
      const clamped = clampPan(
        gestureRef.current.originPanX + dx,
        gestureRef.current.originPanY + dy,
        zoom
      );
      setPan(clamped);
    }
  };

  const onPointerUp = (e) => {
    if (!gestureRef.current.active) return;
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const dx = clientX - gestureRef.current.startX;

    if (zoom <= 1.05 && gestureRef.current.moved && Math.abs(dx) > 45) {
      // In Arabic RTL: dragging left-to-right (dx > 0) flips page to the right (Next Page)
      if (dx > 45) flipNext();
      else if (dx < -45) flipPrev();
    }

    gestureRef.current.active = false;
    setIsDraggingPan(false);
  };

  // Build leaf descriptor list for rendering
  const leavesData = [];
  if (singleMode) {
    for (let i = 0; i < totalPages; i++) {
      leavesData.push({ index: i, frontCanvas: pageCanvases[i], backCanvas: null });
    }
  } else {
    const remaining = Math.max(0, totalPages - 1);
    const numLeaves = Math.ceil(remaining / 2);
    for (let k = 0; k < numLeaves; k++) {
      leavesData.push({
        index: k,
        frontCanvas: pageCanvases[2 * k + 1] || null, // Left side page (Page 2, 4, 6...)
        backCanvas: pageCanvases[2 * k + 2] || null,  // Right side page after flip (Page 3, 5, 7...)
      });
    }
  }

  // Page indicator text in friendly Arabic
  let pageLabel = `صفحة ${currentIndex + 1} من ${Math.max(1, totalPages)}`;
  if (!singleMode && totalPages > 1) {
    const rightP = currentIndex * 2 + 1;
    const leftP = currentIndex * 2 + 2;
    pageLabel = leftP <= totalPages
      ? `صفحة ${rightP} - ${leftP} من ${totalPages}`
      : `صفحة ${rightP} من ${totalPages}`;
  }

  return (
    <div
      ref={wrapperRef}
      dir="rtl"
      className={`sk-flipbook-wrapper${isFullscreen ? ' sk-fullscreen-active' : ''}`}
    >
      {/* Top Child-Friendly Bar */}
      <div className="sk-flipbook-topbar">
        <div className="sk-flipbook-title-badge">
          <span>📖</span>
          <span>{story?.title || 'قارئ القصص التفاعلي'}</span>
        </div>

        <div className="sk-flipbook-tools">
          {/* 1-Tap Child-Friendly Zoom Button */}
          <button
            type="button"
            className={`sk-tool-btn${zoom > 1.05 ? ' zoom-active' : ''}`}
            onClick={handleToggleKidZoom}
            title={zoom > 1.05 ? 'إرجاع حجم الصفحة الطبيعي' : 'تكبير الصفحة لقراءة أوضح'}
          >
            <span>{zoom > 1.05 ? '🔎' : '🔍'}</span>
            <span>{zoom > 1.05 ? 'حجم عادي' : 'تكبير الخط'}</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            type="button"
            className={`sk-tool-btn${soundEnabled ? ' active' : ''}`}
            onClick={() => setSoundEnabled((prev) => !prev)}
            title="تشغيل / كتم صوت تقليب الورق"
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            <span className="sk-tool-label-hide-mobile">صوت الورق</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            className="sk-tool-btn"
            onClick={handleToggleFullscreen}
            title="ملء الشاشة"
          >
            <span>{isFullscreen ? '✕' : '⛶'}</span>
            <span className="sk-tool-label-hide-mobile">
              {isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
            </span>
          </button>
        </div>
      </div>

      {/* Main 3D Flipbook Stage */}
      <div
        ref={stageRef}
        className="sk-stage-container"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
        onDoubleClick={handleToggleKidZoom}
      >
        {loading && (
          <div className="sk-loading-overlay">
            <div style={{ fontSize: '2.5rem' }}>📚</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{loadingText}</div>
            <div className="sk-progress-bar">
              <div className="sk-progress-fill" style={{ width: `${loadingProgress}%` }} />
            </div>
          </div>
        )}

        <div
          ref={zoomLayerRef}
          className={`sk-book-zoom-layer${isDraggingPan ? ' no-transition' : ''}${
            zoom > 1.05 ? ' is-zoomed' : ''
          }`}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          }}
        >
          <div
            ref={viewportRef}
            className={`sk-book-viewport${singleMode ? ' single-mode' : ''}`}
            style={{
              width: `${bookSize.width}px`,
              height: `${bookSize.height}px`,
            }}
          >
            <div className="sk-book-hardcover" />
            <div
              className="sk-paper-stack sk-paper-stack-left"
              style={{ width: `${Math.max(2, Math.min(14, (leavesData.length - currentIndex) * 2))}px` }}
            />
            <div
              className="sk-paper-stack sk-paper-stack-right"
              style={{ width: `${Math.max(2, Math.min(14, (currentIndex + 1) * 2))}px` }}
            />
            <div className="sk-book-spine" />

            <div className="sk-leaves-stage">
              {/* Static Right Base Page (Page 1 in 2-Page RTL Spread Mode) */}
              {!singleMode && pageCanvases[0] && (
                <div
                  className="sk-static-base-right"
                  onClick={() => {
                    if (zoom <= 1.05 && !gestureRef.current.moved && currentIndex > 0) {
                      flipPrev();
                    }
                  }}
                >
                  <CanvasFace canvas={pageCanvases[0]} />
                  <div className="sk-gutter-overlay" />
                </div>
              )}

              {/* 3D Flipping Leaves */}
              {leavesData.map((item) => {
                const isFlipped = item.index < currentIndex;
                const isTurning = turningIndex === item.index;
                const total = leavesData.length;
                const zIndex = isTurning
                  ? total + 30
                  : isFlipped
                  ? item.index + 1
                  : total - item.index;

                return (
                  <div
                    key={item.index}
                    className={`sk-leaf${isFlipped ? ' flipped' : ''}`}
                    style={{ zIndex }}
                    onClick={() => {
                      if (zoom > 1.05 || gestureRef.current.moved) return;
                      if (!isFlipped && item.index === currentIndex) {
                        flipNext();
                      } else if (isFlipped && item.index === currentIndex - 1) {
                        flipPrev();
                      }
                    }}
                  >
                    <div className="sk-leaf-face sk-leaf-front">
                      <CanvasFace canvas={item.frontCanvas} />
                      <div className="sk-gutter-overlay" />
                    </div>
                    <div className="sk-leaf-face sk-leaf-back">
                      <CanvasFace canvas={item.backCanvas} />
                      <div className="sk-gutter-overlay" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Kid-Friendly Navigation Controls */}
      <div className="sk-flipbook-bottombar">
        <button
          type="button"
          className="sk-nav-btn"
          disabled={currentIndex <= 0}
          onClick={flipPrev}
          aria-label="الصفحة السابقة"
        >
          <span>➡️</span>
          <span>السابق</span>
        </button>

        <div className="sk-page-pill">{pageLabel}</div>

        <button
          type="button"
          className="sk-nav-btn"
          disabled={currentIndex >= maxIndex}
          onClick={flipNext}
          aria-label="الصفحة التالية"
        >
          <span>التالي</span>
          <span>⬅️</span>
        </button>
      </div>
    </div>
  );
}

function CanvasFace({ canvas }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = '';
    if (canvas) {
      const clone = document.createElement('canvas');
      clone.width = canvas.width;
      clone.height = canvas.height;
      clone.getContext('2d').drawImage(canvas, 0, 0);
      el.appendChild(clone);
    }
  }, [canvas]);

  if (!canvas) {
    return (
      <div className="sk-endpaper">
        <span style={{ fontSize: '2.2rem' }}>🌟</span>
        <span>نهاية القصة — أحسنت القراءة!</span>
      </div>
    );
  }

  return <div ref={containerRef} className="sk-page-canvas-wrap" />;
}

export default FlipbookReader;
