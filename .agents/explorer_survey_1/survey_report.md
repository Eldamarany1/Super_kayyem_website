# Comprehensive Frontend Codebase Survey Report
**Project:** Super Kayyem (سوبر قيم) Arabic Children's Interactive Storytelling Platform  
**Target Root:** `F:\MK_DM_project\super-kayyem\Super_kayyem_website`  
**Inspector:** Explorer 1 (Frontend Survey Specialist)  
**Date:** 2026-09-17  
**Investigation Mode:** Strictly Read-Only  

---

## 1. Executive Summary

A comprehensive survey of the existing frontend codebase was performed. The application is currently a prototype built with **React 19.2.0** and **Vite 7.3.1**. It contains severe architectural entanglement, orphaned/dead code, dead packages, duplicate styling, broken user journeys, and mock/broken backend integrations.

Key findings:
- **Dead Packages in `package.json`:** `axios`, `jwt-decode`, `react-pageflip`, `@fortawesome/free-solid-svg-icons`, and `@fortawesome/react-fontawesome` are either deprecated per requirements or never used in the application.
- **Dead Pages & Components:** 11 pages (including 4 admin pages, 4 auth/account pages, 2 reader implementations, and 1 parents page), 2 modals (`CheckoutModal`, `RewardModal`), 2 contexts (`AuthContext`, `CartContext`), and the entire `src/api/` directory (3 files) must be deleted.
- **Dead & Broken UI Elements:** Several buttons and controls do nothing (e.g. `handleScrollTo` in `Navbar`, "تذكرني" checkbox and "نسيت كلمة المرور؟" in `LoginPage`, bookmark button in `ReaderPage`, children input collection in `SignupPage`, "اقرأ المزيد ←" dead link in `ParentsPage`).
- **Currency Inconsistencies:** Multiple currencies are mixed across views: `SAR` in `Dashboard.jsx`, `ر.س` in `stories.js` and `StoryPage.jsx`, `EGP` in `HomePage.jsx` and `RewardModal.jsx`, and `ج.م` in `LibraryPage.jsx` and `CheckoutModal.jsx`.
- **CSS Monolith & Duplicate Definitions:** `App.css` is 1,553 lines long and contains styles for all deleted admin pages, flipbooks, auth forms, and accounts. Cairo font is loaded twice (`index.html` and `index.css`). Shimmer animations are defined across 3 separate files (`App.css`, `LibraryPage.css`, `MyLibraryPage.css`). CSS variables `--bg-primary` and `--yellow` are referenced but never defined. `.hero` styles in `App.css` and `HomePage.css` conflict directly.
- **Refactoring Target:** The clean frontend will contain exactly 3 navigable routes (`/`, `/library`, `/story/:id`), zero auth guards, zero shopping cart, presentation-only modals, a custom `useTheme` hook with `localStorage` persistence, co-located component styling, and a clean fetch-based API layer connected to the .NET 10 backend.

---

## 2. Configuration, Dependencies & Root Files Survey

### 2.1 Dependencies Analysis (`package.json`)

**File Location:** `F:\MK_DM_project\super-kayyem\Super_kayyem_website\package.json`

```json
{
  "dependencies": {
    "@fortawesome/free-solid-svg-icons": "^7.2.0",
    "@fortawesome/react-fontawesome": "^3.2.0",
    "axios": "^1.15.0",
    "jwt-decode": "^4.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-pageflip": "^2.0.3",
    "react-router-dom": "^7.13.1"
  }
}
```

| Package | Status | Usage in Codebase | Recommended Action |
|---|---|---|---|
| `axios` (`^1.15.0`) | **DEAD** | Only imported in `src/api/client.js`. Per R2 and Acceptance Criteria, zero imports of `axios` allowed in final codebase. | Remove dependency from `package.json`; replace backend API calls with native `fetch()`. |
| `jwt-decode` (`^4.0.0`) | **DEAD** | Only imported in `src/context/AuthContext.jsx`. Auth is being removed entirely. | Remove dependency from `package.json`. |
| `react-pageflip` (`^2.0.3`) | **DEAD** | Only imported in `src/pages/FlipbookReader.jsx`. Reader is being deleted. | Remove dependency from `package.json`. |
| `@fortawesome/react-fontawesome` (`^3.2.0`) | **DEAD** | Grep confirms **zero** imports across all `src/` files. Never used. | Remove dependency from `package.json`. |
| `@fortawesome/free-solid-svg-icons` (`^7.2.0`) | **DEAD** | Grep confirms **zero** imports across all `src/` files. Never used. | Remove dependency from `package.json`. |
| `react` (`^19.2.0`) | **KEEP** | Core framework. | Keep. |
| `react-dom` (`^19.2.0`) | **KEEP** | Core framework. | Keep. |
| `react-router-dom` (`^7.13.1`) | **KEEP** | SPA routing. | Keep. |

### 2.2 Vite Configuration (`vite.config.js`)

**File Location:** `F:\MK_DM_project\super-kayyem\Super_kayyem_website\vite.config.js`
- **Lines 8-16:**
  ```javascript
  server: {
    port: 3000,
    allowedHosts: ['unpromptly-unrustic-albert.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:5080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
  ```
- **Observations:**
  - `allowedHosts` contains a stale ngrok temporary tunnel URL (`unpromptly-unrustic-albert.ngrok-free.dev`). This should be removed.
  - Port is set to `3000`.
  - Proxy routes `/api` to `http://localhost:5080`. The new .NET 10 MVC backend will run on port `5080` (or as configured in `launchSettings.json`), ensuring seamless proxying for `GET /api/stories`.

### 2.3 HTML & Font Loading (`index.html`)

**File Location:** `F:\MK_DM_project\super-kayyem\Super_kayyem_website\index.html`
- **Line 2:** `<html lang="ar" dir="rtl">` (Correct root RTL and Arabic language tags).
- **Line 11:** `<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />`
- **Conflict:** Cairo font is loaded here via `<link>` with weights 400, 600, 700, 800, AND loaded again in `src/index.css` (line 8) via `@import url(...)` with weights 400, 600, 800. The `@import` blocks CSS parsing and creates redundant network requests. The `<link>` tag in `index.html` should be kept as the single source of truth.

### 2.4 Stray Root Files to Delete

| File / Folder Path | Type | Reason for Deletion |
|---|---|---|
| `.env` | File | Prototype environment file with legacy endpoints. Forbidden per R2. |
| `.env.production` | File | Prototype production environment file. Forbidden per R2. |
| `New Text Document.txt` | File | Stray leftover text scratch file (133 bytes). |
| `TODO.md` | File | Old prototype todo scratchpad (584 bytes). |
| `super_kayyem.html` | File | Old static HTML mockup/prototype file (32,116 bytes). |
| `SuperKayyem.Backend/` | Directory | Old broken .NET backend. Broken entity models and startup crashes. To be rebuilt as clean .NET 10 project in `server/`. |

---

## 3. Complete Catalog of Dead Code to Delete (Per Requirement R2)

### 3.1 Dead Pages (`src/pages/`)

| File Path | Lines | Key Reasons for Deletion |
|---|---|---|
| `src/pages/LoginPage.jsx` | 101 | Auth system removed. Uses `useAuth()`, dead "تذكرني" checkbox, dead "نسيت كلمة المرور؟" link. |
| `src/pages/SignupPage.jsx` | 193 | Auth system removed. Collects children metadata that is never transmitted. |
| `src/pages/AccountPage.jsx` | 367 | Self-service profile editing & children management calling `/api/account/*`. Auth-dependent. |
| `src/pages/MyLibraryPage.jsx` | 270 | Personal purchased library. Calls `/api/user-library/me`. Reading progress & reviews removed. |
| `src/pages/ParentsPage.jsx` | 79 | Educational article guide. Calls `/api/parent-articles`. Dead "اقرأ المزيد ←" link. |
| `src/pages/FlipbookReader.jsx` | 455 | Dependent on `react-pageflip`. Sample locking overlay, PDF iframe, page flip animations. |
| `src/pages/ReaderPage.jsx` | 188 | Legacy 3D flipbook reader. Completely unrouted in `App.jsx`. Dead bookmark button. |
| `src/pages/admin/AdminLayout.jsx` | 120 | Admin sidebar shell. Guarded by `user?.role === 'Admin'`. Links to deprecated admin routes. |
| `src/pages/admin/Dashboard.jsx` | 249 | Calls `/api/admin/analytics`. Displays SAR revenue charts and mock KPIs. |
| `src/pages/admin/StoryEditor.jsx` | 401 | Admin story creation form. Calls `/api/packages`, `apiMultipart` to `/stories/upload`. Uses SAR currency. |
| `src/pages/admin/AdminParentsArticles.jsx` | 192 | Admin CRUD for articles calling `/api/parent-articles`. |

### 3.2 Dead Components & Modals (`src/components/`)

| File Path | Lines | Key Reasons for Deletion |
|---|---|---|
| `src/components/CheckoutModal.jsx` | 349 | Payment gateway modal (Credit Card, Instapay, Vodafone Cash). Calls `recordPurchase()` and `clearCart()`. |
| `src/components/RewardModal.jsx` | 85 | Payment confirmation receipt upload modal. Calls `/transactions`. Uses `setCurrentPage`. |

### 3.3 Dead Contexts (`src/context/`)

| File Path | Lines | Key Reasons for Deletion |
|---|---|---|
| `src/context/AuthContext.jsx` | 96 | Manages JWT auth token, `jwtDecode`, `localStorage.getItem('token')`, login, register, role checks. |
| `src/context/CartContext.jsx` | 127 | Manages shopping cart state, `addToCart`, `removeFromCart`, `cartTotal`, toast messages. |

### 3.4 Entire API Directory (`src/api/`)

| File Path | Lines | Key Reasons for Deletion |
|---|---|---|
| `src/api/client.js` | 67 | Axios instance with JWT request interceptors (`Bearer ${token}`) and 401 redirect handlers. |
| `src/api/account.js` | 31 | Axios endpoints for `/account/me`, `/account/update`, `/account/children`. |
| `src/api/library.js` | 27 | Axios endpoints for `/user-library/me`, `/user-library/purchase`. |

### 3.5 Dead Component & Page Stylesheets (`src/styles/`)

| File Path | Lines | Associated Dead File |
|---|---|---|
| `src/styles/LoginPage.css` | 139 | `src/pages/LoginPage.jsx` |
| `src/styles/SignupPage.css` | 148 | `src/pages/SignupPage.jsx` |
| `src/styles/AccountPage.css` | 338 | `src/pages/AccountPage.jsx` |
| `src/styles/MyLibraryPage.css` | 274 | `src/pages/MyLibraryPage.jsx` |
| `src/styles/ParentsPage.css` | 108 | `src/pages/ParentsPage.jsx` |
| `src/styles/ReaderPage.css` | 99 | `src/pages/ReaderPage.jsx` (Legacy 3D flipbook) |
| `src/styles/CheckoutModal.css` | 370 | `src/components/CheckoutModal.jsx` |
| `src/styles/AdminParentsArticles.css` | 185 | `src/pages/admin/AdminParentsArticles.jsx` |

### 3.6 Dead Styles Inside `src/App.css`

`App.css` contains massive monolithic sections dedicated solely to deleted pages and features:
- **Section 5 (Auth Pages):** Lines 386–420 (`.auth-container`, `.auth-card`, `.auth-header`, `.auth-footer`).
- **Section 9 (Account Page):** Lines 600–675 (`.child-profile-card`, `.add-child-form`, etc.).
- **Section 10 (3D Arabic Flipbook):** Lines 677–780 (`.book-scene`, `.book-scaler`, `.book-3d`, `.sheet-3d`, `.face-3d`, `.page-content`, `.reader-toolbar`).
- **Section 13 (Admin Layout & Dashboard):** Lines 894–1234 (`.admin-shell`, `.admin-sidebar`, `.admin-nav`, `.admin-topbar`, `.kpi-card`, `.bar-chart`, `.dash-table`, `.dash-skeleton`).
- **Section 14 (Story Editor):** Lines 1236–1416 (`.story-editor`, `.se-form`, `.se-grid`, `.se-rte`, `.drop-zone`).
- **Section 15 (Flipbook Reader):** Lines 1418–1553 (`.fbr-wrapper`, `.fbr-book`, `.fbr-page`, `.fbr-controls`, `.fbr-skeleton`).

**Total Dead CSS in `App.css`:** Approximately 850 lines of dead rules out of 1,553 lines.

---

## 4. Code to Keep, Refactor & Extract

### 4.1 `HomePage.jsx` Survey & Refactor Targets

**File Location:** `src/pages/HomePage.jsx` (134 lines)

#### Code Observations:
1. **Unused / Dead Imports & Props:**
   - Line 7: `import apiClient from '../api/client'`
   - Line 10: `function HomePage({ setCurrentPage, setSelectedStoryId })` (`setCurrentPage` is passed as a prop from `App.jsx` but never used inside `HomePage.jsx`).
2. **Fetched But Never Rendered State:**
   - Lines 13, 17–19:
     ```javascript
     const [banners, setBanners] = useState([])
     // ...
     apiClient.get('/cms/banners').then(res => {
       if (res.success && res.data) setBanners(res.data)
     }).catch(console.error)
     ```
     `banners` is stored in state but is never referenced or rendered anywhere in the JSX.
3. **Dead Backend Call & Section (Parents Corner):**
   - Lines 14, 25–31: Fetches `/parent-articles`.
   - Lines 103–126: Renders "ركن الآباء والمربين" with links to `/parents`. Per R2, `ParentsPage` is deleted. This entire section must be removed from `HomePage`.
4. **Floating Cloud Emojis / Placeholders:**
   - Lines 58–68:
     ```html
     <div className="hero-graphics">
       <div className="img-placeholder floating floating-cloud-1">☁️ جزيرة طافية</div>
       <div className="img-placeholder floating floating-cloud-2">☁️ غيوم ناعمة</div>
       <div className="img-placeholder floating floating-city">✨ مدينة الخيال ✨</div>
     </div>
     ```
     Must be removed per R2.
5. **Inline Story Card & Broken Routing:**
   - Lines 34–37:
     ```javascript
     const handleStoryClick = (story) => {
       if (setSelectedStoryId) setSelectedStoryId(story.id)
       navigate('/story')
     }
     ```
     Navigates to `/story` via parent state prop instead of routing to `/story/:id`.
   - Lines 77–98: Story card markup is embedded directly in `HomePage.jsx` rather than using a reusable `StoryCard` component.
   - Line 95: Displays price as `{story.price} EGP` instead of `ج.م`.

#### Refactor Requirements for HomePage:
- Structure into clean sections: `HeroSection` and `StoriesSection` under `components/sections/`.
- Replace `apiClient` with native `fetch('/api/stories')` or custom clean HTTP helper.
- Render extracted `StoryCard` components.
- Clicking a card opens `StoryDetailsModal` or navigates directly to `/story/:id`.
- Remove all mentions of `banners`, `parentArticles`, `setCurrentPage`, and floating cloud emojis.

---

### 4.2 `Navbar.jsx` Survey & Refactor Targets

**File Location:** `src/components/Navbar.jsx` (339 lines)

#### Code Observations:
1. **Unused Declared Function:**
   - Lines 31–39:
     ```javascript
     const handleScrollTo = (id) => {
       setMenuOpen(false);
       if (currentPath !== '/') {
         navigate('/');
         setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 150);
       } else {
         document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
       }
     };
     ```
     Declared but never called anywhere in the file or app.
2. **Shopping Cart Drawer & Controls:**
   - Line 10: `import { useCart } from '../context/CartContext';`
   - Line 11: `import CheckoutModal from './CheckoutModal';`
   - Lines 20, 22, 25, 43–64: `cartOpen`, `cartDrawerRef`, `useCart()`, scroll lock effect, `handleBuyAll`.
   - Lines 177–187: Desktop cart button and notification badge (`#navbar-cart-btn`).
   - Lines 224–326: Entire cart backdrop and cart drawer DOM (`.cart-backdrop`, `.cart-drawer`, item lists, total calculation).
   - Lines 328–334: `<CheckoutModal items={checkoutItems} ... />`.
3. **Auth & User Navigation Links:**
   - Line 9: `import { useAuth } from '../context/AuthContext';`
   - Line 24: `const { isLoggedIn, user, logout } = useAuth();`
   - Lines 95–103: Link to `/parents`.
   - Lines 106–128: Links to `/my-library` and `/account`.
   - Lines 130–152: Admin links to `/admin` and `/admin/stories/new`.
   - Lines 159–166 & 200–206: "تسجيل دخول" (`/login`), "إنشاء حساب" (`/signup`), and "تسجيل خروج".
   - Lines 189–197: Admin quick action button (`#nav-add-story-btn`).

#### Refactor Requirements for Navbar:
- Simplify to strictly:
  1. Logo (`سوبر قيم`) linking to `/`
  2. Nav link: "الرئيسية" (`/`)
  3. Nav link: "قصصنا" (`/library`)
  4. `ThemeToggle` button
  5. Responsive hamburger menu toggling the links for mobile viewports
- Strip all cart drawer markup, auth hooks, checkout modal references, and dead `handleScrollTo`.

---

### 4.3 `StoryDetailsModal.jsx` Survey & Refactor Targets

**File Location:** `src/components/StoryDetailsModal.jsx` (197 lines)

#### Code Observations:
1. **Cart & Checkout Integrations:**
   - Line 13: `import { useCart } from '../context/CartContext';`
   - Line 14: `import CheckoutModal from './CheckoutModal';`
   - Lines 19, 21–22: `const { addToCart } = useCart();`, `showCheckout`, `addedFeedback`.
   - Lines 46–52: `handleAddToCart` and `handleBuyNow`.
   - Lines 67–78: Embedded `<CheckoutModal />` overlay.
2. **Purchase vs Owned Branching:**
   - Lines 144–189: If `isOwned` is true, renders a green "ابدأ القراءة" button linking to `/reader/:id`. If false, renders a 3-button grid:
     - Button 1: "شراء الآن" (`#story-modal-buy-now`)
     - Button 2: "إضافة للسلة" (`#story-modal-add-to-cart`)
     - Button 3: "تصفح عينة" (`#story-modal-sample`) linking to `/reader/:id?sample=true`
3. **Route Link:**
   - Links to `/reader/:id` (the deleted flipbook reader) instead of `/story/:id`.

#### Refactor Requirements for StoryDetailsModal:
- Convert to **pure presentation component** (`src/components/ui/StoryDetailsModal.jsx`).
- Display story cover image, title, category/value chip, target age group chip, page count chip, description, and price in Egyptian Pounds (`ج.م`).
- Provide an action button: "قراءة القصة" navigating to `/story/${story.id}`, plus the modal close button (`✕` or backdrop click).
- Eliminate all cart, checkout, and sample-mode logic.

---

### 4.4 `StoryPage.jsx` Survey & Refactor Targets

**File Location:** `src/pages/StoryPage.jsx` (90 lines)

#### Code Observations:
1. **Prop-Based Story Selection:**
   - Line 10: `function StoryPage({ setCurrentPage, setShowModal, selectedStoryId, setSelectedStoryId })`
   - If the user reloads `/story`, `selectedStoryId` is null and the page renders `القصة غير موجودة`.
2. **Auth & Purchase Checks:**
   - Lines 7, 12: `import { useAuth } from '../context/AuthContext'`, `const { isLoggedIn } = useAuth()`.
   - Lines 30–34:
     ```javascript
     const handleBuy = () => {
       if (!isLoggedIn) { navigate('/login'); return; }
       setShowModal({ type: 'payment', storyId: story.id, price: story.price })
     }
     ```
   - Lines 74–76:
     ```html
     <button className="btn btn-primary" onClick={handleBuy}>
       شراء القصة ({story.price} ريال)
     </button>
     ```
     Uses forbidden currency string `ريال`!
3. **Flipbook Reader Redirection:**
   - Lines 25–28: `handlePreview` navigates to `/reader/${story.id}` (which is being deleted).

#### Refactor Requirements for StoryPage:
- Change route definition from `/story` to `/story/:id`.
- Extract ID via `const { id } = useParams()`.
- Fetch story details from `/api/stories/${id}` via native fetch.
- Remove all auth checks and purchase flows.
- Render story information, moral value, target age group, price in `ج.م`, description, and the story reading text/pages directly on the page.

---

### 4.5 `Footer.jsx` Survey & Refactor Targets

**File Location:** `src/components/Footer.jsx` (22 lines)
- **Line 14:** Hardcoded copyright year: `© 2024 سوبر قيم. جميع الحقوق محفوظة.`
- **Refactor:** Make dynamic: `{new Date().getFullYear()}` per Acceptance Criteria.

---

### 4.6 `LibraryPage.jsx` Survey & Extraction Targets

**File Location:** `src/pages/LibraryPage.jsx` (217 lines)
- Currently contains inline component definitions:
  - `SkeletonCard` (lines 17–28)
  - `StoryCard` (lines 31–80)
- Currently calls `getMyOwnedStories` from `../api/library`.
- **Refactor:**
  - Extract `StoryCard` to `src/components/ui/StoryCard.jsx`.
  - Extract `SkeletonCard` to `src/components/ui/SkeletonCard.jsx`.
  - Remove all calls to `getMyOwnedStories` and `ownedIds`.
  - Fetch public stories via `GET /api/stories`.
  - Retain the search input and category filter buttons (`الكل`, `التعاون`, `الشجاعة`, `الصدق`, `المسؤولية`, `الصداقة`, `الصبر`).
  - Open presentation-only `StoryDetailsModal` on click.

---

### 4.7 `src/data/stories.js` Survey

**File Location:** `src/data/stories.js` (162 lines)
- Contains 3 stories:
  1. `id: 1`, "باسم ومسبار الأمل" (`التعاون`, `١٥ ر.س`)
  2. `id: 2`, "سر اللؤلؤة الزرقاء" (`الشجاعة`, `١٢ ر.س`)
  3. `id: 3`, "خريطة الشجرة العتيقة" (`الصدق`, `١٨ ر.س`)
- Currently only imported by dead `ReaderPage.jsx`.
- Prices are in Saudi Riyals (`ر.س`).
- **Backend Requirement (R3):** Exactly 6 Arabic stories (one per value: التعاون, الشجاعة, الصدق, المسؤولية, الصداقة, الصبر) will be served by the .NET API (`SeedData.cs` / `StoryService.cs`) in Egyptian Pounds (`ج.م`).

---

## 5. CSS, Design Tokens & Theming Survey

### 5.1 Monolithic `App.css` Breakdown & Extraction Plan

`App.css` (1,553 lines) is currently doing four conflicting things:
1. Defining design tokens (`:root` and `[data-theme="dark"]`).
2. Performing a CSS reset and base element styling.
3. Defining shared utility classes (`.btn`, `.tag`, `.card`, `.grid`, `.section-title`, `.img-placeholder`).
4. Dumping component-specific and page-specific styles for 15 different components into one giant file.

**Extraction Plan for `client/`:**
1. **Design Tokens:** Extract lines 26–65 into `client/src/styles/variables.css`.
2. **Global Base & Reset:** Extract lines 70–100, 107–270 into `client/src/styles/global.css` or clean `App.css`.
3. **Component Styles:** Move styles adjacent to their respective components:
   - `Navbar.css` next to `Navbar.jsx` in `components/layout/`
   - `Footer.css` next to `Footer.jsx` in `components/layout/`
   - `StoryCard.css` next to `StoryCard.jsx` in `components/ui/`
   - `StoryDetailsModal.css` next to `StoryDetailsModal.jsx` in `components/ui/`
   - `ThemeToggle.css` next to `ThemeToggle.jsx` in `components/ui/`
   - `HeroSection.css` next to `HeroSection.jsx` in `components/sections/`
   - `StoriesSection.css` next to `StoriesSection.jsx` in `components/sections/`
   - Page styles: `HomePage.css`, `LibraryPage.css`, `StoryPage.css` co-located with their pages.

### 5.2 Undefined CSS Variables

1. **`--bg-primary`**:
   - Used in `src/styles/AdminParentsArticles.css` (lines 11, 30, 94) and `src/styles/ParentsPage.css` (line 42).
   - Never declared in `:root` or `[data-theme="dark"]`. Both files will be deleted in R2.
2. **`--yellow`**:
   - Used in `src/styles/HomePage.css` line 105: `background: var(--yellow);`.
   - Never declared. The token in `App.css` line 30 is `--primary-yellow`. Any remaining usage must reference `--primary-yellow`.

### 5.3 Conflicting `.hero` Class

- `App.css` (lines 425–442):
  ```css
  .hero {
    background: var(--gradient-hero);
    padding: 100px 0 60px;
    border-radius: 0 0 50px 50px;
    text-align: center;
    overflow: hidden;
    position: relative;
  }
  ```
- `styles/HomePage.css` (lines 9–25):
  ```css
  .hero {
    position: relative;
    overflow: hidden;
    padding: 4rem 0;
    background: var(--bg-secondary);
  }
  ```
- **Conflict:** Different paddings, border radius, and backgrounds (`var(--gradient-hero)` vs `var(--bg-secondary)`).
- **Resolution:** Eliminate duplicate `.hero` from global `App.css`, maintain unified styled `HeroSection` with pastel gradient hero (`var(--gradient-hero)`).

### 5.4 Duplicate Shimmer Keyframes

Shimmer animations are defined redundantly in 3 files:
1. `App.css` (line 1222):
   ```css
   @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
   ```
2. `src/styles/LibraryPage.css` (line 6):
   ```css
   @keyframes libSkeletonShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
   ```
3. `src/styles/MyLibraryPage.css` (line 6):
   ```css
   @keyframes mlShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
   ```
- **Resolution:** Define a single `@keyframes shimmer` in `variables.css` or `global.css` and share it across all skeleton loaders.

### 5.5 Dark Mode & Custom `useTheme` Hook

- **Current State:**
  - In `App.jsx` lines 40 & 73–75: `const [isDark, setIsDark] = useState(false);`
  - Applies `document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');`
  - **Issue:** Does NOT persist preference to `localStorage`. A page reload resets the theme to light.
- **Requirement (R1 & R5):**
  - Create `client/src/hooks/useTheme.js` exporting `useTheme()`.
  - Initial state from `localStorage.getItem('theme')` (falling back to system preference `prefers-color-scheme`).
  - Sets `data-theme` attribute on `document.documentElement` or `document.body`.
  - Persists changes to `localStorage.setItem('theme', theme)`.

---

## 6. Audit of Forbidden Patterns & Acceptance Criteria Checklist

| Pattern / String | Current Occurrences in Codebase | Action for Implementation Agent |
|---|---|---|
| `axios` | `package.json:15`, `src/api/client.js:1,10,17,18,20` | Remove dependency and `src/api/client.js`. Use native `fetch`. |
| `jwt-decode` / `jwtDecode` | `package.json:16`, `src/context/AuthContext.jsx:2,20,43,60` | Remove dependency and `src/context/AuthContext.jsx`. |
| `react-pageflip` | `package.json:19`, `src/pages/FlipbookReader.jsx:9,22,267` | Remove dependency and `src/pages/FlipbookReader.jsx`. |
| `localStorage.getItem('token')` | `src/api/client.js:28`, `src/context/AuthContext.jsx:17` | Will be completely eliminated when `api/` and `AuthContext` are deleted. |
| `Bearer` | `src/api/client.js:29` | Will be completely eliminated with `api/client.js`. |
| `useAuth` | `src/context/AuthContext.jsx:7`, `src/App.jsx:7,43`, `src/pages/StoryPage.jsx:7,12`, `src/pages/LoginPage.jsx:6,11`, `src/pages/admin/AdminLayout.jsx:8,22`, `src/pages/SignupPage.jsx:6,11`, `src/components/Navbar.jsx:9,24` | Eliminate all imports and hook usages. |
| `useCart` | `src/context/CartContext.jsx:120,122`, `src/components/CheckoutModal.jsx:9,166`, `src/components/Navbar.jsx:10,25`, `src/components/StoryDetailsModal.jsx:13,19` | Eliminate all imports and hook usages. |
| `CartContext` | `src/context/CartContext.jsx:7,52,105,122,126`, `src/App.jsx:8,157` | Eliminate file and provider wrapping. |
| `AuthContext` | `src/context/AuthContext.jsx:5,11,91`, `src/App.jsx:7,156` | Eliminate file and provider wrapping. |
| `handleScrollTo` | `src/components/Navbar.jsx:31` | Delete function declaration. |
| `setCurrentPage` | `App.jsx:54,90,94,102,103,108,144`, `RewardModal.jsx:8,20`, `LibraryPage.jsx:83`, `FlipbookReader.jsx:194,268`, `HomePage.jsx:10`, `ReaderPage.jsx:8,15`, `StoryPage.jsx:10` | Delete function and all passed props. Rely solely on React Router `useNavigate` / `<Link>`. |
| `ريال` | `src/pages/admin/StoryEditor.jsx:346`, `src/pages/StoryPage.jsx:75` | Delete StoryEditor; replace with `ج.م` in StoryPage. |
| `SAR` | `src/pages/admin/Dashboard.jsx:21` | Delete Dashboard file. |
| `ر.س` | `src/data/stories.js:14,92,130` | Replace with `ج.م` when stories are served from .NET backend. |
| `/api/auth` | `src/context/AuthContext.jsx:40,57` | Deleted with AuthContext. |
| `/api/account` | `src/api/account.js:12,18,24,30`, `src/pages/AccountPage.jsx:3,6` | Deleted with account files. |
| `/api/user-library` | `src/api/library.js:15,26`, `src/pages/MyLibraryPage.jsx:4` | Deleted with library.js and MyLibraryPage. |
| `/api/transactions` | `src/components/RewardModal.jsx:27`, `src/pages/admin/AdminLayout.jsx:15` | Deleted with RewardModal and AdminLayout. |
| `/api/admin` | `src/pages/admin/Dashboard.jsx:96` | Deleted with admin pages. |
| `/api/parent-articles`| `src/pages/HomePage.jsx:25`, `src/pages/admin/AdminParentsArticles.jsx:25,65,67,80`, `src/pages/ParentsPage.jsx:18` | Remove from HomePage, delete other files. |
| `/api/cms` | `src/pages/HomePage.jsx:17`, `src/pages/admin/AdminLayout.jsx:17` | Remove from HomePage, delete AdminLayout. |
| `/api/packages` | `src/pages/admin/StoryEditor.jsx:129` | Deleted with StoryEditor. |

---

## 7. Recommended Target Frontend Architecture

Per requirements R1, R2, and R5, the reconstructed React client should be structured as follows in `client/`:

```
client/
├── index.html                     # Clean Cairo font import via <link>, lang="ar", dir="rtl"
├── package.json                   # Clean dependencies: react, react-dom, react-router-dom
├── vite.config.js                 # Port 3000, proxy /api -> http://localhost:5080
└── src/
    ├── main.jsx                   # Mounts <App /> inside StrictMode
    ├── App.jsx                    # BrowserRouter, useTheme, Navbar, Routes, Footer
    ├── App.css                    # App shell layout
    ├── hooks/
    │   └── useTheme.js            # Custom hook: dark/light theme with localStorage persistence
    ├── styles/
    │   ├── variables.css          # Design tokens (:root, [data-theme="dark"], animations)
    │   └── global.css             # Global reset and typography
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx         # Simplified: Logo, الرئيسية, قصصنا, ThemeToggle, Mobile hamburger
    │   │   ├── Navbar.css
    │   │   ├── Footer.jsx         # Dynamic year copyright
    │   │   └── Footer.css
    │   ├── ui/
    │   │   ├── StoryCard.jsx      # Reusable story card (cover, title, category, age, price)
    │   │   ├── StoryCard.css
    │   │   ├── SkeletonCard.jsx   # Reusable loading skeleton with single shimmer animation
    │   │   ├── SkeletonCard.css
    │   │   ├── StoryDetailsModal.jsx # Presentation-only dialog with story details
    │   │   ├── StoryDetailsModal.css
    │   │   ├── ThemeToggle.jsx    # Accessible theme toggle button
    │   │   └── ThemeToggle.css
    │   └── sections/
    │       ├── HeroSection.jsx    # Clean hero section with title, subtitle, CTA button
    │       ├── HeroSection.css
    │       ├── StoriesSection.jsx # Featured stories grid with fetch from /api/stories
    │       └── StoriesSection.css
    └── pages/
        ├── HomePage.jsx           # Renders HeroSection + StoriesSection
        ├── HomePage.css
        ├── LibraryPage.jsx        # Public story store with search & category filters
        ├── LibraryPage.css
        ├── StoryPage.jsx          # /story/:id param-based story view
        └── StoryPage.css
```

---
*Report compiled by Explorer 1 (Frontend Survey Specialist). All findings verified against current source files.*
