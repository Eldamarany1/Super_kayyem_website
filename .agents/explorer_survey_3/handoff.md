# Handoff Report: Arabic Story Data, Currency Consistency & Requirements Survey

**Author**: Explorer 3 (Story Data & Requirements Survey Specialist)  
**Date**: 2026-09-17  
**Working Directory**: `F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_3`  
**Full Detailed Report**: `F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_3\survey_report.md`  

---

## 1. Observation

Direct observations from codebase inspection and tool execution:

1. **Existing Story Data (`src/data/stories.js`)**:
   - Contains only 3 stories:
     - Line 6-8: `id: 1, title: 'باسم ومسبار الأمل', category: 'التعاون', age: '٦-٨', price: '١٥ ر.س'`
     - Line 84-86: `id: 2, title: 'سر اللؤلؤة الزرقاء', category: 'الشجاعة', age: '٤-٦', price: '١٢ ر.س'`
     - Line 122-124: `id: 3, title: 'خريطة الشجرة العتيقة', category: 'الصدق', age: '٨-١٠', price: '١٨ ر.س'`
   - Missing fields required by R3: `slug`, `pageCount`, `coverImage`, `targetAgeGroup`.
   - Missing 3 required moral genres: `المسؤولية` (Responsibility), `الصداقة` (Friendship), `الصبر` (Patience).
   - Contains non-standard fields: `completed: true/false`, `duration: '١٠ دقائق'`, `pages: [...]`.

2. **Currency Grep Search Results**:
   - `SAR`: Found in `src/pages/admin/Dashboard.jsx:21` (`currency: 'SAR'`).
   - `ريال`: Found in `src/pages/StoryPage.jsx:75` (`شراء القصة ({story.price} ريال)`) and `src/pages/admin/StoryEditor.jsx:346` (`السعر (ريال)`).
   - `ر.س`: Found in `super_kayyem.html:312` (`شراء القصة (١٥ ر.س)`) and `src/data/stories.js:14, 92, 130` (`price: '١٥ ر.س'`, `price: '١٢ ر.س'`, `price: '١٨ ر.س'`).
   - `EGP`: Found in `src/components/RewardModal.jsx:63` (`يرجى تحويل {showModal.price} EGP`) and `src/pages/HomePage.jsx:95` (`<span className="tag tag-yellow">{story.price} EGP</span>`).
   - `ج.م`: Found in `src/components/StoryDetailsModal.jsx:118` (`{price} ج.م`), `src/pages/LibraryPage.jsx:55` (`{parseFloat(story.price ?? story.basePrice ?? 0).toFixed(2)} ج.م`), `src/components/Navbar.jsx:290, 314`, and `src/components/CheckoutModal.jsx:234, 255, 278, 283, 334`.

3. **Dead Code & Legacy Dependencies Scan**:
   - `axios`: `package.json:15`, `src/api/client.js:1, 10, 18`.
   - `jwt-decode`: `package.json:16`, `src/context/AuthContext.jsx:2, 20, 43, 60`.
   - `react-pageflip`: `package.json:19`, `src/pages/FlipbookReader.jsx:9, 22, 267`.
   - `handleScrollTo`: `src/components/Navbar.jsx:31`.
   - `setCurrentPage`: `src/App.jsx:54, 90, 94, 102, 103, 108, 144`, `src/components/RewardModal.jsx:8, 20`, `src/pages/StoryPage.jsx:10`, `src/pages/ReaderPage.jsx:8, 15`, `src/pages/LibraryPage.jsx:83`, `src/pages/HomePage.jsx:10`.
   - Duplicate Cairo font import: `index.html:11` and `src/index.css:8`.
   - Conflicting `.hero` class: `src/App.css:425` and `src/styles/HomePage.css:9`.
   - Undefined CSS variables: `--bg-primary` in `styles/AdminParentsArticles.css:11, 30, 94` and `styles/ParentsPage.css:42`; `--yellow` in `styles/HomePage.css:105`.

4. **Acceptance Criteria**:
   - 27 distinct verifiable criteria in `ORIGINAL_REQUEST.md` spanning build/lint, API endpoints, dead code, architecture, story seed data, MongoDB inactive scaffolding, and responsive UI.

---

## 2. Logic Chain

1. **Premise 1**: R3 requires exactly 6 stories, one per moral value (`التعاون`, `الشجاعة`, `الصدق`, `المسؤولية`, `الصداقة`, `الصبر`), each having `id`, `title`, `slug`, `category`, `targetAgeGroup`, `description` (2-3 authentic Arabic sentences), `price` in Egyptian Pounds, `rating`, `coverImage`, and `pageCount`.
   - *Observation Reference*: Section 1.1 reveals only 3 stories exist in `src/data/stories.js` and their fields do not conform to R3.
   - *Inference*: A complete 6-story seed specification with rich Arabic prose must be authored and implemented in `server/Data/SeedData.cs` and mirrored in static client fallback data.

2. **Premise 2**: Acceptance criteria specify: "All prices use Egyptian Pounds — grep for `ريال`, `SAR`, `ر.س` returns zero results across all source files".
   - *Observation Reference*: Section 1.2 locates `SAR` in `Dashboard.jsx`, `ريال` in `StoryPage.jsx` and `StoryEditor.jsx`, `ر.س` in `stories.js` and `super_kayyem.html`, and `EGP` in `HomePage.jsx` and `RewardModal.jsx`.
   - *Inference*: Deleting the obsolete files (Dashboard, StoryEditor, super_kayyem.html, RewardModal) will eliminate 5 out of 8 currency errors. The remaining occurrences (`StoryPage.jsx` and `HomePage.jsx`) must be updated to display `{story.price} ج.م`, and `stories.js`/`SeedData.cs` must use numeric decimals.

3. **Premise 3**: Legacy components (`LibraryPage.jsx`, `HomePage.jsx`, `StoryDetailsModal.jsx`) reference both `story.category` / `story.valueLearned` and `story.coverImage` / `story.coverImageUrl`.
   - *Observation Reference*: `LibraryPage.jsx:75` uses `story.valueLearned`, while R3 specifies `category`.
   - *Inference*: Providing computed/aliased properties `ValueLearned => Category` and `CoverImageUrl => CoverImage` in `server/Models/Story.cs` prevents UI breakage during and after refactoring while fulfilling R3.

4. **Premise 4**: Acceptance criteria require clean separation of concerns into `client/` and `server/` with strict milestone phases.
   - *Observation Reference*: Section 1.4 cataloged 27 criteria across 4 logical lifecycle stages.
   - *Inference*: Milestones 1 through 4 can be verified independently with automated shell commands (`rg`, `dotnet build`, `npm run build`, `curl`).

---

## 3. Caveats

- **Active .NET Runtime**: The survey is read-only; no compilation test was run during this survey. .NET 10 project build and runtime verification will occur in Milestone 2.
- **Image Assets**: Cover images are specified as vector placeholders (`/images/covers/*.svg`) or placeholder URLs (`https://images.unsplash.com/...`), which satisfies R3 ("can be a placeholder URL"). Physical raster image creation is optional.
- No other caveats.

---

## 4. Conclusion

1. **Complete 6-Story Seed Specification**: The 6 Arabic stories covering all required genres (التعاون, الشجاعة, الصدق, المسؤولية, الصداقة, الصبر) are fully defined with authentic 2-3 sentence Arabic descriptions, target age brackets, prices in EGP (35–50 ج.م), ratings (4.6–4.9), slugs, and page counts. The ready-to-use C# `SeedData.cs` code is provided in `survey_report.md`.
2. **Currency Invariants Mapped**: Every file containing `SAR`, `ريال`, `ر.س`, or `EGP` is mapped with its disposal/fix path. Complete unification to `ج.م` is documented.
3. **Acceptance Criteria Actionable**: All 27 criteria from `ORIGINAL_REQUEST.md` have been mapped to specific, automated CLI checks across Milestones 1 through 4.

---

## 5. Verification Method

To independently verify the observations and conclusions in this survey:

1. **Inspect Survey Report**:
   ```powershell
   Get-Content "F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_3\survey_report.md"
   ```

2. **Verify Currency Occurrences**:
   ```powershell
   cd F:\MK_DM_project\super-kayyem\Super_kayyem_website
   rg -n "SAR|ريال|ر\.س|EGP" src/ super_kayyem.html
   ```

3. **Verify Existing Story Count and Fields**:
   ```powershell
   rg -n "category:" src/data/stories.js
   ```

4. **Post-Implementation Invalidation Condition**:
   If after Milestone 3 any run of `rg -n "SAR|ريال|ر\.س" client/ server/` returns 1 or more results, the currency acceptance criterion is failed.
