# Project: Super Kayyem (سوبر قيم) Full-Stack Refactoring

## Architecture
Super Kayyem is an Arabic children's edutainment storytelling web platform showcasing moral stories.
The architecture is refactored from a tangled prototype into a clean, modern, production-ready full-stack application:
- **Root**: `SuperKayyem.sln` linking the backend project, with isolated `client/` and `server/` directories.
- **Client (`client/`)**: React 19 + Vite 7 SPA using React Router DOM.
  - Subdirectories: `src/components/layout/`, `src/components/ui/`, `src/components/sections/`, `src/pages/`, `src/hooks/`, `src/styles/`.
  - Design tokens in `src/styles/variables.css`, Cairo font, full RTL layout, custom `useTheme` hook with localStorage persistence.
  - Opaque-box interaction via REST API calls using native browser `fetch` (zero axios/jwt-decode).
- **Server (`server/`)**: ASP.NET Core (.NET 10 MVC / Web API) running on `http://localhost:5080`.
  - In-memory static data service delivering 6 Arabic stories (zero database dependency on startup).
  - Clean separation: `Controllers/`, `Models/`, `Services/`, `Data/`.
  - Inactive scaffolding: `server/Templates/` containing commented-out MongoDB repository & Auth services with a clear activation `README.md`.
- **Data Flow**:
  - `client` calls `/api/stories` and `/api/stories/{id}`.
  - Vite dev server proxies `/api` to `http://localhost:5080`.
  - In production / container, .NET API serves requests directly.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Root Restructuring & Cleanup | Move React app to `client/`, create `server/`, create root `SuperKayyem.sln`, delete `SuperKayyem.Backend/` and root debris | M1 | Survey (Explorer 1 & 2) |
| 2 | Dead Code & Dependency Removal | Drop axios, jwt-decode, react-pageflip, fortawesome; delete 11 pages, 2 modals, 2 contexts, `src/api/`, 8 dead CSS files, and ~850 lines of dead CSS | M1 | Survey (Explorer 1) |
| 3 | .NET 10 Web API Setup | Create `server/SuperKayyem.csproj` targeting `net10.0`, `Program.cs` with CORS, JSON options, and DI | M2 | Survey (Explorer 2) |
| 4 | In-Memory Story Data Model & Seed | Implement `Story.cs` model and `SeedData.cs` with 6 complete Arabic stories across the 6 moral genres with EGP (ج.م) prices | M2 | Survey (Explorer 2 & 3) |
| 5 | Story Service & Controller | Implement `IStoryService`, `StoryService`, and `StoriesController` with `GET /api/stories` and `GET /api/stories/{id}` (returning 404 for invalid ID) | M2 | Survey (Explorer 2) |
| 6 | Inactive MongoDB & Auth Scaffolding | Create `server/Templates/` with inactive repository pattern, MongoDbContext, AuthService, and `README.md`; configure `appsettings.json` placeholder | M2 | Survey (Explorer 2) |
| 7 | Frontend Component Architecture | Reorganize components into `layout/` (Navbar, Footer), `ui/` (StoryCard, StoryDetailsModal, ThemeToggle, SkeletonCard), `sections/` (HeroSection, StoriesSection) | M3 | Survey (Explorer 1) |
| 8 | CSS Variables & Design Tokens | Extract design tokens into `src/styles/variables.css`, fix undefined variables (`--bg-primary`, `--yellow`), fix `.hero` class conflicts, eliminate duplicate keyframes | M3 | Survey (Explorer 1) |
| 9 | Typography & RTL | Single Cairo font import, ensure `dir="rtl"` and `lang="ar"` on `<html>`, Arabic typography styling throughout | M3 | Survey (Explorer 1) |
| 10 | Theming & `useTheme` Hook | Create `src/hooks/useTheme.js` managing light/dark mode with localStorage persistence; clean ThemeToggle component | M3 | Survey (Explorer 1) |
| 11 | Clean Navbar & Footer | Navbar with only logo, الرئيسية, قصصنا, theme toggle, mobile toggle (zero cart/auth/admin links); Footer with dynamic copyright year | M3 | Survey (Explorer 1) |
| 12 | Public Library & Story Details Modal | `LibraryPage` (`/library`) displaying all 6 stories with search & category filter; presentation-only `StoryDetailsModal` without cart/purchase buttons | M3 | Survey (Explorer 1 & 3) |
| 13 | Story Page with URL Routing | `StoryPage` routed at `/story/:id` using `useParams`, clean reading view without auth guard or purchase modal | M3 | Survey (Explorer 1) |
| 14 | Currency Unification | Eliminate all `SAR`, `ريال`, `ر.س`, and `EGP` occurrences; display all prices uniformly as Egyptian Pounds (`ج.م`) | M3 | Survey (Explorer 3) |
| 15 | Build & Lint Verification | Verify `client/` `npm run build` and `npm run lint`, and `server/` `dotnet build` pass with 0 errors | M4 | Survey (Explorer 1 & 2) |
| 16 | API & Runtime Verification | Verify `dotnet run`, test `GET /api/stories`, `GET /api/stories/{id}`, and 404 behavior, verify Vite proxy | M4 | Survey (Explorer 2) |
| 17 | Dead Code & Audit Verification | Verify zero occurrences of forbidden strings/imports via grep and run Forensic Auditor for integrity | M4 | Survey (Explorer 1, 2, 3) |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Workspace Restructuring & Dead Code Elimination | Move frontend to `client/`, delete `SuperKayyem.Backend/`, root debris, dead pages/components/contexts/api/styles, remove unused npm dependencies, create `SuperKayyem.sln` | None | PLANNED |
| 2 | .NET 10 MVC Backend & Scaffolding | Create .NET 10 project in `server/`, implement Models, Services, SeedData (6 Arabic stories), Controllers (`/api/stories`), inactive `server/Templates/`, `appsettings.json` | M1 | PLANNED |
| 3 | React 19 Frontend Refactoring & Theming | Restructure `client/src/components/`, `useTheme` hook, `variables.css`, clean Navbar, Footer, HomePage, LibraryPage, StoryPage (`/story/:id`), StoryDetailsModal, currency unification to `ج.م` | M1, M2 | PLANNED |
| 4 | Verification, Build, Lint & Acceptance Criteria | Execute `npm run build`, `npm run lint`, `dotnet build`, API endpoint verification, dead code grep audit, and forensic integrity audit | M1, M2, M3 | PLANNED |

---

## Interface Contracts

### Frontend ↔ Backend REST API Contract
- **Base URL**: `/api` (proxied by Vite to `http://localhost:5080/api`)
- **Endpoints**:
  - `GET /api/stories`
    - Response: HTTP 200 OK
    - Body: JSON array of 6 Story objects
  - `GET /api/stories/{id}`
    - Parameters: `id` (int)
    - Response: HTTP 200 OK with Story object if found; HTTP 404 Not Found (`{ "error": "Story not found" }`) if not found
- **Story Schema**:
  ```json
  {
    "id": 1,
    "title": "باسم ومسبار الأمل",
    "slug": "basem-hope-probe",
    "category": "التعاون",
    "targetAgeGroup": "6-8",
    "description": "قصة شيقة عن باسم وأصدقائه يتعاونون لبناء مجسم لمسبار الفضاء. يتعلم الأطفال من خلالها أن روح الفريق تصنع المعجزات وتتجاوز كل التحديات. رحلة معرفية ملهمة تأخذ القارئ الصغير إلى آفاق السماء الواسعة.",
    "price": 35.0,
    "rating": 4.9,
    "coverImage": "/images/covers/story1.svg",
    "pageCount": 10
  }
  ```
  *(Compatible aliases in C# model: `valueLearned` mapped to `category`, `coverImageUrl` mapped to `coverImage`)*

### 6 Arabic Stories Inventory (One per Genre)
1. **التعاون (Cooperation)**: باسم ومسبار الأمل (id: 1, age: 6-8, price: 35.00 ج.م, rating: 4.9, pages: 10)
2. **الشجاعة (Courage)**: سر اللؤلؤة الزرقاء (id: 2, age: 4-6, price: 40.00 ج.م, rating: 4.8, pages: 8)
3. **الصدق (Honesty)**: خريطة الشجرة العتيقة (id: 3, age: 8-10, price: 45.00 ج.م, rating: 4.7, pages: 12)
4. **المسؤولية (Responsibility)**: حارس الواحة الصغير (id: 4, age: 6-8, price: 35.00 ج.م, rating: 4.9, pages: 10)
5. **الصداقة (Friendship)**: جسر النجوم الدافئ (id: 5, age: 4-6, price: 30.00 ج.م, rating: 4.8, pages: 8)
6. **الصبر (Patience)**: بذرة الحكمة العجيبة (id: 6, age: 8-10, price: 50.00 ج.م, rating: 4.6, pages: 12)

---

## Code Layout

```
Super_kayyem_website/
├── SuperKayyem.sln
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── public/
│   │   └── images/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── hooks/
│       │   └── useTheme.js
│       ├── styles/
│       │   ├── variables.css
│       │   ├── App.css
│       │   ├── Navbar.css
│       │   ├── Footer.css
│       │   ├── HomePage.css
│       │   ├── LibraryPage.css
│       │   ├── StoryPage.css
│       │   ├── StoryCard.css
│       │   ├── StoryDetailsModal.css
│       │   └── ThemeToggle.css
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── Footer.jsx
│       │   ├── ui/
│       │   │   ├── StoryCard.jsx
│       │   │   ├── StoryDetailsModal.jsx
│       │   │   ├── ThemeToggle.jsx
│       │   │   └── SkeletonCard.jsx
│       │   └── sections/
│       │       ├── HeroSection.jsx
│       │       └── StoriesSection.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LibraryPage.jsx
│       │   └── StoryPage.jsx
│       └── data/
│           └── stories.js (fallback static data matching backend seed)
└── server/
    ├── SuperKayyem.csproj
    ├── Program.cs
    ├── appsettings.json
    ├── appsettings.Development.json
    ├── Properties/
    │   └── launchSettings.json
    ├── Controllers/
    │   └── StoriesController.cs
    ├── Models/
    │   └── Story.cs
    ├── Services/
    │   ├── IStoryService.cs
    │   └── StoryService.cs
    ├── Data/
    │   └── SeedData.cs
    └── Templates/
        ├── README.md
        ├── IRepository.cs
        ├── MongoRepository.cs
        ├── MongoDbContext.cs
        ├── IAuthService.cs
        └── AuthService.cs
```
