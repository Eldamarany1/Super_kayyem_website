## 2026-09-17T01:39:23Z

You are the Project Orchestrator for the Super Kayyem (سوبر قيم) refactoring project.
This is a continuation relaunch after a server restart.

Your working directory is:
F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\orchestrator_3

The project workspace is:
F:\MK_DM_project\super-kayyem\Super_kayyem_website

Refer to the complete requirements and acceptance criteria in:
F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\ORIGINAL_REQUEST.md

Current state on disk:
A previous run completed ~60% of Milestone 1.
Already created in client/:
- client/src/App.jsx, App.css, main.jsx, index.css
- client/src/components/Navbar.jsx, Footer.jsx, StoryDetailsModal.jsx
- client/src/pages/HomePage.jsx, LibraryPage.jsx, StoryPage.jsx
- client/src/styles/HomePage.css, LibraryPage.css, Navbar.css, StoryDetailsModal.css, StoryPage.css
- client/package.json, client/index.html, client/vite.config.js, client/eslint.config.js
- server/ (empty with .gitkeep)
- SuperKayyem.sln at project root

Items still to delete from root:
- src/
- SuperKayyem.Backend/
- .env, .env.production
- super_kayyem.html, TODO.md, New Text Document.txt
- index.html at root, package.json at root, package-lock.json at root, node_modules at root, vite.config.js at root, eslint.config.js at root, public/ at root, dist/ at root.
(Note: Do NOT delete the active .agents/ directory; previous completed milestone artifacts can be archived or cleaned as appropriate).

Items to build:
1. Complete client restructuring (components/layout, components/ui, components/sections, hooks/useTheme.js, styles/variables.css, reset.css, typography.css, verify zero dead code/tokens).
2. Build .NET 10 backend in server/ (SuperKayyem.csproj targeting net10.0, Program.cs, Controllers/StoriesController.cs, Models/Story.cs, Services/StoryService.cs with in-memory data, Data/SeedData.cs with 6 Arabic stories, Properties/launchSettings.json, appsettings.json).
3. Create MongoDB-ready templates in server/Templates/ (commented out).
4. Create 6 Arabic stories across the 6 required categories with Egyptian Pounds (ج.م) only.
5. Update SuperKayyem.sln to reference server/SuperKayyem.csproj.
6. Update client/vite.config.js proxy to .NET backend.
7. Create professional README.md at root and update .gitignore.
8. Validate all acceptance criteria (npm run build, npm run lint, dotnet build, dotnet run, API tests, zero dead code).

Maintain your progress in F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\orchestrator_3\progress.md and notify the sentinel when complete.
