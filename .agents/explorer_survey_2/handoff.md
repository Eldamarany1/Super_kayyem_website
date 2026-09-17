# Handoff Report — Explorer 2: Backend & Environment Survey

**Author**: Explorer 2 (Backend & Environment Survey Specialist)  
**Date**: 2026-09-17  
**Working Directory**: `F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_2`  
**Parent Agent**: `f9d9e4e2-9b6d-4b30-9f5b-053dfd1e0d78` (parent)  
**Detailed Report**: `F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_2\survey_report.md`

---

## 1. Observation

1. **Root Directory Structure**:
   - Project root (`F:\MK_DM_project\super-kayyem\Super_kayyem_website`) currently mixes the React frontend and backend together.
   - Identified root files/directories:
     - `SuperKayyem.Backend/` (old 4-project ASP.NET Core solution)
     - `super_kayyem.html` (32,116 bytes legacy prototype)
     - `New Text Document.txt` (133 bytes scratch note: `"make pages files to add the pages content to it like..."`)
     - `TODO.md` (584 bytes prototype status note)
     - `.env` (94 bytes: `"VITE_API_BASE_URL=/api"`)
     - `.env.production` (126 bytes)
     - `vite.config.js` (411 bytes, proxies `/api` to `http://localhost:5080`)
     - `package.json` (859 bytes, React 19.2.0, Vite 7.3.1, Axios 1.15.0, jwt-decode 4.0.0, react-pageflip 2.0.3)

2. **Old Backend Failure Analysis**:
   - File: `SuperKayyem.Backend/src/SuperKayyem.API/Program.cs` lines 144–163:
     ```csharp
     using (var scope = app.Services.CreateScope())
     {
         var db = scope.ServiceProvider.GetRequiredService<SuperKayyem.Infrastructure.Persistence.MongoDbContext>();
         var adminExists = db.Users.Find(u => u.Role == SuperKayyem.Domain.Enums.UserRole.Admin).Any();
         if (!adminExists) { ... }
     }
     ```
   - On startup, the application executes a synchronous query against MongoDB at `mongodb://localhost:27017`. Because no MongoDB instance is listening, it throws an unhandled connection exception, triggering lines 167–171:
     ```csharp
     catch (Exception ex) when (ex is not HostAbortedException)
     {
         Log.Fatal(ex, "SuperKayyem API failed to start.");
         throw;
     }
     ```
   - The old backend comprises 4 projects (`SuperKayyem.API`, `SuperKayyem.Application`, `SuperKayyem.Domain`, `SuperKayyem.Infrastructure`) and 12 controllers (`AccountController`, `AdminController`, `AuthController`, `CmsController`, `CustomerController`, `LibraryController`, `PackagesController`, `ParentArticlesController`, `ReviewsController`, `StoriesController`, `TransactionsController`, `UserLibraryController`).

3. **Developer Environment Verification**:
   - In `SuperKayyem.Backend/src/SuperKayyem.API/obj/project.assets.json`:
     - Lines 3–4: `"targets": { "net10.0": { ... } }`
     - Lines 31–32: `"Microsoft.AspNetCore.Authentication.JwtBearer/10.0.5"`
     - Lines 1300–1350: Framework assemblies all resolve to `10.0.32767`
     - Confirms **.NET 10 (`net10.0`)** runtime and SDK are installed.
   - In `package.json` and `package-lock.json`:
     - `"lockfileVersion": 3` (npm 9/10 format)
     - React `19.2.0`, Vite `7.3.1`, ESLint `9.39.1`.

4. **Dead Code & Inconsistent Currency Audit**:
   - Currency references to Saudi Riyal (`ريال`, `ر.س`, `SAR`):
     - `src/pages/StoryPage.jsx:75`: `"شراء القصة ({story.price} ريال)"`
     - `src/pages/admin/StoryEditor.jsx:346`: `"<label ...>السعر (ريال)</label>"`
     - `src/data/stories.js:14, 92, 130`: `'١٥ ر.س'`, `'١٢ ر.س'`, `'١٨ ر.س'`
     - `src/pages/admin/Dashboard.jsx:21`: `currency: 'SAR'`
   - Dead function `handleScrollTo`:
     - `src/components/Navbar.jsx:31`: `const handleScrollTo = (id) => { ... }` (defined but never invoked).
   - Prop drilling `setCurrentPage`:
     - `src/App.jsx:54-65`, passed into `HomePage`, `LibraryPage`, `StoryPage`, `LoginPage`, `SignupPage`, `RewardModal`, `ReaderPage`.
   - Banners fetched but never rendered:
     - `src/pages/HomePage.jsx:13, 17–19`: `apiClient.get('/cms/banners').then(...)` populates `banners` state, which is never rendered in JSX.
   - Legacy 3D flipbook CSS:
     - `src/App.css:681–760`: `.book-scene`, `.book-scaler`, `.book-3d`, `.sheet-3d`, `.face-3d`.
   - Undefined CSS variables:
     - `--bg-primary` used in `AdminParentsArticles.css:11,30,94` and `ParentsPage.css:42`.
     - `--yellow` used in `HomePage.css:105`.
   - Duplicate Shimmer animations:
     - `src/App.css:1222`: `@keyframes shimmer`
     - `src/styles/LibraryPage.css:6`: `@keyframes libSkeletonShimmer`
   - Duplicate Cairo font:
     - `index.html:11`: `<link href="...family=Cairo..."/>`
     - `src/index.css:8`: `@import url('...family=Cairo...');`

---

## 2. Logic Chain

1. **Step 1 (Root Restructuring Necessity)**:
   - *Observation 1* shows that root-level files (`package.json`, `src/`, `super_kayyem.html`, `SuperKayyem.Backend/`) conflate frontend and backend concerns.
   - *Logic*: To satisfy Requirement R1 ("clean `client/` and `server/` architecture with proper separation of concerns; root `SuperKayyem.sln`"), all frontend files must move to `client/`, all obsolete root files (`super_kayyem.html`, `New Text Document.txt`, `TODO.md`, `.env`, `.env.production`) must be deleted, and a new root `SuperKayyem.sln` referencing `server/SuperKayyem.csproj` must be created.

2. **Step 2 (Old Backend Disposal & Clean Rebuild)**:
   - *Observation 2* demonstrates that `SuperKayyem.Backend` contains 12 controllers and crashes on startup because of synchronous MongoDB connection attempts and complex infrastructure dependencies.
   - *Logic*: Attempting to patch the old backend violates the explicit prompt mandate ("do NOT attempt to fix; delete entirely and rebuild as a clean .NET 10 project"). Rebuilding a single ASP.NET Core project in `server/SuperKayyem.csproj` with in-memory `StoryService` ensures instant, zero-dependency startup.

3. **Step 3 (Toolchain Compatibility)**:
   - *Observation 3* confirms from restored build assets in `project.assets.json` that `net10.0` with `Microsoft.AspNetCore.App 10.0.*` compiles and restores on this system.
   - *Logic*: The new backend in `server/SuperKayyem.csproj` should target `<TargetFramework>net10.0</TargetFramework>` without external package dependencies for the active runtime.

4. **Step 4 (API Contract Alignment)**:
   - *Observation 1 and 4* show that the frontend requires `GET /api/stories` (returning a JSON array of 6 stories) and `GET /api/stories/{id}` (returning the story object or 404).
   - *Logic*: Implementing `StoriesController.cs` with in-memory `SeedData.cs` containing 6 Arabic stories covering all 6 moral categories in Egyptian Pounds (ج.م) directly satisfies R3 and Acceptance Criteria.

5. **Step 5 (MongoDB Scaffolding Isolation)**:
   - *Observation 2 and R4* require MongoDB and Auth templates for future extensibility without affecting current compilation or execution.
   - *Logic*: Isolating template files (`IRepository<T>`, `MongoRepository<T>`, `MongoDbContext.cs`, `IAuthService.cs`, `AuthService.cs`, `README.md`) in `server/Templates/` with commented-out code and commented-out NuGet package in `.csproj` guarantees zero runtime crashes while preserving future activation readiness.

6. **Step 6 (Vite Proxy Routing)**:
   - *Observation 1* shows Vite proxying `/api` to `http://localhost:5080`.
   - *Logic*: Configuring `server/Properties/launchSettings.json` with `applicationUrl: "http://localhost:5080"` and `client/vite.config.js` with proxy to `http://localhost:5080` establishes seamless local full-stack routing without CORS friction.

---

## 3. Caveats

1. **Interactive Shell Commands**:
   - Calling `run_command` (`dotnet --version`) timed out waiting for user confirmation in this execution environment. Toolchain versions were verified via inspection of `project.assets.json` and `package.json` / `package-lock.json`.
2. **Read-Only Scope**:
   - As an Explorer agent, no source files were modified, moved, or deleted. All recommendations and code templates are documented in `survey_report.md` for subsequent implementation agents.
3. **Frontend CSS Co-location**:
   - The extraction of `client/src/styles/variables.css` and component-specific CSS modularization must be coordinated with the frontend implementer to ensure no visual regressions occur.

---

## 4. Conclusion

1. **Root & Deletion Plan**:
   - Delete `SuperKayyem.Backend/`, `super_kayyem.html`, `New Text Document.txt`, `TODO.md`, `.env`, `.env.production`.
   - Reorganize project layout into `client/` and `server/` with `SuperKayyem.sln` at the project root.
2. **Clean Backend Architecture**:
   - Create `server/SuperKayyem.csproj` targeting `net10.0`.
   - Structure: `Controllers/StoriesController.cs`, `Models/Story.cs`, `Services/StoryService.cs` & `IStoryService.cs`, `Data/SeedData.cs` (6 Arabic stories in Egyptian Pounds).
   - Scaffolding: `server/Templates/` with inactive MongoDB & Auth templates and activation `README.md`.
   - Server configuration: `appsettings.json` with `"MongoDb": { "ConnectionString": "", "DatabaseName": "SuperKayyemDb" }`.
3. **Integration**:
   - Serve .NET backend on `http://localhost:5080`.
   - Configure `client/vite.config.js` to proxy `/api` requests to `http://localhost:5080`.

---

## 5. Verification Method

To independently verify all findings and readiness:

1. **Verify .NET SDK & Build**:
   ```bash
   dotnet --version
   dotnet --list-sdks
   ```
   *Expected*: Shows .NET 10 SDK installed.

2. **Verify Node & Build Tooling**:
   ```bash
   node -v
   npm -v
   ```
   *Expected*: Node 18+ and npm 9+.

3. **Verify Currency Audit (Zero Tolerance for SAR)**:
   ```bash
   rg "ريال" src/
   rg "ر.س" src/
   rg "SAR" src/
   ```
   *Expected during exploration*: Matches in `StoryPage.jsx`, `StoryEditor.jsx`, `stories.js`, `Dashboard.jsx`. After implementation: 0 matches.

4. **Verify Dead Code References**:
   ```bash
   rg "handleScrollTo" src/
   rg "setCurrentPage" src/
   ```
   *Expected during exploration*: Found in `Navbar.jsx`, `App.jsx`, etc. After implementation: 0 matches.

5. **Verify New Server Endpoints (Post-Implementation)**:
   ```bash
   curl -i http://localhost:5080/api/stories
   curl -i http://localhost:5080/api/stories/1
   curl -i http://localhost:5080/api/stories/999
   ```
   *Expected*:
   - `GET /api/stories` -> HTTP 200 with JSON array of 6 stories.
   - `GET /api/stories/1` -> HTTP 200 with story object (`"id": 1`, `"category": "التعاون"`).
   - `GET /api/stories/999` -> HTTP 404 with error message.
