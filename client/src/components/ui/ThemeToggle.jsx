import { Sun, Moon } from 'lucide-react';
import useTheme from '../../hooks/useTheme';
import '../../styles/ThemeToggle.css';

export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? 'التبديل إلى المظهر الفاتح' : 'التبديل إلى المظهر الداكن'}
      aria-label={isDark ? 'التبديل إلى المظهر الفاتح' : 'التبديل إلى المظهر الداكن'}
    >
      {isDark ? (
        <Sun className="theme-toggle-btn__icon" aria-hidden="true" />
      ) : (
        <Moon className="theme-toggle-btn__icon" aria-hidden="true" />
      )}
    </button>
  );
}

export default ThemeToggle;
