// =============================================================
//  StoryEditor.jsx — Admin Story Creation Page
//  Route: /admin/stories/new
//  Uses multipart/form-data via apiMultipart to POST to
//  POST /api/stories/upload
// =============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiMultipart } from '../../api/client';
import apiClient from '../../api/client';

// ── Tiny rich-text toolbar (no extra dependency) ──────────────
function RichTextToolbar({ editorRef }) {
  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };
  const buttons = [
    { label: 'B', cmd: 'bold',      title: 'Bold' },
    { label: 'I', cmd: 'italic',    title: 'Italic' },
    { label: 'U', cmd: 'underline', title: 'Underline' },
    { label: '≡', cmd: 'insertUnorderedList', title: 'Bullet list' },
    { label: '1.', cmd: 'insertOrderedList',  title: 'Numbered list' },
  ];
  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Text formatting">
      {buttons.map(({ label, cmd, title }) => (
        <button
          key={cmd}
          type="button"
          title={title}
          aria-label={title}
          className="rte-btn"
          onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Drag-and-drop file zone ───────────────────────────────────
function DropZone({ id, accept, label, file, onFile, preview }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }, [onFile]);

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <div
      className={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
      {preview ? (
        <div className="drop-zone__preview">
          {preview.startsWith('data:image') ? (
            <img src={preview} alt="Preview" className="drop-zone__img" />
          ) : (
            <p className="drop-zone__filename">📄 {file?.name}</p>
          )}
          <span className="drop-zone__change">Click to change</span>
        </div>
      ) : (
        <div className="drop-zone__placeholder">
          <span className="drop-zone__icon">☁</span>
          <p>{label}</p>
          <small>Drag & drop or click to browse</small>
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export default function StoryEditor() {
  const navigate = useNavigate();
  const editorRef = useRef(null);

  // Form state
  const [title,        setTitle]        = useState('');
  const [valueLearned, setValueLearned] = useState('');
  const [ageGroup,     setAgeGroup]     = useState('');
  const [bookType,     setBookType]     = useState('ChildrenStory');
  const [price,        setPrice]        = useState('0');
  const [packageId,    setPackageId]    = useState('');

  // File state
  const [coverFile,    setCoverFile]    = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverUrl,     setCoverUrl]     = useState('');
  const [contentFile,  setContentFile]  = useState(null);
  const [contentUrl,   setContentUrl]   = useState('');

  // Packages for the dropdown
  const [packages,        setPackages]        = useState([]);
  const [packagesLoading, setPackagesLoading] = useState(true);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  // ── Load packages for the monetization dropdown ────────────
  useEffect(() => {
    apiClient.get('/packages')
      .then((res) => setPackages(res.data ?? []))
      .catch(() => setPackages([]))
      .finally(() => setPackagesLoading(false));
  }, []);

  // ── Handle cover image file selection ─────────────────────
  const handleCoverFile = (file) => {
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // ── Handle content file selection ─────────────────────────
  const handleContentFile = (file) => {
    setContentFile(file);
  };

  // ── Submit handler ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const description = editorRef.current?.innerHTML ?? '';

    // Basic validation
    if (!title.trim()) { setError('العنوان مطلوب.'); return; }
    if (!description || description === '<br>') { setError('الوصف مطلوب.'); return; }
    if (!coverFile && !coverUrl.trim()) { setError('صورة الغلاف مطلوبة (ملف أو رابط).'); return; }
    if (Number(price) < 0) { setError('السعر لا يمكن أن يكون سالباً.'); return; }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('Title',          title.trim());
      formData.append('Description',    description);
      formData.append('ValueLearned',   valueLearned.trim());
      formData.append('TargetAgeGroup', ageGroup.trim());
      formData.append('BookType',       bookType);
      formData.append('Price',          price);

      if (coverFile)          formData.append('CoverImage',  coverFile);
      if (coverUrl.trim())    formData.append('CoverImageUrl', coverUrl.trim());
      if (contentFile)        formData.append('ContentFile', contentFile);
      if (contentUrl.trim())  formData.append('ContentUrl',  contentUrl.trim());
      if (packageId)          formData.append('PackageId',   packageId);

      const res = await apiMultipart.post('/stories/upload', formData);

      if (res.success) {
        setSuccess('✅ تم إنشاء القصة بنجاح!');
        setTimeout(() => navigate('/admin'), 1500);
      } else {
        setError(res.message || 'فشل إنشاء القصة.');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="story-editor" dir="rtl">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="se-header">
        <button className="se-back-btn" onClick={() => navigate('/admin')} type="button">
          ← العودة
        </button>
        <h1 className="se-title">إنشاء قصة جديدة</h1>
      </div>

      {/* ── Alerts ──────────────────────────────────────────── */}
      {error   && <div className="se-alert se-alert--error"   role="alert">{error}</div>}
      {success && <div className="se-alert se-alert--success" role="alert">{success}</div>}

      <form className="se-form" onSubmit={handleSubmit} noValidate>
        <div className="se-grid">

          {/* ══════════════════════════════════════════════════
              LEFT COLUMN — Content
          ══════════════════════════════════════════════════ */}
          <section className="se-card se-col-left">
            <h2 className="se-section-title">معلومات القصة</h2>

            {/* Title */}
            <div className="se-field">
              <label htmlFor="se-title" className="se-label">العنوان *</label>
              <input
                id="se-title"
                type="text"
                className="se-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان القصة"
                required
              />
            </div>

            {/* Value Learned */}
            <div className="se-field">
              <label htmlFor="se-value" className="se-label">القيمة المكتسبة</label>
              <input
                id="se-value"
                type="text"
                className="se-input"
                value={valueLearned}
                onChange={(e) => setValueLearned(e.target.value)}
                placeholder="مثال: الصدق، الشجاعة..."
              />
            </div>

            {/* Age Group */}
            <div className="se-field">
              <label htmlFor="se-age" className="se-label">الفئة العمرية المستهدفة</label>
              <input
                id="se-age"
                type="text"
                className="se-input"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                placeholder="مثال: 3-6 سنوات"
              />
            </div>

            {/* Book Type */}
            <div className="se-field">
              <label htmlFor="se-type" className="se-label">نوع الكتاب</label>
              <select
                id="se-type"
                className="se-input se-select"
                value={bookType}
                onChange={(e) => setBookType(e.target.value)}
              >
                <option value="ChildrenStory">قصة أطفال</option>
                <option value="ParentingGuide">دليل تربوي</option>
              </select>
            </div>

            {/* Rich Text Description */}
            <div className="se-field">
              <label className="se-label">الوصف *</label>
              <div className="se-rte">
                <RichTextToolbar editorRef={editorRef} />
                <div
                  id="se-description"
                  ref={editorRef}
                  className="se-rte__body"
                  contentEditable
                  suppressContentEditableWarning
                  aria-label="وصف القصة"
                  aria-multiline="true"
                  role="textbox"
                  data-placeholder="اكتب وصفاً تفصيلياً للقصة..."
                />
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════
              RIGHT COLUMN — Media & Monetization
          ══════════════════════════════════════════════════ */}
          <div className="se-col-right">

            {/* Cover Image */}
            <section className="se-card">
              <h2 className="se-section-title">صورة الغلاف *</h2>
              <DropZone
                id="se-cover"
                accept="image/*"
                label="ارفع صورة الغلاف"
                file={coverFile}
                onFile={handleCoverFile}
                preview={coverPreview}
              />
              <div className="se-or-divider"><span>أو أدخل رابطاً</span></div>
              <input
                id="se-cover-url"
                type="url"
                className="se-input"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />
            </section>

            {/* Content File */}
            <section className="se-card">
              <h2 className="se-section-title">ملف المحتوى (PDF / صور)</h2>
              <DropZone
                id="se-content"
                accept=".pdf,image/*"
                label="ارفع ملف القصة"
                file={contentFile}
                onFile={handleContentFile}
                preview={contentFile ? 'file' : ''}
              />
              <div className="se-or-divider"><span>أو أدخل رابطاً</span></div>
              <input
                id="se-content-url"
                type="url"
                className="se-input"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://example.com/story.pdf"
              />
            </section>

            {/* Monetization */}
            <section className="se-card">
              <h2 className="se-section-title">💰 التسعير والنشر</h2>

              <div className="se-field">
                <label htmlFor="se-price" className="se-label">السعر (ريال)</label>
                <input
                  id="se-price"
                  type="number"
                  className="se-input"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="se-field">
                <label htmlFor="se-package" className="se-label">تعيين للباقة</label>
                <select
                  id="se-package"
                  className="se-input se-select"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  disabled={packagesLoading}
                >
                  <option value="">— بدون باقة —</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                  ))}
                </select>
              </div>
            </section>

          </div>
        </div>

        {/* ── Submit ──────────────────────────────────────────── */}
        <div className="se-actions">
          <button
            type="button"
            className="se-btn se-btn--ghost"
            onClick={() => navigate('/admin')}
            disabled={submitting}
          >
            إلغاء
          </button>
          <button
            type="submit"
            id="se-submit"
            className="se-btn se-btn--primary"
            disabled={submitting}
          >
            {submitting ? '...جاري الحفظ' : '✓ حفظ القصة'}
          </button>
        </div>
      </form>
    </div>
  );
}
