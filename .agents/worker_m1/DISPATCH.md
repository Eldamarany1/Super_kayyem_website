## 2026-09-16T22:03:39Z

<USER_REQUEST>
You are Worker M1 (Workspace Restructuring & Dead Code Elimination Specialist).
Your working directory is F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\worker_m1

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You MUST read F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\ORIGINAL_REQUEST.md and F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\orchestrator_2\PROJECT.md before doing anything else.
Also consult the survey findings in:
- F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_1\handoff.md
- F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_2\handoff.md

Your mission is Milestone 1: Workspace restructuring and complete dead code removal.
Exclusively owned targets: Project root reorganization, client/ directory setup, server/ directory creation, SuperKayyem.sln, and deleting all dead code and old backend.

Detailed Tasks:
1. Workspace Restructuring:
   - Create client/ directory if not already existing.
   - Move frontend assets and files to client/ (e.g. src/, public/, index.html, vite.config.js, package.json, package-lock.json, eslint.config.js).
   - Create server/ directory at project root for the upcoming .NET 10 backend.
   - Create SuperKayyem.sln at project root (a valid visual studio / dotnet solution file).
2. Delete Dead Code & Legacy Directories:
   - Delete entire SuperKayyem.Backend/ directory (the old broken backend).
   - Delete root debris: super_kayyem.html, "New Text Document.txt", TODO.md, .env, .env.production.
   - In client/package.json: remove dead dependencies (axios, jwt-decode, react-pageflip, @fortawesome/free-solid-svg-icons, @fortawesome/react-fontawesome). Keep react, react-dom, react-router-dom, lucide-react, vite, @vitejs/plugin-react, eslint, etc.
   - In client/src/pages/: delete LoginPage.jsx, SignupPage.jsx, AccountPage.jsx, MyLibraryPage.jsx, ParentsPage.jsx, FlipbookReader.jsx, ReaderPage.jsx, and the entire admin/ subdirectory (AdminLayout.jsx, Dashboard.jsx, StoryEditor.jsx, AdminParentsArticles.jsx).
   - In client/src/components/: delete CheckoutModal.jsx, RewardModal.jsx.
   - In client/src/context/: delete AuthContext.jsx, CartContext.jsx (and remove context/ directory if empty).
   - In client/src/api/: delete the entire api/ directory (client.js, account.js, library.js).
   - In client/src/styles/: delete AccountPage.css, AdminParentsArticles.css, CheckoutModal.css, LoginPage.css, MyLibraryPage.css, ParentsPage.css, ReaderPage.css, SignupPage.css.
3. Verification:
   - Verify that all deleted files no longer exist.
   - Verify root contains client/, server/, and SuperKayyem.sln.
   - Document all actions, file moves, and deletions in your report.
4. Deliverables:
   - Create BRIEFING.md and progress.md in your working directory.
   - Write comprehensive handoff report to F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\worker_m1\handoff.md following the 5-component format (Observation, Logic Chain, Caveats, Conclusion, Verification Method).
   - Send completion message to parent.
</USER_REQUEST>
