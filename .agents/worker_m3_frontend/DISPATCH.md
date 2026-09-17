# Dispatch — Worker M3 Frontend

**Working Directory**: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\worker_m3_frontend
**Role**: Worker for Milestone 3 (React 19 Frontend Restructuring & Theming)
**Parent**: Orchestrator (Conversation ID: 26420394-9c67-4e74-8355-a352847811c1)

## Mission
Restructure and implement the complete React 19 frontend in `client/` according to ORIGINAL_REQUEST.md and PROJECT.md, ensuring modular component architecture, design tokens, useTheme hook, RTL & Cairo typography, clean pages, Vite proxy to .NET backend, and passing `npm run build` and `npm run lint`.

## Scope & Owned Files
You exclusively own `client/`:
- `client/vite.config.js`
- `client/index.html`
- `client/src/main.jsx`
- `client/src/App.jsx`
- `client/src/index.css`
- `client/src/hooks/useTheme.js`
- `client/src/styles/variables.css`
- `client/src/styles/reset.css`
- `client/src/styles/typography.css`
- `client/src/styles/App.css`
- `client/src/styles/Navbar.css`
- `client/src/styles/Footer.css`
- `client/src/styles/HomePage.css`
- `client/src/styles/LibraryPage.css`
- `client/src/styles/StoryPage.css`
- `client/src/styles/StoryCard.css`
- `client/src/styles/StoryDetailsModal.css`
- `client/src/styles/ThemeToggle.css`
- `client/src/components/layout/Navbar.jsx`
- `client/src/components/layout/Footer.jsx`
- `client/src/components/ui/StoryCard.jsx`
- `client/src/components/ui/StoryDetailsModal.jsx`
- `client/src/components/ui/ThemeToggle.jsx`
- `client/src/components/ui/SkeletonCard.jsx`
- `client/src/components/sections/HeroSection.jsx`
- `client/src/components/sections/StoriesSection.jsx`
- `client/src/pages/HomePage.jsx`
- `client/src/pages/LibraryPage.jsx`
- `client/src/pages/StoryPage.jsx`
- `client/src/data/stories.js`

DO NOT modify `server/` or `.agents/` outside your working directory.

## Technical Specifications
1. **Directory Architecture**:
   - `components/layout/` contains `Navbar.jsx`, `Footer.jsx`
   - `components/ui/` contains `StoryCard.jsx`, `StoryDetailsModal.jsx`, `ThemeToggle.jsx`, `SkeletonCard.jsx`
   - `components/sections/` contains `HeroSection.jsx`, `StoriesSection.jsx`
   - `hooks/useTheme.js` exports `useTheme`
   - `styles/` contains `variables.css`, `reset.css`, `typography.css`, and component CSS files.
2. **Theming & `useTheme.js`**:
   - Manages `'light'` and `'dark'` mode.
   - Reads/writes to `localStorage.getItem('theme')` (default `'light'`).
   - Sets `document.documentElement.setAttribute('data-theme', theme)` and `document.body.className = theme`.
   - `ThemeToggle.jsx` uses `useTheme` and renders accessible button with sun/moon icon from `lucide-react`.
3. **Design Tokens & CSS**:
   - `variables.css` defines all tokens: `--color-primary`, `--color-primary-dark`, `--color-secondary`, `--color-accent`, `--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--border-color`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--yellow`, `--border-radius-sm`, etc., for both `:root` and `[data-theme="dark"]`.
   - Fix all undefined CSS variables and `.hero` class conflicts.
   - Ensure clean scoped or distinct class names.
4. **Typography & RTL**:
   - `index.html`: Ensure `<html lang="ar" dir="rtl">`.
   - Single Cairo font link in `index.html` (Google Fonts: `family=Cairo:wght@400;600;700;800`).
   - `typography.css`: font-family Cairo applied across all headings, body, buttons, inputs.
5. **Routes & Pages**:
   - Exactly 3 navigable routes in `App.jsx`:
     - `/` -> `HomePage`
     - `/library` -> `LibraryPage`
     - `/story/:id` -> `StoryPage`
   - Zero auth guards, zero cart contexts.
6. **Navbar & Footer**:
   - `Navbar.jsx`: Logo ("سوبر قيم"), links to "الرئيسية" (`/`) and "قصصنا" (`/library`), `ThemeToggle`, mobile hamburger menu. ZERO cart, ZERO login/account/admin buttons.
   - `Footer.jsx`: Platform description, quick links, dynamic year (`new Date().getFullYear()`).
7. **StoryDetailsModal**:
   - Informative presentation modal ONLY.
   - Shows story title, category badge, age group badge, rating, description, page count, and a button "اقرأ القصة الآن" linking directly to `/story/:id`.
   - ABSOLUTELY NO purchase, price checkout, or add-to-cart buttons.
8. **Currency & Data**:
   - Display prices uniformly in Egyptian Pounds: `${price} ج.م` or `ج.م`.
   - ABSOLUTELY NO `SAR`, `ريال`, or `ر.س`.
   - `stories.js` fallback seed data with the 6 Arabic stories matching backend.
   - Data fetching uses native browser `fetch('/api/stories')` and `fetch('/api/stories/' + id)` with fallback to `stories.js` if backend is offline.
9. **Vite Proxy**:
   - `vite.config.js`: proxy `/api` -> `http://localhost:5080`.
10. **Build & Lint**:
    - Run `npm run lint` and `npm run build` inside `client/` and fix any linting or build errors.

## Handoff Requirements
Write progress to `progress.md` and complete handoff to `handoff.md` with build logs and verification results.

## 2026-09-17T02:25:17Z
Mission received:
Restructure and implement the complete React 19 frontend in client/:
1. Organize components: layout (Navbar, Footer), ui (StoryCard, StoryDetailsModal, ThemeToggle, SkeletonCard), sections (HeroSection, StoriesSection).
2. Create client/src/hooks/useTheme.js (exporting useTheme with localStorage persistence, data-theme attribute on documentElement).
3. Create client/src/styles/variables.css, reset.css, typography.css (single Cairo font, Arabic typography), component CSS files.
4. Clean Navbar (only logo, الرئيسية, قصصنا, ThemeToggle, hamburger; zero cart/auth/admin).
5. Clean Footer (dynamic current year copyright).
6. Create/update HomePage, LibraryPage (search and category filter across 6 categories), and StoryPage (/story/:id via useParams, clean reader view).
7. StoryDetailsModal: informative presentation modal with button "اقرأ القصة الآن" linking to /story/:id, NO purchase or cart buttons.
8. Currency: uniform Egyptian Pounds (ج.م), zero occurrences of SAR, ريال, or ر.س.
9. Fallback data in client/src/data/stories.js with 6 Arabic stories in EGP matching backend.
10. Update client/vite.config.js proxy to http://localhost:5080.
11. Update client/index.html with dir="rtl", lang="ar", and Cairo font link.
12. Run npm run lint and npm run build in client/ and verify 0 errors.
13. Write progress.md and handoff.md in your working directory.
14. Send message to parent when done.

