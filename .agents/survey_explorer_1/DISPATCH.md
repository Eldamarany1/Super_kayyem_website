## 2026-09-16T20:26:49Z
You are the Frontend & Dead Code Explorer for the Super Kayyem full-stack refactoring project.
Your Working Directory: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\survey_explorer_1
Orchestrator Conversation ID: d6113121-51cc-4a52-89c0-0ea5a3e37647

MANDATORY: You MUST read F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\ORIGINAL_REQUEST.md before starting work.

Your task:
1. Investigate the current frontend codebase at F:\MK_DM_project\super-kayyem\Super_kayyem_website\src, package.json, vite.config.js, index.html, public/.
2. Audit all dependencies in package.json: identify packages to remove (axios, jwt-decode, react-pageflip) and verify versions (React 19, Vite 7, etc.).
3. Enumerate all dead files, pages, modals, contexts, styles, and root clutter to delete per Requirement R2:
   - Root files: .env, .env.production, super_kayyem.html, New Text Document.txt, TODO.md
   - Pages to delete: LoginPage, SignupPage, AccountPage, MyLibraryPage, ParentsPage, FlipbookReader, ReaderPage, Dashboard, StoryEditor, AdminLayout, AdminParentsArticles
   - Components/modals to delete: CheckoutModal, RewardModal, CartDrawer, etc.
   - Contexts to delete: AuthContext, CartContext
   - API directory to delete: src/api/
   - CSS files to delete: LoginPage.css, SignupPage.css, AccountPage.css, MyLibraryPage.css, AdminParentsArticles.css, CheckoutModal.css, legacy 3D flipbook styles
4. Audit dead code within retained components:
   - Navbar: remove cart button/drawer/badge, auth links, admin links, dead handleScrollTo
   - HomePage: remove apiClient calls, banners state, floating emoji cloud placeholders, setCurrentPage prop
   - StoryDetailsModal: remove purchase/cart buttons, CartContext, CheckoutModal
   - StoryPage: change from prop-based selectedStoryId to URL param /story/:id, remove auth checks, purchase flow, RewardModal
5. Audit CSS architecture:
   - App.css monolithic styles (~1,550 lines): identify design tokens to extract to variables.css
   - Check duplicate font imports (Cairo), duplicate shimmer keyframes, undefined CSS variables (--bg-primary, --yellow), conflicting .hero classes
   - Map out co-located component CSS structure
6. Audit existing stories.js to see what story data currently exists and what needs to be replaced with the 6 complete Arabic moral stories.
7. Write your findings and recommended file layout for client/ to F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\survey_explorer_1\handoff.md.
8. Send a message to orchestrator d6113121-51cc-4a52-89c0-0ea5a3e37647 with a concise summary and pointer to your handoff.md.
