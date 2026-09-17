# Super Kayyem (سوبر قيم) — Story Data, Currency & Requirements Survey Report

**Specialist**: Explorer 3 (Story Data & Requirements Survey Specialist)  
**Date**: 2026-09-17  
**Working Directory**: `F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\explorer_survey_3`  
**Target Architecture**: React 19 + Vite (`client/`) & .NET 10 MVC API (`server/`)

---

## 1. Executive Summary

This report delivers a complete, read-only survey of the story data architecture, currency unification, and requirements acceptance mapping for the Super Kayyem edutainment storytelling platform refactoring.

Key findings:
1. **Story Data Gap**: The current frontend repository (`src/data/stories.js`) contains only 3 hardcoded stories (التعاون, الشجاعة, الصدق), lacking 3 required moral genres (المسؤولية, الصداقة, الصبر), and uses mismatched schema fields (`age`, `cover`, `pages`, `duration`) rather than the R3 required specification (`id`, `title`, `slug`, `category`, `targetAgeGroup`, `description`, `price`, `rating`, `coverImage`, `pageCount`).
2. **Currency Chaos**: Multiple conflicting currency symbols and notations exist across the legacy code: `SAR` (admin dashboard), `ريال` (StoryPage, StoryEditor), `ر.س` (stories.js, super_kayyem.html), `EGP` (HomePage, RewardModal), and `ج.م` (StoryDetailsModal, LibraryPage, Navbar, CheckoutModal). Acceptance criteria mandate zero occurrences of `ريال`, `SAR`, and `ر.س`, with complete unification to Egyptian Pounds (`ج.م`).
3. **Acceptance Criteria Dissection**: All 27 acceptance criteria across Build & Lint, API Response, No Dead Code, Architecture, Stories, MongoDB Templates, and Visual/Functional have been mapped directly to actionable verification checks for Milestones 1 through 4.

---

## 2. Existing Story Data & Schema Audit

### 2.1 Analysis of `src/data/stories.js`
The legacy file `src/data/stories.js` exports an array `STORIES` with 3 items:
- **Story 1**: ID `1`, title `"باسم ومسبار الأمل"`, category `"التعاون"`, age `"٦-٨"`, cover `"الفضاء"`, rating `4.8`, price `'١٥ ر.س'`.
- **Story 2**: ID `2`, title `"سر اللؤلؤة الزرقاء"`, category `"الشجاعة"`, age `"٤-٦"`, cover `"المحيط"`, rating `4.5`, price `'١٢ ر.س'`.
- **Story 3**: ID `3`, title `"خريطة الشجرة العتيقة"`, category `"الصدق"`, age `"٨-١٠"`, cover `"الغابة"`, rating `4.9`, price `'١٨ ر.س'`.

### 2.2 Schema Discrepancies vs R3 Specification

| Feature / Field | Legacy `stories.js` | Legacy Frontend UI (`HomePage`, `LibraryPage`) | R3 & Acceptance Criteria Required |
|---|---|---|---|
| **Count** | 3 stories | Expects dynamic array from `/api/stories` | **Exactly 6 stories** (one per value) |
| **Identifier** | `id` (integer) | `id` (integer/string) | `id` (integer `1..6`) |
| **Title** | `title` (string) | `story.title` | `title` (string) |
| **Slug** | *Missing* | *Missing* | `slug` (kebab-case URL-safe string) |
| **Category** | `category` | Uses `valueLearned` in cards & filter! | `category` (unique value name: التعاون, الشجاعة, الصدق, المسؤولية, الصداقة, الصبر) |
| **Age Group** | `age: '٦-٨'` | `targetAgeGroup` | `targetAgeGroup` (e.g. `'٦-٨ سنوات'` or `'6-8 سنوات'`) |
| **Description** | 1 long sentence | `story.description` | `description` (2-3 authentic Arabic sentences) |
| **Price** | `'١٥ ر.س'` (string with SAR) | Formats numeric price + `ج.م` or `EGP` | `price` (decimal numeric, e.g. `45.00`, UI suffix `ج.م`) |
| **Rating** | `rating: 4.8` | `averageRating` (in StoryPage) | `rating` (double, e.g. `4.8`) |
| **Cover** | `cover: 'الفضاء'` | `coverImageUrl` | `coverImage` (path/URL string) |
| **Page Count** | `pages: [...]` (array) | `pageCount` | `pageCount` (integer, e.g. `10`) |

### 2.3 Frontend Backward-Compatibility Strategy
Legacy UI components (`LibraryPage.jsx`, `HomePage.jsx`, `StoryDetailsModal.jsx`) reference both:
- `story.category` AND `story.valueLearned`
- `story.coverImage` AND `story.coverImageUrl`

**Recommendation for Builder**:
In the C# `Story.cs` model and `SeedData.cs`, include calculated/aliased properties:
```csharp
public string ValueLearned => Category;
public string CoverImageUrl => CoverImage;
```
And in client components, modernize references to use `story.category` and `story.coverImage || story.coverImageUrl`.

---

## 3. The 6 Arabic Moral Stories Specification (R3)

All 6 stories are fully authored below with authentic, grammatically impeccable Arabic prose, structured in accordance with R3 and the target age groups.

### 3.1 Story Data Matrix

| # | Value (Category) | Title | Slug | Target Age | Price (ج.م) | Rating | Pages | Cover Placeholder |
|---|---|---|---|---|---|---|---|---|
| **1** | **التعاون** (Cooperation) | باسم ومسبار الأمل | `basim-wa-misbar-al-amal` | ٦-٨ سنوات | 45.00 | 4.8 | 10 | `/images/covers/cooperation.svg` |
| **2** | **الشجاعة** (Courage) | سر اللؤلؤة الزرقاء | `ser-al-luluah-al-zarqaa` | ٤-٦ سنوات | 35.00 | 4.6 | 8 | `/images/covers/courage.svg` |
| **3** | **الصدق** (Honesty) | خريطة الشجرة العتيقة | `kharitat-al-shajarah-al-atiqah` | ٨-١٠ سنوات | 50.00 | 4.9 | 12 | `/images/covers/honesty.svg` |
| **4** | **المسؤولية** (Responsibility) | حارس الواحة الصغير | `haris-al-wahah-al-saghir` | ٦-٩ سنوات | 40.00 | 4.7 | 10 | `/images/covers/responsibility.svg` |
| **5** | **الصداقة** (Friendship) | جسر النجوم الدافئ | `jisr-al-nujoom-al-dafi` | ٥-٧ سنوات | 40.00 | 4.8 | 10 | `/images/covers/friendship.svg` |
| **6** | **الصبر** (Patience) | بذرة الحكمة العجيبة | `badhrat-al-hikmah-al-ajibah` | ٧-١٠ سنوات | 45.00 | 4.9 | 12 | `/images/covers/patience.svg` |

---

### 3.2 Detailed Story Descriptions (2-3 Sentences Each)

#### 1. التعاون (Cooperation) — باسم ومسبار الأمل
- **Title**: باسم ومسبار الأمل
- **Slug**: `basim-wa-misbar-al-amal`
- **Category**: التعاون
- **Target Age Group**: ٦-٨ سنوات
- **Price**: 45.00 ج.م
- **Rating**: 4.8
- **Page Count**: 10
- **Cover Image**: `/images/covers/cooperation.svg`
- **Description (3 sentences)**:
  > "ينطلق باسم مع رفاقه في رحلة خيالية ممتعة عبر الفضاء لمساعدة مسبار الأمل في إعادة الضياء إلى كوكب بعيد باهت النور. يتعاون الأصدقاء بروح الفريق الواحد، مستثمرين مواهبهم المتنوعة في العلوم والرسم والملاحة لتخطي الصعاب. تُعلّم القصة الأطفال أن العمل الجماعي يصنع المعجزات ويضيء حتى أحلك الأماكن عتمة."

#### 2. الشجاعة (Courage) — سر اللؤلؤة الزرقاء
- **Title**: سر اللؤلؤة الزرقاء
- **Slug**: `ser-al-luluah-al-zarqaa`
- **Category**: الشجاعة
- **Target Age Group**: ٤-٦ سنوات
- **Price**: 35.00 ج.م
- **Rating**: 4.6
- **Page Count**: 8
- **Cover Image**: `/images/covers/courage.svg`
- **Description (3 sentences)**:
  > "تخوض السمكة الصغيرة لينا مغامرة جريئة في أعماق المحيط السحيق لحماية اللؤلؤة الزرقاء التي تحفظ أمان الشعاب المرجانية. ورغم رهبة الكهوف المظلمة والأمواج الهادرة، تتقدم لينا بثبات متسلحة بثقتها بربها ونقاء قصدها. تُلهم القصة الصغار أن الشجاعة لا تعني انعدام الخوف، بل مواجهته بالإصرار والإقدام."

#### 3. الصدق (Honesty) — خريطة الشجرة العتيقة
- **Title**: خريطة الشجرة العتيقة
- **Slug**: `kharitat-al-shajarah-al-atiqah`
- **Category**: الصدق
- **Target Age Group**: ٨-١٠ سنوات
- **Price**: 50.00 ج.م
- **Rating**: 4.9
- **Page Count**: 12
- **Cover Image**: `/images/covers/honesty.svg`
- **Description (3 sentences)**:
  > "يعثر أحمد ورفاقه على خريطة قديمة ترشدهم إلى كنز مخبوء بجوار الشجرة العتيقة في قلب الغابة المورقة. وحين تنكشف حقيقة الصندوق المفقود، يختار أحمد قول الصدق كاملاً وإعادة الأمانة لأصحابها دون تردد. تؤكد القصة أن الصدق هو الكنز الحقيقي الذي يرفع قدر الإنسان ويمنحه راحة البال والثقة."

#### 4. المسؤولية (Responsibility) — حارس الواحة الصغير
- **Title**: حارس الواحة الصغير
- **Slug**: `haris-al-wahah-al-saghir`
- **Category**: المسؤولية
- **Target Age Group**: ٦-٩ سنوات
- **Price**: 40.00 ج.م
- **Rating**: 4.7
- **Page Count**: 10
- **Cover Image**: `/images/covers/responsibility.svg`
- **Description (3 sentences)**:
  > "يُكلّف طارق بالعناية بنبع الماء وبساتين النخيل في واحة أجداده أثناء سفر والده لحضور موسم التجارة. ورغم رغبته في اللعب والمرح طوال النهار مع أقرانه، ينظم طارق وقته بحكمة ليؤدي واجبه اليومي بإتقان وأمانة. تغرس هذه القصة في نفوس الأطفال قيمة تحمل المسؤولية والشعور بأهمية الدور الذي يؤديه كل فرد."

#### 5. الصداقة (Friendship) — جسر النجوم الدافئ
- **Title**: جسر النجوم الدافئ
- **Slug**: `jisr-al-nujoom-al-dafi`
- **Category**: الصداقة
- **Target Age Group**: ٥-٧ سنوات
- **Price**: 40.00 ج.م
- **Rating**: 4.8
- **Page Count**: 10
- **Cover Image**: `/images/covers/friendship.svg`
- **Description (3 sentences)**:
  > "تلاحظ سارة حزن صديقها السنجاب الصغير الذي انقطع به السبيل عن أسرته في الوادي الصخري المعزول. تسارع سارة بمشاركة حيوانات الغابة لبناء جسر متين من الأغصان المحفوفة بالأزهار لإعانته على العبور بأمان. تُبيّن القصة معنى الصداقة الحقيقية والوفاء، وكيف يكون الصديق الصدوق سنداً وعوناً في أوقات الشدة."

#### 6. الصبر (Patience) — بذرة الحكمة العجيبة
- **Title**: بذرة الحكمة العجيبة
- **Slug**: `badhrat-al-hikmah-al-ajibah`
- **Category**: الصبر
- **Target Age Group**: ٧-١٠ سنوات
- **Price**: 45.00 ج.م
- **Rating**: 4.9
- **Page Count**: 12
- **Cover Image**: `/images/covers/patience.svg`
- **Description (3 sentences)**:
  > "يغرس زيد بذرة غريبة في تربة حديقته وينتظر بروح مفعمة بالأمل أن تبزغ أوراقها الخضراء فوق سطح الأرض. ورغم طول الأيام وتساؤلاته المتكررة، يدرك بتوجيه من جدته أن أجمل الثمار وأطيبها تتطلب رعاية وصيراً وتوكلاً. تعلّم القصة الأطفال أن الصبر مفتاح كل نجاح عظيم، وأن العجلة لا تثمر إلا الندم."

---

### 3.3 C# SeedData Ready-to-Use Code (`server/Data/SeedData.cs`)

```csharp
namespace SuperKayyem.Server.Data;

using SuperKayyem.Server.Models;

public static class SeedData
{
    public static readonly List<Story> Stories = new()
    {
        new Story
        {
            Id = 1,
            Title = "باسم ومسبار الأمل",
            Slug = "basim-wa-misbar-al-amal",
            Category = "التعاون",
            TargetAgeGroup = "٦-٨ سنوات",
            Description = "ينطلق باسم مع رفاقه في رحلة خيالية ممتعة عبر الفضاء لمساعدة مسبار الأمل في إعادة الضياء إلى كوكب بعيد باهت النور. يتعاون الأصدقاء بروح الفريق الواحد، مستثمرين مواهبهم المتنوعة في العلوم والرسم والملاحة لتخطي الصعاب. تُعلّم القصة الأطفال أن العمل الجماعي يصنع المعجزات ويضيء حتى أحلك الأماكن عتمة.",
            Price = 45.00m,
            Rating = 4.8,
            CoverImage = "/images/covers/cooperation.svg",
            PageCount = 10
        },
        new Story
        {
            Id = 2,
            Title = "سر اللؤلؤة الزرقاء",
            Slug = "ser-al-luluah-al-zarqaa",
            Category = "الشجاعة",
            TargetAgeGroup = "٤-٦ سنوات",
            Description = "تخوض السمكة الصغيرة لينا مغامرة جريئة في أعماق المحيط السحيق لحماية اللؤلؤة الزرقاء التي تحفظ أمان الشعاب المرجانية. ورغم رهبة الكهوف المظلمة والأمواج الهادرة، تتقدم لينا بثبات متسلحة بثقتها بربها ونقاء قصدها. تُلهم القصة الصغار أن الشجاعة لا تعني انعدام الخوف، بل مواجهته بالإصرار والإقدام.",
            Price = 35.00m,
            Rating = 4.6,
            CoverImage = "/images/covers/courage.svg",
            PageCount = 8
        },
        new Story
        {
            Id = 3,
            Title = "خريطة الشجرة العتيقة",
            Slug = "kharitat-al-shajarah-al-atiqah",
            Category = "الصدق",
            TargetAgeGroup = "٨-١٠ سنوات",
            Description = "يعثر أحمد ورفاقه على خريطة قديمة ترشدهم إلى كنز مخبوء بجوار الشجرة العتيقة في قلب الغابة المورقة. وحين تنكشف حقيقة الصندوق المفقود، يختار أحمد قول الصدق كاملاً وإعادة الأمانة لأصحابها دون تردد. تؤكد القصة أن الصدق هو الكنز الحقيقي الذي يرفع قدر الإنسان ويمنحه راحة البال والثقة.",
            Price = 50.00m,
            Rating = 4.9,
            CoverImage = "/images/covers/honesty.svg",
            PageCount = 12
        },
        new Story
        {
            Id = 4,
            Title = "حارس الواحة الصغير",
            Slug = "haris-al-wahah-al-saghir",
            Category = "المسؤولية",
            TargetAgeGroup = "٦-٩ سنوات",
            Description = "يُكلّف طارق بالعناية بنبع الماء وبساتين النخيل في واحة أجداده أثناء سفر والده لحضور موسم التجارة. ورغم رغبته في اللعب والمرح طوال النهار مع أقرانه، ينظم طارق وقته بحكمة ليؤدي واجبه اليومي بإتقان وأمانة. تغرس هذه القصة في نفوس الأطفال قيمة تحمل المسؤولية والشعور بأهمية الدور الذي يؤديه كل فرد.",
            Price = 40.00m,
            Rating = 4.7,
            CoverImage = "/images/covers/responsibility.svg",
            PageCount = 10
        },
        new Story
        {
            Id = 5,
            Title = "جسر النجوم الدافئ",
            Slug = "jisr-al-nujoom-al-dafi",
            Category = "الصداقة",
            TargetAgeGroup = "٥-٧ سنوات",
            Description = "تلاحظ سارة حزن صديقها السنجاب الصغير الذي انقطع به السبيل عن أسرته في الوادي الصخري المعزول. تسارع سارة بمشاركة حيوانات الغابة لبناء جسر متين من الأغصان المحفوفة بالأزهار لإعانته على العبور بأمان. تُبيّن القصة معنى الصداقة الحقيقية والوفاء، وكيف يكون الصديق الصدوق سنداً وعوناً في أوقات الشدة.",
            Price = 40.00m,
            Rating = 4.8,
            CoverImage = "/images/covers/friendship.svg",
            PageCount = 10
        },
        new Story
        {
            Id = 6,
            Title = "بذرة الحكمة العجيبة",
            Slug = "badhrat-al-hikmah-al-ajibah",
            Category = "الصبر",
            TargetAgeGroup = "٧-١٠ سنوات",
            Description = "يغرس زيد بذرة غريبة في تربة حديقته وينتظر بروح مفعمة بالأمل أن تبزغ أوراقها الخضراء فوق سطح الأرض. ورغم طول الأيام وتساؤلاته المتكررة، يدرك بتوجيه من جدته أن أجمل الثمار وأطيبها تتطلب رعاية وصيراً وتوكلاً. تعلّم القصة الأطفال أن الصبر مفتاح كل نجاح عظيم، وأن العجلة لا تثمر إلا الندم.",
            Price = 45.00m,
            Rating = 4.9,
            CoverImage = "/images/covers/patience.svg",
            PageCount = 12
        }
    };
}
```

---

## 4. Currency Audit & Unification Plan

A full ripgrep scan of the existing workspace identified all currency occurrences:

### 4.1 Ripgrep Audit Results

| Currency Token | File Path | Line # | Content Snippet | Disposal Action |
|---|---|---|---|---|
| `SAR` | `src/pages/admin/Dashboard.jsx` | 21 | `currency: 'SAR'` | **Delete File** (Dead code per R2) |
| `ريال` | `src/pages/StoryPage.jsx` | 75 | `شراء القصة ({story.price} ريال)` | **Remove Purchase Flow** (R2) & update price display to `ج.م` |
| `ريال` | `src/pages/admin/StoryEditor.jsx` | 346 | `<label htmlFor="se-price" className="se-label">السعر (ريال)</label>` | **Delete File** (Dead code per R2) |
| `ر.س` | `super_kayyem.html` | 312 | `شراء القصة (١٥ ر.س)` | **Delete File** (Dead code per R2) |
| `ر.س` | `src/data/stories.js` | 14, 92, 130 | `price: '١٥ ر.س'`, `price: '١٢ ر.س'`, `price: '١٨ ر.س'` | **Replace with SeedData** (Numeric decimals with `ج.م`) |
| `EGP` | `src/components/RewardModal.jsx` | 63 | `يرجى تحويل {showModal.price} EGP...` | **Delete File** (Dead code per R2) |
| `EGP` | `src/pages/HomePage.jsx` | 95 | `{story.price} EGP` | **Unify to `{story.price} ج.م`** |
| `ج.م` | `src/pages/LibraryPage.jsx` | 55 | `{parseFloat(story.price ?? 0).toFixed(2)} ج.م` | **Keep as Standard** |
| `ج.م` | `src/components/StoryDetailsModal.jsx` | 118 | `{price} ج.م` | **Keep as Standard** |
| `ج.م` | `src/components/Navbar.jsx` | 290, 314 | `{cartTotal.toFixed(2)} ج.م` | **Remove Cart** (Navbar simplified per R2) |
| `ج.م` | `src/components/CheckoutModal.jsx` | 234, 255, 278, 283, 334 | `{totalAmount.toFixed(2)} ج.م` | **Delete File** (Dead code per R2) |

### 4.2 Unification Rule
- **Currency Unit**: Egyptian Pounds (الجنيه المصري).
- **Display Label**: `ج.م` throughout all UI elements (Arabic standard abbreviation).
- **Data Model Representation**: Numeric decimal (e.g. `45.00` or `45`).
- **Verifiable Invariant**:
  ```powershell
  # Must return 0 results across all client and server source files
  rg -n "SAR|ريال|ر\.س" client/ server/
  ```

---

## 5. Acceptance Criteria Mapping (Milestones 1 – 4)

Every single criterion from `ORIGINAL_REQUEST.md` is mapped here to its verification milestone and executable check command.

### Milestone 1: Project Restructure & Cleanup (Dead Code & Legacy Removal)

| AC # | Acceptance Criterion Statement | Verification Method / Command | Pass Condition |
|---|---|---|---|
| **M1-1** | No `SuperKayyem.Backend/` directory exists | `Test-Path SuperKayyem.Backend` | Returns `False` |
| **M1-2** | Deleted dead JSX/CSS files do not exist: LoginPage, SignupPage, AccountPage, MyLibraryPage, ParentsPage, FlipbookReader, ReaderPage, CheckoutModal, RewardModal, AdminLayout, Dashboard, StoryEditor, AdminParentsArticles | Check each path in `client/src/pages/`, `client/src/components/`, `client/src/styles/` | None exist |
| **M1-3** | Orphaned files deleted: `super_kayyem.html`, `New Text Document.txt`, `TODO.md`, `.env`, `.env.production` | `Test-Path <file>` | None exist |
| **M1-4** | Entire `src/api/` folder deleted | `Test-Path client/src/api` | Returns `False` |
| **M1-5** | Zero imports of `axios`, `jwt-decode`, or `react-pageflip` | `rg -n "axios|jwt-decode|react-pageflip" client/` | 0 results |
| **M1-6** | Zero references to legacy endpoints (`/api/auth`, `/api/account`, `/api/user-library`, `/api/transactions`, `/api/admin`, `/api/parent-articles`, `/api/cms`, `/api/packages`) | `rg -n "/api/(auth|account|user-library|transactions|admin|parent-articles|cms|packages)" client/` | 0 results |
| **M1-7** | Zero auth/cart tokens (`localStorage.getItem('token')`, `Bearer`, `jwtDecode`, `useAuth`, `useCart`, `CartContext`, `AuthContext`) | `rg -n "localStorage\.getItem\('token'\)|Bearer|jwtDecode|useAuth|useCart|CartContext|AuthContext" client/src/` | 0 results |
| **M1-8** | Zero references to `handleScrollTo` | `rg -n "handleScrollTo" client/` | 0 results |
| **M1-9** | Zero references to `setCurrentPage` | `rg -n "setCurrentPage" client/` | 0 results |
| **M1-10**| Root structure contains `SuperKayyem.sln`, `client/`, and `server/` | `Test-Path SuperKayyem.sln, client, server` | All return `True` |

---

### Milestone 2: Server Implementation (.NET 10 API, Seed Data, MongoDB Templates)

| AC # | Acceptance Criterion Statement | Verification Method / Command | Pass Condition |
|---|---|---|---|
| **M2-1** | `server/*.csproj` targets .NET 10 | Inspect `<TargetFramework>net10.0</TargetFramework>` in `server/*.csproj` | Targets `net10.0` |
| **M2-2** | `dotnet build server/` completes with 0 errors | `dotnet build server/` | Exit code 0, 0 errors |
| **M2-3** | `dotnet run` starts the server without exceptions (no DB connection errors) | Run API server and check output logs | Starts cleanly on port 5080 |
| **M2-4** | `server/Data/SeedData.cs` contains exactly 6 stories | Inspect `SeedData.Stories.Count` | Exactly 6 stories |
| **M2-5** | `server/Services/StoryService.cs` returns in-memory data | Inspect `StoryService.cs` | In-memory `SeedData` access only |
| **M2-6** | `GET /api/stories` returns HTTP 200 with valid JSON array of 6 stories | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5080/api/stories` | Returns `200` |
| **M2-7** | Each story has unique category from the 6 values | Inspect JSON response categories | Set matches: التعاون, الشجاعة, الصدق, المسؤولية, الصداقة, الصبر |
| **M2-8** | `GET /api/stories/{id}` returns HTTP 200 for IDs 1..6 | `curl http://localhost:5080/api/stories/1` | Returns `200` and Story 1 JSON |
| **M2-9** | `GET /api/stories/{invalid-id}` returns HTTP 404 | `curl -s -o /dev/null -w "%{http_code}" http://localhost:5080/api/stories/999` | Returns `404` |
| **M2-10**| `server/Templates/` contains repository, context, auth service stubs and `README.md` | Inspect `server/Templates/` directory | All template files and `README.md` exist |
| **M2-11**| All template code is inactive/commented out; build succeeds without MongoDB | `dotnet build server/` | Builds cleanly without Mongo driver |
| **M2-12**| `appsettings.json` has `"MongoDb"` section with empty `ConnectionString` | Inspect `appsettings.json` | Key `"ConnectionString": ""` present |

---

### Milestone 3: Client Modernization & Shared Components

| AC # | Acceptance Criterion Statement | Verification Method / Command | Pass Condition |
|---|---|---|---|
| **M3-1** | `client/src/components/` has subdirectories: `layout/`, `ui/`, `sections/` | `Test-Path client/src/components/layout`, `ui`, `sections` | All return `True` |
| **M3-2** | `client/src/hooks/useTheme.js` exists and exports `useTheme` | Inspect `client/src/hooks/useTheme.js` | Exports hook, manages localStorage |
| **M3-3** | `client/src/styles/variables.css` exists with extracted tokens | Inspect `client/src/styles/variables.css` | All CSS variables declared |
| **M3-4** | Undefined variables (`--bg-primary`, `--yellow`) resolved | `rg -n "var\(--bg-primary\)|var\(--yellow\)" client/src/` | Variables defined or aliases added |
| **M3-5** | Conflicting `.hero` class resolved | Inspect `.hero` styles in co-located component | No conflicting definitions |
| **M3-6** | Duplicate shimmer keyframes removed | `rg -n "@keyframes.*shimmer" client/src/` | Exactly 1 definition |
| **M3-7** | Cairo font loaded only once | `rg -n "fonts.googleapis.com.*Cairo" client/` | Exactly 1 load |
| **M3-8** | Site has exactly 3 navigable routes: `/`, `/library`, `/story/:id` | Inspect `App.jsx` `<Routes>` | Only 3 routes defined |
| **M3-9** | Navbar shows only: logo, الرئيسية, قصصنا, theme toggle, mobile hamburger | Inspect `Navbar.jsx` JSX elements | No cart, auth, or admin links |
| **M3-10**| Footer displays dynamic current year copyright | Inspect `Footer.jsx` | `{new Date().getFullYear()}` |
| **M3-11**| StoryDetailsModal is presentation-only (no purchase/cart buttons) | Inspect `StoryDetailsModal.jsx` | Informational only, no buy/cart |
| **M3-12**| Currency unification: Grep for `ريال`, `SAR`, `ر.س` returns zero results | `rg -n "SAR|ريال|ر\.س" client/` | 0 results |
| **M3-13**| All UI prices display with Egyptian Pounds (`ج.م`) | Inspect `StoryCard`, `StoryDetailsModal`, `StoryPage` | Uses `ج.م` |
| **M3-14**| `npm run lint` passes with zero errors | `npm run lint` in `client/` | Exit code 0 |
| **M3-15**| `npm run build` completes with zero errors and zero warnings | `npm run build` in `client/` | Exit code 0, 0 warnings |

---

### Milestone 4: End-to-End Integration, UI Verification & Polishing

| AC # | Acceptance Criterion Statement | Verification Method / Command | Pass Condition |
|---|---|---|---|
| **M4-1** | Vite proxy forwards `/api` requests to .NET backend (`http://localhost:5080`) | Inspect `vite.config.js` and test browser network tab | `/api/stories` proxied and resolved |
| **M4-2** | React frontend successfully fetches and displays stories from .NET API | Open `http://localhost:3000/` and `/library` | Stories rendered dynamically |
| **M4-3** | LibraryPage displays all 6 stories with search & category filter functionality | Filter by each of the 6 categories; type search query | Correct filtered subsets returned |
| **M4-4** | Story card click opens StoryDetailsModal | Click story card | Modal pops up with story info |
| **M4-5** | Theme toggle switches light/dark mode and persists across page reload | Toggle theme and refresh browser | `data-theme` updated & persisted |
| **M4-6** | RTL text direction is set on root HTML element | Inspect `index.html` `<html lang="ar" dir="rtl">` | `dir="rtl"` present |
| **M4-7** | Responsive design functional across 320px, 768px, 1024px, 1440px | Viewport responsive inspection | No horizontal scroll, layout adapts |
| **M4-8** | Zero browser console errors | Open browser developer console | Clean console |

---

## 6. Recommendations for Implementers

1. **Vite Proxy & Ports**: Configure `server/Properties/launchSettings.json` with `http://localhost:5080` (and `https://localhost:7080`). Ensure `client/vite.config.js` proxies `/api` to `http://localhost:5080`.
2. **Standardized Story Model**: Include both `category` and `valueLearned` in JSON serialization so any components during transition remain fully functional.
3. **Clean Native Fetch**: Replace all `apiClient` / `axios` imports with native browser `fetch('/api/stories')`. This satisfies the criterion of zero `axios` imports while simplifying dependencies.
4. **No Database Dependencies**: Ensure `Program.cs` registers `IStoryService` as a singleton returning `SeedData.Stories`, allowing immediate startup without SQL Server or MongoDB.
