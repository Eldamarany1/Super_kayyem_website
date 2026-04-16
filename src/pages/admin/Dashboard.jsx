// =============================================================
//  Dashboard.jsx — Admin analytics overview
//  Fetches GET /api/admin/analytics and renders:
//    • KPI cards: users, revenue, stories, pending transactions
//    • Monthly stats bar chart (pure CSS)
//    • Top-selling stories table
// =============================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

// ── Helpers ────────────────────────────────────────────────────
const MONTH_NAMES_AR = [
  '', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

function fmt(n, currency = false) {
  if (n == null) return '—';
  return currency
    ? new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(n)
    : new Intl.NumberFormat('ar-SA').format(n);
}

// ── KPI card ────────────────────────────────────────────────────
function KpiCard({ icon, label, value, delta, color }) {
  return (
    <div className={`kpi-card kpi-card--${color}`}>
      <div className="kpi-card__icon" aria-hidden="true">{icon}</div>
      <div className="kpi-card__body">
        <p className="kpi-card__label">{label}</p>
        <p className="kpi-card__value">{value}</p>
        {delta != null && (
          <p className={`kpi-card__delta${delta >= 0 ? ' kpi-card__delta--up' : ' kpi-card__delta--down'}`}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </p>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="dash-skeleton">
      <div className="dash-skeleton__kpis">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="dash-skeleton__kpi-card" />
        ))}
      </div>
      <div className="dash-skeleton__chart" />
      <div className="dash-skeleton__table" />
    </div>
  );
}

// ── Mini bar chart (pure CSS — no chart library needed) ──────────
function BarChart({ data }) {
  if (!data?.length) return <p className="dash-empty">لا توجد بيانات شهرية.</p>;
  const maxRevenue = Math.max(...data.map((d) => d.totalRevenue), 1);

  return (
    <div className="bar-chart" role="img" aria-label="الإيرادات الشهرية">
      <div className="bar-chart__bars">
        {data.slice(-12).map((d) => (
          <div key={`${d.year}-${d.month}`} className="bar-chart__col">
            <div
              className="bar-chart__bar"
              style={{ height: `${(d.totalRevenue / maxRevenue) * 100}%` }}
              title={`${MONTH_NAMES_AR[d.month]} ${d.year}: ${fmt(d.totalRevenue, true)}`}
            >
              <span className="bar-chart__bar-tip">{fmt(d.totalRevenue, true)}</span>
            </div>
            <span className="bar-chart__label">{MONTH_NAMES_AR[d.month]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [stories,   setStories]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsRes, storiesRes] = await Promise.allSettled([
          apiClient.get('/admin/analytics'),
          apiClient.get('/stories'),
        ]);

        if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success) {
          setAnalytics(analyticsRes.value.data);
        }
        if (storiesRes.status === 'fulfilled' && storiesRes.value.success) {
          setStories(storiesRes.value.data ?? []);
        }
      } catch (err) {
        setError(err.message || 'تعذّر تحميل البيانات.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) return (
    <div className="dash-error" role="alert" dir="rtl">
      <p>⚠️ {error}</p>
      <button className="fbr-btn" onClick={() => window.location.reload()}>إعادة المحاولة</button>
    </div>
  );

  // ── Aggregate KPI totals from monthly stats ──────────────────
  const monthly = analytics?.monthlyStats ?? [];
  const totalRevenue  = monthly.reduce((s, m) => s + m.totalRevenue, 0);
  const totalSales    = monthly.reduce((s, m) => s + m.salesCount,   0);
  const totalUsers    = monthly.reduce((s, m) => s + m.activeUsers,  0);
  const topStories    = analytics?.topSellingStories ?? [];
  const publishedCount = stories.filter((s) => s.publicationStatus === 'Published').length;

  return (
    <div className="dashboard" dir="rtl">

      {/* ── KPI Row ─────────────────────────────────────────── */}
      <section className="dash-kpis" aria-label="مؤشرات الأداء">
        <KpiCard icon="👥" label="إجمالي المستخدمين"   value={fmt(totalUsers)}         color="blue"   />
        <KpiCard icon="💰" label="إجمالي الإيرادات"    value={fmt(totalRevenue, true)} color="green"  />
        <KpiCard icon="🛒" label="إجمالي المبيعات"     value={fmt(totalSales)}         color="purple" />
        <KpiCard icon="📚" label="القصص المنشورة"      value={fmt(publishedCount)}     color="amber"  />
      </section>

      {/* ── Monthly Revenue Chart ───────────────────────────── */}
      <section className="dash-card">
        <div className="dash-card__header">
          <h3 className="dash-card__title">الإيرادات الشهرية</h3>
        </div>
        <BarChart data={monthly} />
      </section>

      {/* ── Top Selling Stories ─────────────────────────────── */}
      <section className="dash-card">
        <div className="dash-card__header">
          <h3 className="dash-card__title">🏆 أكثر القصص مبيعاً</h3>
          <button
            className="dash-card__action"
            onClick={() => navigate('/admin/stories')}
          >
            عرض الكل
          </button>
        </div>
        {topStories.length === 0 ? (
          <p className="dash-empty">لا توجد مبيعات بعد.</p>
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table" aria-label="أكثر القصص مبيعاً">
              <thead>
                <tr>
                  <th>#</th>
                  <th>القصة</th>
                  <th>عدد المبيعات</th>
                  <th>الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {topStories.map((s, i) => (
                  <tr key={s.storyId} className="dash-table__row">
                    <td className="dash-table__rank">
                      <span className={`rank-badge rank-badge--${i + 1}`}>{i + 1}</span>
                    </td>
                    <td className="dash-table__name">{s.title}</td>
                    <td className="dash-table__sales">{fmt(s.salesCount)}</td>
                    <td className="dash-table__revenue">{fmt(s.totalRevenue, true)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── All Stories quick list ──────────────────────────── */}
      <section className="dash-card">
        <div className="dash-card__header">
          <h3 className="dash-card__title">📚 جميع القصص</h3>
          <button
            className="dash-card__action dash-card__action--primary"
            onClick={() => navigate('/admin/stories/new')}
          >
            + إضافة قصة
          </button>
        </div>
        {stories.length === 0 ? (
          <p className="dash-empty">لا توجد قصص بعد. أضف قصتك الأولى!</p>
        ) : (
          <div className="dash-table-wrapper">
            <table className="dash-table" aria-label="قائمة القصص">
              <thead>
                <tr>
                  <th>الغلاف</th>
                  <th>العنوان</th>
                  <th>النوع</th>
                  <th>السعر</th>
                  <th>الحالة</th>
                  <th>التقييم</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((s) => (
                  <tr key={s.id} className="dash-table__row">
                    <td>
                      <img
                        src={s.coverImageUrl || '/placeholder.png'}
                        alt={s.title}
                        className="dash-table__cover"
                        loading="lazy"
                      />
                    </td>
                    <td className="dash-table__name">{s.title}</td>
                    <td>{s.bookType === 'ChildrenStory' ? 'قصة أطفال' : 'دليل تربوي'}</td>
                    <td>{fmt(s.price, true)}</td>
                    <td>
                      <span className={`status-badge status-badge--${s.publicationStatus?.toLowerCase()}`}>
                        {{ Draft: 'مسودة', Published: 'منشور', Cancelled: 'ملغي' }[s.publicationStatus] ?? s.publicationStatus}
                      </span>
                    </td>
                    <td>{'⭐'.repeat(Math.round(s.averageRating))} ({s.reviewCount})</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}
