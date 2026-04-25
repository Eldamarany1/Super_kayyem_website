// ============================================================
//  CheckoutModal.jsx — بوابة الدفع الاحترافية
//  Props: items (array), onClose (fn)
//  Tabs: Credit Card | Instapay | Vodafone Cash
//  On confirm: 2s loading → success state → clearCart + navigate /my-library
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { recordPurchase } from '../api/library';
import '../styles/CheckoutModal.css';

// ── Country codes for Vodafone Cash ─────────────────────────
const COUNTRY_CODES = [
  { code: '+20',  flag: '🇪🇬', name: 'مصر'             },
  { code: '+966', flag: '🇸🇦', name: 'السعودية'        },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات'        },
  { code: '+965', flag: '🇰🇼', name: 'الكويت'          },
  { code: '+974', flag: '🇶🇦', name: 'قطر'             },
  { code: '+973', flag: '🇧🇭', name: 'البحرين'         },
  { code: '+968', flag: '🇴🇲', name: 'عُمان'           },
  { code: '+962', flag: '🇯🇴', name: 'الأردن'          },
  { code: '+961', flag: '🇱🇧', name: 'لبنان'           },
  { code: '+1',   flag: '🇺🇸', name: 'الولايات المتحدة' },
  { code: '+44',  flag: '🇬🇧', name: 'المملكة المتحدة'  },
];

// ── Shared Field ─────────────────────────────────────────────
function Field({ label, id, type = 'text', placeholder, value, onChange, maxLength, inputMode }) {
  return (
    <div className="co-field">
      <label htmlFor={id} className="co-field__label">{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete="off"
        className="co-field__input"
      />
    </div>
  );
}

// ── Tab: Credit Card ─────────────────────────────────────────
function CreditCardTab() {
  const [cardNum, setCardNum] = useState('');
  const [expiry,  setExpiry]  = useState('');
  const [cvv,     setCvv]     = useState('');
  const [name,    setName]    = useState('');

  const formatCardNum = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry  = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };

  return (
    <div>
      {/* Card visual */}
      <div className="co-card-visual">
        <div className="co-card-visual__bubble co-card-visual__bubble--top" />
        <div className="co-card-visual__bubble co-card-visual__bubble--btm" />
        <div className="co-card-visual__number">{cardNum || '•••• •••• •••• ••••'}</div>
        <div className="co-card-visual__meta">
          <div>
            <div className="co-card-visual__meta-label">اسم حامل البطاقة</div>
            <div className="co-card-visual__meta-value co-card-visual__meta-name">{name || 'CARDHOLDER NAME'}</div>
          </div>
          <div className="co-card-visual__meta-right">
            <div className="co-card-visual__meta-label">انتهاء الصلاحية</div>
            <div className="co-card-visual__meta-value">{expiry || 'MM/YY'}</div>
          </div>
        </div>
      </div>

      <Field id="cc-name"   label="اسم حامل البطاقة"  placeholder="AHMED SAID"          value={name}    onChange={(e) => setName(e.target.value.toUpperCase())} />
      <Field id="cc-number" label="رقم البطاقة (16 رقمًا)" placeholder="1234 5678 9012 3456" value={cardNum}  onChange={(e) => setCardNum(formatCardNum(e.target.value))} inputMode="numeric" maxLength={19} />
      <div className="co-card-grid">
        <Field id="cc-expiry" label="تاريخ الانتهاء" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} inputMode="numeric" maxLength={5} />
        <Field id="cc-cvv"    label="CVV"             placeholder="•••"   value={cvv}   onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} type="password" inputMode="numeric" maxLength={3} />
      </div>
    </div>
  );
}

// ── Tab: Instapay ─────────────────────────────────────────────
function InstapayTab() {
  const [address, setAddress] = useState('');
  const [phone,   setPhone]   = useState('');

  return (
    <div>
      <div className="co-brand-header co-brand-header--insta">
        <div className="co-brand-header__icon">📲</div>
        <div>
          <div className="co-brand-header__name">انستاباي</div>
          <div className="co-brand-header__tagline">الدفع الفوري عبر شبكة مصر للمدفوعات</div>
        </div>
      </div>
      <Field id="ip-address" label="عنوان انستاباي"        placeholder="ahmed@instapay"  value={address} onChange={(e) => setAddress(e.target.value)} />
      <Field id="ip-phone"   label="رقم الهاتف المرتبط"    placeholder="01XXXXXXXXX"     value={phone}   onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} inputMode="tel" maxLength={11} />
    </div>
  );
}

// ── Tab: Vodafone Cash ────────────────────────────────────────
function VodafoneCashTab() {
  const [countryCode, setCountryCode] = useState('+20');
  const [phone,       setPhone]       = useState('');

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <div>
      <div className="co-brand-header co-brand-header--voda">
        <div className="co-brand-header__icon">📱</div>
        <div>
          <div className="co-brand-header__name">فودافون كاش</div>
          <div className="co-brand-header__tagline">ادفع بسهولة من محفظتك الإلكترونية</div>
        </div>
      </div>

      <div className="co-field">
        <label htmlFor="vf-phone" className="co-field__label">رقم الهاتف</label>
        <div className="co-phone-row">
          <div className="co-country-select-wrap">
            <select
              id="vf-country-code"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="co-country-select"
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
              ))}
            </select>
            <span className="co-country-select-arrow">▼</span>
          </div>
          <input
            id="vf-phone"
            type="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            inputMode="tel"
            maxLength={11}
            autoComplete="off"
            className="co-phone-input"
          />
        </div>
        <p className="co-phone-hint">
          {selectedCountry.flag} {selectedCountry.name} — الرمز الدولي:{' '}
          <strong style={{ direction: 'ltr', display: 'inline-block' }}>{countryCode}</strong>
        </p>
      </div>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────
function CheckoutModal({ items = [], onClose }) {
  const { clearCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(0);
  const [paying,    setPaying]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [visible,   setVisible]   = useState(false);

  const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.price || 0), 0);

  // Animate in
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  // ESC close
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape' && !paying) handleClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [paying]);

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 300);
  }, [onClose]);

  const handleConfirm = () => {
    if (paying || success) return;
    setPaying(true);
    const storyIds     = items.map((i) => i.id).filter(Boolean);
    const paymentLabel = ['CreditCard', 'Instapay', 'VodafoneCash'][activeTab] ?? 'Online';
    recordPurchase(storyIds, paymentLabel).catch(console.warn);
    setTimeout(() => {
      setPaying(false);
      setSuccess(true);
      clearCart();
    }, 2000);
  };

  const TABS = [
    { icon: '💳', label: 'البطاقة الائتمانية', activeClass: 'co-tab-btn--active-card'  },
    { icon: '📲', label: 'انستاباي',            activeClass: 'co-tab-btn--active-insta' },
    { icon: '📱', label: 'فودافون كاش',         activeClass: 'co-tab-btn--active-voda'  },
  ];

  return (
    <div
      dir="rtl"
      onClick={(e) => { if (e.target === e.currentTarget && !paying) handleClose(); }}
      className={`co-backdrop${visible ? ' co-backdrop--visible' : ''}`}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="نافذة الدفع"
        className="co-panel"
      >
        {/* Header */}
        <div className="co-header">
          <div>
            <h2 className="co-header__title">🔒 إتمام عملية الشراء</h2>
            <p className="co-header__subtitle">
              ({items.length}) {items.length === 1 ? 'قصة' : 'قصص'} — إجمالي:{' '}
              <strong className="co-header__total">{totalAmount.toFixed(2)} ج.م</strong>
            </p>
          </div>
          {!paying && !success && (
            <button onClick={handleClose} className="co-header__close-btn" aria-label="إلغاء">✕</button>
          )}
        </div>

        {/* ── SUCCESS STATE ── */}
        {success ? (
          <div className="co-success">
            <div className="co-success__icon">✅</div>
            <h2 className="co-success__title">تمت عملية الشراء بنجاح</h2>
            <p className="co-success__msg">شكرًا لتوثيق ثقتك بـ سوبر قيم 🎉</p>
            <p className="co-success__sub">يمكنك الآن قراءة قصصك من مكتبتك الشخصية.</p>

            <div className="co-success__items">
              {items.map((item) => (
                <div key={item.id} className="co-success__item">
                  <span className="co-success__item-icon">📖</span>
                  <span className="co-success__item-title">{item.title}</span>
                  <span className="co-success__item-price">{parseFloat(item.price).toFixed(2)} ج.م</span>
                </div>
              ))}
            </div>

            <button
              id="checkout-goto-library-btn"
              onClick={() => { handleClose(); navigate('/my-library'); }}
              className="co-success__cta"
            >
              الذهاب لمكتبتي 📚
            </button>
          </div>

        ) : (
          <div className="co-body">

            {/* Order summary */}
            <div className="co-summary">
              <div className="co-summary__label">ملخص الطلب</div>
              {items.map((item) => (
                <div key={item.id} className="co-summary__row">
                  <span className="co-summary__row-title">📖 {item.title}</span>
                  <span className="co-summary__row-price">{parseFloat(item.price).toFixed(2)} ج.م</span>
                </div>
              ))}
              <div className="co-summary__total-row">
                <span className="co-summary__total-label">الإجمالي</span>
                <span className="co-summary__total-value">{totalAmount.toFixed(2)} ج.م</span>
              </div>
            </div>

            {/* Payment method tabs */}
            <div>
              <div className="co-tabs-label">اختر طريقة الدفع</div>
              <div className="co-tabs">
                {TABS.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`co-tab-btn${activeTab === idx ? ` ${tab.activeClass}` : ''}`}
                  >
                    <span className="co-tab-btn__icon">{tab.icon}</span>
                    <span className="co-tab-btn__label">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="co-tab-content">
                {activeTab === 0 && <CreditCardTab />}
                {activeTab === 1 && <InstapayTab />}
                {activeTab === 2 && <VodafoneCashTab />}
              </div>
            </div>

            {/* Action buttons */}
            <div className="co-actions">
              <button
                id="checkout-cancel-btn"
                onClick={handleClose}
                disabled={paying}
                className="co-cancel-btn"
              >
                إلغاء
              </button>
              <button
                id="checkout-confirm-btn"
                onClick={handleConfirm}
                disabled={paying}
                className="co-confirm-btn"
              >
                {paying ? (
                  <>
                    <span className="co-spinner" />
                    جاري المعالجة...
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    تأكيد الدفع — {totalAmount.toFixed(2)} ج.م
                  </>
                )}
              </button>
            </div>

            <p className="co-security-note">🔐 جميع معاملاتك مشفرة وآمنة تمامًا</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
