# Technical Survey Report: Service Layer Elimination & Documentation Architecture

**Explorer**: Explorer 3 (Service Layer & Documentation Explorer)  
**Target Codebase**: `F:\MK_DM_project\super-kayyem\Super_kayyem_website\server`  
**Date**: 2026-10-05  
**Integrity Mode**: Development (Read-Only Technical Survey)

---

## 1. Executive Summary

This report provides a thorough investigation of the backend service layer, data seeding mechanisms, configuration alignment, and documentation requirements for the Super Kayyem ASP.NET Core (.NET 10) / MongoDB Atlas web application.

Key findings:
1. **Service Layer**: `IStoryService.cs` and `StoryService.cs` are an unnecessary abstraction layer acting merely as an in-memory wrapper over `SeedData.GetStories()`. They are referenced in only 3 external locations (`Program.cs`, `StoriesController.cs`, `AdminController.cs`). They can be cleanly excised and replaced with direct `MongoDbContext` injection in the controllers without affecting any other part of the system or the React frontend.
2. **Infrastructure Files**: `MongoDbContext.cs` and `MongoDbSettings.cs` in `server/Services/` are essential infrastructure components and must be **KEPT**. `MongoDbSettings.cs` requires aligning its property `AtlasURI` with `ConnectionString` to match `appsettings.json`.
3. **Template Preservation**: All 5 files in `server/Templates/` are inactive scaffolding templates and must **NOT** be touched.
4. **Data Seeding & In-Memory Fallback**: `SeedData.cs` contains 6 complete Arabic children's stories with moral values. In-memory data is currently lost on server restart. A resilient seeding pattern in the controllers or `Program.cs` guarantees that if the MongoDB Atlas collection is empty, the seed data is persisted to the database, preventing runtime exceptions (such as `@Model.Average()` throwing `InvalidOperationException` on an empty collection in `Admin/Index.cshtml`).
5. **Compilation Barriers & Warnings**: Current `dotnet build` fails with `CS1001` and `CS1002` on `AccountController.cs(23,29)`. Secondary blockers include constructor name mismatch (`AccountService`), missing namespace imports, and potential `CS1998` warnings on synchronous GET actions if converted to async without `await`.
6. **Documentation**: Clear blueprint specifications for `server/CHANGES_AR.md` across the three required Arabic sections (Package/Config, Controllers Old vs New, Async/Await Explanation) are established below.

---

## 2. Service Layer Investigation & Usage Mapping

### 2.1 Inventory of Service Layer Files
- **`server/Services/IStoryService.cs`** (13 lines):
  Defines 5 asynchronous methods:
  - `Task<IEnumerable<Story>> GetAllStoriesAsync()`
  - `Task<Story?> GetStoryByIdAsync(int id)`
  - `Task AddStoryAsync(Story story)`
  - `Task<bool> UpdateStoryAsync(Story story)`
  - `Task<bool> DeleteStoryAsync(int id)`
- **`server/Services/StoryService.cs`** (64 lines):
  Implements `IStoryService`. Holds a private `List<Story> _stories` initialized once from `SeedData.GetStories()`. All methods return immediate results wrapped in `Task.FromResult` or `Task.CompletedTask`. Does not communicate with MongoDB.

### 2.2 Complete Solution-Wide Usage Mapping
A global search across the entire project repository (`Super_kayyem_website`) confirmed that `IStoryService` and `StoryService` appear in exactly four files (all inside `server`):

| File | Line(s) | Verbatim Code Snippet | Required Action |
|---|---|---|---|
| `server/Program.cs` | 44 | `builder.Services.AddSingleton<IStoryService, StoryService>();` | **Remove line completely** |
| `server/Controllers/StoriesController.cs` | 11, 14, 24, 38 | `private readonly IStoryService _storyService;`<br>`public StoriesController(IStoryService storyService, ...)`<br>`await _storyService.GetAllStoriesAsync();`<br>`await _storyService.GetStoryByIdAsync(storyId);` | **Replace dependency with `MongoDbContext`** |
| `server/Controllers/AdminController.cs` | 9, 12, 20, 26, 41, 48, 59, 67, 76 | `private readonly IStoryService _storyService;`<br>`public AdminController(IStoryService storyService, ...)`<br>All 8 CRUD action delegates | **Replace dependency with `MongoDbContext`** |
| `server/Services/IStoryService.cs` | 1-13 | Entire file | **Delete file** |
| `server/Services/StoryService.cs` | 1-64 | Entire file | **Delete file** |

*Note: The React client codebase does not import or know about `IStoryService` or `StoryService`; it only interacts with the HTTP endpoints (`/api/stories`).*

---

## 3. SeedData & Database Fallback Analysis

### 3.1 Structure of `server/Data/SeedData.cs`
- Namespace: `SuperKayyem.Data`
- Class: `public static class SeedData`
- Method: `public static List<Story> GetStories()`
- Contains 6 fully structured stories:
  1. `Id = 1`: **باسم ومسبار الأمل** (Category: التعاون, Age: 6-8, Price: 35 EGP, Rating: 4.9, 10 Pages)
  2. `Id = 2`: **سر اللؤلؤة الزرقاء** (Category: الشجاعة, Age: 4-6, Price: 40 EGP, Rating: 4.8, 8 Pages)
  3. `Id = 3`: **خريطة الشجرة العتيقة** (Category: الصدق, Age: 8-10, Price: 45 EGP, Rating: 4.7, 12 Pages)
  4. `Id = 4`: **حارس الواحة الصغير** (Category: المسؤولية, Age: 6-8, Price: 35 EGP, Rating: 4.9, 10 Pages)
  5. `Id = 5`: **جسر النجوم الدافئ** (Category: الصداقة, Age: 4-6, Price: 30 EGP, Rating: 4.8, 8 Pages)
  6. `Id = 6`: **بذرة الحكمة العجيبة** (Category: الصبر, Age: 8-10, Price: 50 EGP, Rating: 4.6, 12 Pages)
  
Each story includes child `Pages` (`List<StoryPageItem>`) with `PageNum` and `Content`.

### 3.2 In-Memory vs. Database Fallback Dynamics
- **Current Behavior**: `StoryService` instantiates `_stories = SeedData.GetStories();` in memory. If a story is edited or deleted, changes are ephemeral.
- **Direct MongoDb Strategy**: Controllers will query `_context.Stories` via EF Core async queries.
- **Empty Database Hazard**:
  In `server/Views/Admin/Index.cshtml` (line 16):
  ```razor
  <div class="stat-number">@Model.Average(s => s.Rating).ToString("F1")</div>
  ```
  If the `Stories` collection in MongoDB Atlas is empty when an administrator visits `/Admin`, calling `.Average()` on an empty enumerable causes a runtime crash:
  `System.InvalidOperationException: Sequence contains no elements`.
- **Recommended Resilient Seeding Pattern**:
  When `StoriesController.GetAll` or `AdminController.Index` queries stories, if the database collection has 0 documents, automatically seed the collection with `SeedData.GetStories()`:
  ```csharp
  var stories = await _context.Stories.ToListAsync(ct);
  if (!stories.Any())
  {
      var seed = SeedData.GetStories();
      await _context.Stories.AddRangeAsync(seed, ct);
      await _context.SaveChangesAsync(ct);
      stories = seed;
  }
  ```
  This guarantees immediate usability of both the public API and the admin dashboard, preserves all 6 stories in MongoDB Atlas, and prevents view rendering exceptions.

### 3.3 Account Data Sample (`AccountDataSample.cs`)
- Class: `SuperKayyem.Data.AccountSeedData` in `server/Data/AccountDataSample.cs`.
- Contains 6 pre-built accounts with children records.
- In `AccountController.cs`, the author had directly bound to `AccountSeedData.Accounts`.
- Per Requirement R1 and R3: All references to `AccountSeedData` must be removed from `AccountController.cs`. Instead, `AccountController` directly queries and persists through `_mongoDbContext.Accounts`.

---

## 4. Services Directory & Infrastructure File Review

### 4.1 Files to KEEP in `server/Services/`
1. **`MongoDbContext.cs`**:
   - Must be **KEPT**.
   - Inherits from `Microsoft.EntityFrameworkCore.DbContext`.
   - Defines `DbSet<Account> Accounts` and `DbSet<Story> Stories`.
   - Already has correct model configurations for `Account` and `Story`.
   - Constructor `public MongoDbContext(DbContextOptions options) : base(options)` is fully compatible with `AddDbContext<MongoDbContext>`.
2. **`MongoDbSettings.cs`**:
   - Must be **KEPT**.
   - Contains configuration properties for MongoDB connection.
   - **MANDATORY FIX**: Current property is `public string? AtlasURI { get; set; }`. However, `appsettings.json` defines `"ConnectionString"`.
   - Proposed update to `MongoDbSettings.cs`:
     ```csharp
     namespace SuperKayyem.Services
     {
         public class MongoDbSettings
         {
             public string? ConnectionString { get; set; }
             public string? AtlasURI { get => ConnectionString; set => ConnectionString = value; } // Compatibility alias
             public string? DatabaseName { get; set; }
         }
     }
     ```
     This allows both `ConnectionString` and `AtlasURI` to bind seamlessly without breaking any consumer.

### 4.2 Configuration Conflict in `server/Program.cs`
- Current lines 24-25:
  ```csharp
  builder.Services.AddDbContext<MongoDbContext>(options => 
      options.UseMongoDB(MongoDbSettings?.AtlasURI ?? "", MongoDbSettings?.DatabaseName ?? ""));
  ```
- Current line 43:
  ```csharp
  builder.Services.AddSingleton<MongoDbContext>();
  ```
- **Conflict**: Line 43 overrides or duplicates `MongoDbContext` registration as a Singleton, while `AddDbContext` registers it as `Scoped`.
- **Fix**: Remove line 43 completely. Update line 25 to use `MongoDbSettings?.ConnectionString ?? ""`.

### 4.3 Files to NOT TOUCH in `server/Templates/`
The following 5 files in `server/Templates/` are inactive template scaffolding and must remain untouched:
- `server/Templates/AuthService.cs`
- `server/Templates/IAuthService.cs`
- `server/Templates/IRepository.cs`
- `server/Templates/MongoRepository.cs`
- `server/Templates/README.md`

---

## 5. Blueprint Specifications for `server/CHANGES_AR.md`

`server/CHANGES_AR.md` must be written in clear, professional Arabic. Below is the full blueprint covering all three required sections:

```markdown
# وثيقة توثيق التغييرات والتحسينات البرمجية — Super Kayyem Backend

تم إنجاز هذا التحديث لمعالجة مشاكل البناء (Build Errors)، وضبط إعدادات الاتصال بقاعدة بيانات MongoDB Atlas، وإلغاء طبقة الخدمات الوسيطة غير الضرورية (Service Layer) لصالح التعامل المباشر والآمن عبر وحدات التحكم (Controllers) باستخدام النمط غير المتزامن (Async/Await) بالكامل.

---

## 1. مشاكل الحزم والإعدادات وحلولها (Packages & Configuration Fixes)

### أ. تضارب تسجيل سياق قاعدة البيانات (MongoDbContext Registration Conflict)
* **المشكلة السابقة**: في ملف `Program.cs`، تم تسجيل `MongoDbContext` مرتين:
  1. الأولى عبر `AddDbContext<MongoDbContext>(...)` بنطاق دورة حياة مؤقت (Scoped Lifetime وهو النمط القياسي لـ EF Core).
  2. الثانية عبر `AddSingleton<MongoDbContext>()` ككائن وحيد دائم طوال حياة التطبيق.
  هذا التكرار يسبب تضارباً في حاوية حقن التبعيات (Dependency Injection Container) ومشاكل في تتبع الكيانات وإدارة الاتصال.
* **الحل**: تم حذف سطر `AddSingleton<MongoDbContext>()` والاكتفاء بتسجيل `AddDbContext<MongoDbContext>()` الموصى به رسمياً في ASP.NET Core و EF Core.

### ب. عدم تطابق اسم خاصية الاتصال (ConnectionString vs AtlasURI)
* **المشكلة السابقة**: ملف الإعدادات `appsettings.json` يحتوي على المفتاح:
  ```json
  "MongoDbSettings": {
    "ConnectionString": "mongodb+srv://...",
    "DatabaseName": "SuperKayyemDb"
  }
  ```
  بينما كان كلاس `MongoDbSettings.cs` وملف `Program.cs` يبحثان عن خاصية باسم `AtlasURI`. ونتيجة لذلك، كانت القيمة المقروءة تساوي `null`، مما يعطل الاتصال الفعلي بقاعدة البيانات السحابية.
* **الحل**: تم تحديث كلاس `MongoDbSettings.cs` لتعريف خاصية `ConnectionString` (مع توفير alias باسم `AtlasURI` لضمان التوافق)، وتحديث `Program.cs` لقراءة `MongoDbSettings.ConnectionString`.

### ج. سلامة حزم NuGet المستخدمة
* تم التأكد من سلامة الحزمتين:
  - `MongoDB.EntityFrameworkCore` (إصدار 10.0.4)
  - `MongoDB.Driver` (إصدار 3.12.0)
  كلاهما متوافق تماماً مع بيئة عمل .NET 10 ولا يتطلبان تعديل إصدارات.

---

## 2. تفاصيل التعديلات على وحدات التحكم (Controllers: Old vs New Approach)

### أ. وحدة تحكم القصص (`StoriesController.cs` - Web API)
* **النهج السابق (Old Approach)**:
  - كان يحقن واجهة `IStoryService`.
  - كانت القراءة تتم من الذاكرة العشوائية المؤقتة فقط (In-Memory).
  - كان يقتصر على عمليتي قراءة فقط (`GET /api/stories` و `GET /api/stories/{id}`) دون دعم الإضافة أو التعديل أو الحذف.
* **النهج الجديد (New Approach)**:
  - تم حقن `MongoDbContext` مباشرة داخل وحدة التحكم.
  - تم تنفيذ كافة العمليات غير المتزامنة مباشرة على قاعدة البيانات: `ToListAsync()`, `FirstOrDefaultAsync()`, `AddAsync()`, `SaveChangesAsync()`.
  - اكتمال منظومة الـ CRUD بالكامل عبر توفير:
    - `GET /api/stories`: جلب القصص مع تفعيل التعبئة التلقائية (Seeding) في حال كانت القاعدة فارغة.
    - `GET /api/stories/{id}`: جلب قصة محددة.
    - `POST /api/stories`: إضافة قصة جديدة مع التوليد التلقائي للـ Slug ورقم المعرف.
    - `PUT /api/stories/{id}`: تعديل بيانات القصة.
    - `DELETE /api/stories/{id}`: حذف القصة.
  - تمرير `CancellationToken ct` في العمليات لضمان إلغاء الاستعلام في حال انقطاع اتصال العميل.

### ب. وحدة تحكم الإدارة (`AdminController.cs` - MVC Razor Views)
* **النهج السابق (Old Approach)**:
  - كان يعتمد على `IStoryService` في الذاكرة.
  - كان يواجه خطر انهيار الواجهة في دالة الإحصائيات `@Model.Average()` عند خلو الذاكرة من القصص.
* **النهج الجديد (New Approach)**:
  - حقن `MongoDbContext` مباشرة مع الحفاظ على كونه MVC Controller يعود بـ Views لواجهة المشرف.
  - الحفاظ التام على جميع أسماء الـ Actions والمسارات (`Index`, `Details`, `Create`, `Edit`, `Delete`, `DeleteConfirmed`).
  - تحويل كافة الـ Actions إلى غير متزامنة `async Task<IActionResult>`.
  - إضافة خاصية `[ValidateAntiForgeryToken]` في طلبات الإرسال (POST) للحماية من هجمات تزوير الطلبات عبر المواقع.
  - الحفظ المباشر في MongoDB Atlas عبر `await _context.SaveChangesAsync(ct)`.

### ج. وحدة تحكم الحسابات (`AccountController.cs` - MVC Razor Views)
* **النهج السابق (Old Approach)**:
  - كان يعاني من أخطاء تركيبية تمنع البناء (`CS1001` و `CS1002`) بسبب سطر مبتور `_mongoDbContext.`.
  - خطأ في اسم المُنشئ حيث سُمي `AccountService` بدلاً من `AccountController`.
  - الاعتماد على مصفوفة ثابتة في الذاكرة `AccountSeedData.Accounts`.
  - افتقار الدوال للنمط غير المتزامن وغياب مساحات الأسماء المطلوبة لـ EF Core.
* **النهج الجديد (New Approach)**:
  - تصحيح اسم المُنشئ إلى `AccountController`.
  - حذف السطر المبتور وإصلاح أخطاء البناء بالكامل.
  - حقن `MongoDbContext` واستيراد مساحات الأسماء اللازمة (`SuperKayyem.Services`, `Microsoft.EntityFrameworkCore`).
  - التبديل الكامل من الذاكرة إلى جدول الحسابات الفعلي في قاعدة البيانات: `_mongoDbContext.Accounts`.
  - تحويل دوال العرض والتعديل والحذف (`AccountList`, `Read`, `Update`, `Delete`, `DeleteConfirmed`) إلى دوال غير متزامنة `async Task<IActionResult>`.
  - مراعاة استثناء كلمة المرور من الفحص عند التعديل `ModelState.Remove(nameof(model.Password))` للحفاظ على أمان البيانات وعدم فقدان كلمة المرور المشفرة.

---

## 3. شرح مبسط لمفهوم البرمجة غير المتزامنة (Async / Await) للمبتدئين

### ما هي مشكلة الكود المتزامن التقليدي (Synchronous)؟
تخيل مطعماً يعمل فيه نادل واحد (يمثل مسار المعالجة Thread في السيرفر). عندما يطلب الزبون وجبة طعام، يذهب النادل إلى المطبخ ويقف منتظراً أمام الطباخ لمدة نصف ساعة حتى تنتهي الوجبة، ويرفض خلال هذا الوقت التحدث مع أي زبون آخر أو أخذ أي طلبات جديدة!
إذا دخل 10 زبائن إلى المطعم في نفس الوقت، سيتوقف المطعم بالكامل عن العمل. هذا ما يحدث تماماً عند استخدام استعلامات قواعد البيانات المتزامنة؛ حيث يظل السيرفر محجوزاً دون فائدة في انتظار استجابة قاعدة البيانات.

### كيف يحل `async` و `await` هذه المشكلة؟
مع البرمجة غير المتزامنة:
1. يستلم النادل الطلب ويسلمه للمطبخ (إرسال استعلام قاعدة البيانات عبر الشبكة).
2. بدلاً من الوقوف في الانتظار، يقول النادل `await`، مما يعني: "أنا حر الآن؛ سأذهب لخدمة زبائن آخرين واستقبال طلبات جديدة!"
3. عندما تنتهي قاعدة البيانات من تجهيز البيانات، يقوم نظام التشغيل باستدعاء المسار لاستكمال تقديم البيانات للزبون الأول دون أي تأخير.

### الكلمات المفتاحية الأساسية:
1. **`async`**: كلمة توضع أمام تعريف الدالة لتخبر مترجم C# بأن هذه الدالة ستحتوي على عمليات طويلة المدى، وأن بإمكان السيرفر تحرير موارده أثناء انتظارها.
2. **`await`**: توضع قبل استدعاء العملية المستغرقة للوقت (مثل `await _context.Stories.ToListAsync()`). وظيفتها تعليق تنفيذ هذه الدالة فقط دون حظر الـ Thread، مما يتيح للسيرفر معالجة آلاف الطلبات المتزامنة بكفاءة وخفة.
3. **`Task` و `Task<T>`**: تمثل "الوعد" أو "المهمة الجارية". `Task` تمثل مهمة لا تعيد قيمة (تشبه `void`)، بينما `Task<IActionResult>` تمثل مهمة ستعود بنتيجة لاحقاً.

### قواعد ذهبية لتجنب الأخطاء الشائعة:
- **إياك واستخدام `.Result` أو `.Wait()`**: استخدامها يحول الكود غير المتزامن قسراً إلى كود متزامن حاجب للمسار، مما يؤدي إلى تجمد التطبيق بالكامل (Deadlock) وظاهرة اختناق المسارات (Thread Starvation).
- **التسلسل غير المتزامن (Async All the Way)**: يجب أن تكون السلسلة كاملة غير متزامنة، بدءاً من استدعاء وحدة التحكم وحتى عملية قراءة قاعدة البيانات.
- **استخدام `CancellationToken`**: يتيح إيقاف استعلام قاعدة البيانات فوراً إذا قام المستخدم بإغلاق المتصفح أو إلغاء الطلب، مما يوفر موارد السيرفر وقاعدة البيانات.
```

---

## 6. Acceptance Criteria Checklist for 0 Errors and 0 Warnings

To ensure `dotnet restore && dotnet build` produces **0 errors and 0 warnings**, verify the following checklist:

### A. Compiler Build Verification
- [ ] `dotnet build` executes with `Build succeeded`
- [ ] Exit code is `0`
- [ ] Output displays `0 Warning(s)`
- [ ] Output displays `0 Error(s)`

### B. Compilation Warning Prevention (Specific Roslyn Diagnostics)
- [ ] **CS1998 Prevention**: Every method declared `async` contains at least one `await` expression.
  - Specifically in `AdminController.Create()` (GET): ensure `await Task.CompletedTask;` is used if returning `View(new Story())`, OR keep it non-async if permissible. *Recommendation*: Include `await Task.CompletedTask;` to satisfy the universal async requirement R4 without triggering CS1998.
- [ ] **CS8600 / CS8602 / CS8604 / CS8618 (Nullability Warnings)**:
  - `<Nullable>enable</Nullable>` is enabled in `.csproj`.
  - In `MongoDbSettings.cs`, properties must be nullable: `string? ConnectionString`, `string? DatabaseName`.
  - In controllers, null check results of `FirstOrDefaultAsync(...)` before accessing entity members.
  - In `AccountController.Update`, safeguard `existingAccount.Children = model.Children ?? [];`.
- [ ] **CS1001 / CS1002 Syntax Errors**:
  - Delete line 23 in `AccountController.cs` (`_mongoDbContext.`).
- [ ] **CS1520 / CS0542 Member/Constructor Errors**:
  - Rename `AccountService(...)` constructor in `AccountController.cs` to `AccountController(...)`.
- [ ] **CS0246 Missing Types/Namespaces**:
  - Ensure `using SuperKayyem.Services;` and `using Microsoft.EntityFrameworkCore;` are imported in all three controllers.

### C. Dependency & Lifetime Cleanliness
- [ ] Exactly one registration of `MongoDbContext` in `Program.cs` via `AddDbContext<MongoDbContext>(...)`.
- [ ] `builder.Services.AddSingleton<MongoDbContext>();` is deleted.
- [ ] `builder.Services.AddSingleton<IStoryService, StoryService>();` is deleted.
- [ ] `Services/IStoryService.cs` is deleted.
- [ ] `Services/StoryService.cs` is deleted.
- [ ] Zero references to `IStoryService` or `StoryService` anywhere in the codebase.
- [ ] `server/Templates/` remains completely untouched.

### D. Route & Contract Conformance
- [ ] `GET /api/stories` returns `200 OK` with JSON array of stories.
- [ ] `GET /api/stories/{id}` returns `200 OK` with JSON story or `404 Not Found`.
- [ ] `POST /api/stories` creates and returns `201 CreatedAtAction`.
- [ ] `PUT /api/stories/{id}` updates and returns `200 OK` or `204 NoContent`.
- [ ] `DELETE /api/stories/{id}` removes and returns `204 NoContent`.
- [ ] `AdminController` retains all 8 MVC actions returning `View(...)` or `RedirectToAction(...)`.
- [ ] `AccountController` retains all 6 actions (`AccountList`, `Read`, `Update` [GET], `Update` [POST], `Delete` [GET], `DeleteConfirmed` [POST]).
- [ ] `[ValidateAntiForgeryToken]` decorated on all MVC POST actions.

### E. Documentation Conformance
- [ ] `server/CHANGES_AR.md` exists and is fully populated with all three Arabic sections.

---

## 7. Concrete Implementation Blueprints for Controllers

To accelerate the implementation phase and guarantee 0 warnings/errors, the following blueprints are provided for the implementer:

### 7.1 `server/Services/MongoDbSettings.cs`
```csharp
namespace SuperKayyem.Services
{
    public class MongoDbSettings
    {
        public string? ConnectionString { get; set; }
        public string? AtlasURI { get => ConnectionString; set => ConnectionString = value; }
        public string? DatabaseName { get; set; }
    }
}
```

### 7.2 `server/Program.cs` (Updated Configuration & DI Registrations)
```csharp
using SuperKayyem.Models;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Services;

var builder = WebApplication.CreateBuilder(args);

// Add MVC with Views + API Controllers
builder.Services.AddControllersWithViews();

// Read MongoDB configuration settings from appsettings.json
var mongoDbSettings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));

// Register MongoDbContext with Scoped lifetime (standard for EF Core DbContext)
builder.Services.AddDbContext<MongoDbContext>(options => 
    options.UseMongoDB(
        mongoDbSettings?.ConnectionString ?? "", 
        mongoDbSettings?.DatabaseName ?? "SuperKayyemDb"));

// Configure CORS for frontend clients
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173",
                  "http://localhost:3000",
                  "http://localhost:5080"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Admin/Error");
    app.UseHsts();
}

app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowFrontend");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Admin}/{action=Index}/{id?}");

app.MapControllers();

app.Run();
```

### 7.3 `server/Controllers/StoriesController.cs`
```csharp
namespace SuperKayyem.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;
using SuperKayyem.Services;

[ApiController]
[Route("api/[controller]")]
public class StoriesController : ControllerBase
{
    private readonly MongoDbContext _context;
    private readonly ILogger<StoriesController> _logger;

    public StoriesController(MongoDbContext context, ILogger<StoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // جلب جميع القصص من قاعدة البيانات مع تعبئة البيانات الأولية تلقائياً إذا كانت فارغة
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Story>>> GetAll(CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching all stories");
        var stories = await _context.Stories.ToListAsync(ct);
        if (!stories.Any())
        {
            var seedStories = SeedData.GetStories();
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }
        return Ok(stories);
    }

    // جلب قصة محددة بواسطة المعرف
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching story with identifier: {StoryId}", id);
        if (!int.TryParse(id, out int storyId))
        {
            _logger.LogWarning("Invalid story ID format: {StoryId}", id);
            return NotFound(new { error = "Story not found" });
        }

        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == storyId, ct);
        if (story == null)
        {
            _logger.LogWarning("Story with ID {StoryId} not found", storyId);
            return NotFound(new { error = "Story not found" });
        }

        return Ok(story);
    }

    // إضافة قصة جديدة إلى قاعدة البيانات
    [HttpPost]
    public async Task<ActionResult<Story>> Create([FromBody] Story story, CancellationToken ct = default)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (story.Id == 0)
        {
            var maxId = await _context.Stories.AnyAsync(ct)
                ? await _context.Stories.MaxAsync(s => s.Id, ct)
                : 0;
            story.Id = maxId + 1;
        }

        if (string.IsNullOrWhiteSpace(story.Slug) && !string.IsNullOrWhiteSpace(story.Title))
        {
            story.Slug = story.Title.Replace(' ', '-').ToLowerInvariant();
        }

        if (story.CreatedAt == default)
        {
            story.CreatedAt = DateTime.UtcNow;
        }

        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Created new story with ID {StoryId}", story.Id);
        return CreatedAtAction(nameof(GetById), new { id = story.Id.ToString() }, story);
    }

    // تحديث بيانات قصة موجودة
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Story story, CancellationToken ct = default)
    {
        if (id != story.Id && story.Id != 0)
        {
            return BadRequest(new { error = "Mismatched story identifier" });
        }

        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        existing.Title = story.Title;
        existing.Slug = string.IsNullOrWhiteSpace(story.Slug)
            ? story.Title.Replace(' ', '-').ToLowerInvariant()
            : story.Slug;
        existing.Category = story.Category;
        existing.TargetAgeGroup = story.TargetAgeGroup;
        existing.Description = story.Description;
        existing.Price = story.Price;
        existing.Rating = story.Rating;
        existing.CoverImage = story.CoverImage;
        existing.PageCount = story.PageCount;
        existing.Pages = story.Pages;
        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Updated story with ID {StoryId}", id);
        return Ok(existing);
    }

    // حذف قصة من قاعدة البيانات
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Deleted story with ID {StoryId}", id);
        return NoContent();
    }
}
```

### 7.4 `server/Controllers/AdminController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;
using SuperKayyem.Services;

namespace SuperKayyem.Controllers;

public class AdminController : Controller
{
    private readonly MongoDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(MongoDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // عرض قائمة القصص في لوحة التحكم الإدارية
    public async Task<IActionResult> Index(CancellationToken ct = default)
    {
        var stories = await _context.Stories.ToListAsync(ct);
        if (!stories.Any())
        {
            var seedStories = SeedData.GetStories();
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }
        return View(stories);
    }

    // عرض تفاصيل قصة محددة
    public async Task<IActionResult> Details(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null) return NotFound();
        return View(story);
    }

    // عرض نموذج إنشاء قصة جديدة
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        await Task.CompletedTask;
        return View(new Story());
    }

    // حفظ القصة الجديدة في قاعدة البيانات
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Story story, CancellationToken ct = default)
    {
        if (!ModelState.IsValid) return View(story);

        if (story.Id == 0)
        {
            var maxId = await _context.Stories.AnyAsync(ct)
                ? await _context.Stories.MaxAsync(s => s.Id, ct)
                : 0;
            story.Id = maxId + 1;
        }

        if (string.IsNullOrWhiteSpace(story.Slug) && !string.IsNullOrWhiteSpace(story.Title))
        {
            story.Slug = story.Title.Replace(' ', '-').ToLowerInvariant();
        }

        if (story.CreatedAt == default)
        {
            story.CreatedAt = DateTime.UtcNow;
        }

        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story '{Title}' created.", story.Title);
        return RedirectToAction(nameof(Index));
    }

    // عرض نموذج تعديل قصة موجودة
    public async Task<IActionResult> Edit(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null) return NotFound();
        return View(story);
    }

    // حفظ التعديلات على القصة
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, Story story, CancellationToken ct = default)
    {
        if (id != story.Id) return BadRequest();
        if (!ModelState.IsValid) return View(story);

        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null) return NotFound();

        existing.Title = story.Title;
        existing.Slug = string.IsNullOrWhiteSpace(story.Slug)
            ? story.Title.Replace(' ', '-').ToLowerInvariant()
            : story.Slug;
        existing.Category = story.Category;
        existing.TargetAgeGroup = story.TargetAgeGroup;
        existing.Description = story.Description;
        existing.Price = story.Price;
        existing.Rating = story.Rating;
        existing.CoverImage = story.CoverImage;
        existing.PageCount = story.PageCount;
        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story '{Title}' (ID: {Id}) updated.", story.Title, id);
        return RedirectToAction(nameof(Index));
    }

    // عرض صفحة تأكيد حذف القصة
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null) return NotFound();
        return View(story);
    }

    // تنفيذ حذف القصة الفعلي
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null) return NotFound();

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story (ID: {Id}) deleted.", id);
        return RedirectToAction(nameof(Index));
    }
}
```

### 7.5 `server/Controllers/AccountController.cs`
```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Models;
using SuperKayyem.Services;

namespace SuperKayyem.Controllers
{
    public class AccountController : Controller
    {
        private readonly MongoDbContext _mongoDbContext;

        public AccountController(MongoDbContext mongoDbContext)
        {
            _mongoDbContext = mongoDbContext;
        }

        // عرض قائمة حسابات العملاء
        public async Task<IActionResult> AccountList(CancellationToken ct = default)
        {
            var accounts = await _mongoDbContext.Accounts.ToListAsync(ct);
            return View(accounts);
        }

        // تحويل المسار الافتراضي إلى قائمة الحسابات
        public async Task<IActionResult> Index(CancellationToken ct = default)
        {
            return await AccountList(ct);
        }

        // عرض تفاصيل حساب العميل
        public async Task<IActionResult> Read(int id, CancellationToken ct = default)
        {
            var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (account == null) return NotFound();
            return View(account);
        }

        // 1. عرض صفحة التعديل
        [HttpGet]
        public async Task<IActionResult> Update(int id, CancellationToken ct = default)
        {
            var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (account == null) return NotFound();

            return View(account);
        }

        // 2. حفظ التعديل
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Update(Account model, CancellationToken ct = default)
        {
            // نتجاهل التحقق من الـ Password لأنه لا يتم تعديله من هذه الصفحة
            ModelState.Remove(nameof(model.Password));

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var existingAccount = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == model.Id, ct);
            if (existingAccount == null)
            {
                return NotFound();
            }

            existingAccount.FirstName = model.FirstName;
            existingAccount.LastName = model.LastName;
            existingAccount.Email = model.Email;
            existingAccount.DateOfBirth = model.DateOfBirth;
            existingAccount.Gender = model.Gender;
            existingAccount.Children = model.Children ?? [];
            existingAccount.IsUpdated = true;
            existingAccount.UpdatedAt = DateTime.UtcNow;

            await _mongoDbContext.SaveChangesAsync(ct);
            return RedirectToAction(nameof(AccountList));
        }

        // 3. عرض صفحة تأكيد الحذف
        [HttpGet]
        public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
        {
            var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (account == null) return NotFound();

            return View(account);
        }

        // 4. تنفيذ الحذف الفعلي
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken ct = default)
        {
            var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (account != null)
            {
                _mongoDbContext.Accounts.Remove(account);
                await _mongoDbContext.SaveChangesAsync(ct);
            }

            return RedirectToAction(nameof(AccountList));
        }
    }
}
```
