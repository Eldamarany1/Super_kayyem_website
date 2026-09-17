# BRIEFING — 2026-09-17T02:25:17Z

## Mission
Restructure and implement the complete React 19 frontend in client/ with modular architecture, Cairo typography, RTL support, dark/light theme, and zero dead code.

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\worker_m3_frontend
- Original parent: 26420394-9c67-4e74-8355-a352847811c1
- Milestone: Milestone 3 (React 19 Frontend Restructuring & Theming)

## 🔒 Key Constraints
- Only modify files in `client/` and `.agents/worker_m3_frontend/`. Do NOT modify `server/` or `.agents/` outside working directory.
- No dead code: 0 occurrences of axios, jwt-decode, react-pageflip, useAuth, useCart, CartContext, AuthContext, handleScrollTo, setCurrentPage.
- Currency must be strictly Egyptian Pounds (ج.م) throughout. Zero occurrences of SAR, ريال, or ر.س.
- Exactly 3 navigable routes: `/`, `/library`, `/story/:id`.
- StoryDetailsModal must have no purchase/cart buttons; only "اقرأ القصة الآن" linking to `/story/:id`.
- Dark/light mode theme toggle using `useTheme` hook with localStorage persistence and `data-theme` attribute on documentElement.
- `npm run lint` and `npm run build` must pass with 0 errors.
- DO NOT cheat, fabricate, or hardcode fake results.

## Current Parent
- Conversation ID: 26420394-9c67-4e74-8355-a352847811c1
- Updated: 2026-09-17T02:25:17Z

## Task Summary
- **What to build**: Full React 19 SPA with layout/ui/sections components, styles, Cairo font, useTheme, fallback data, Vite proxy.
- **Success criteria**: All acceptance criteria in DISPATCH.md met; lint & build pass with 0 errors.
- **Interface contracts**: `.agents/orchestrator_3/PROJECT.md`
- **Code layout**: `.agents/orchestrator_3/PROJECT.md § Code Layout`

## Key Decisions Made
- Component separation into layout/ (Navbar, Footer), ui/ (StoryCard, StoryDetailsModal, ThemeToggle, SkeletonCard), sections/ (HeroSection, StoriesSection).
- CSS extraction into variables.css, reset.css, typography.css, and component-specific css.

## Artifact Index
- `.agents/worker_m3_frontend/DISPATCH.md` — assignment & instructions
- `.agents/worker_m3_frontend/BRIEFING.md` — situational awareness
- `.agents/worker_m3_frontend/progress.md` — heartbeat & step tracking
- `.agents/worker_m3_frontend/handoff.md` — final completion report

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [TBD]
- **Pending issues**: None

## Quality Status
- **Build/test result**: [TBD]
- **Lint status**: [TBD]
- **Tests added/modified**: [TBD]

## Loaded Skills
- None applicable
