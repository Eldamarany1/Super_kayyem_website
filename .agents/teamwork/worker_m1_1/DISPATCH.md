## 2026-10-05T18:51:04Z
You are Worker 1 (Backend Remediation & Implementation Worker).
Your identity:
- Archetype: worker
- Working directory: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\worker_m1_1
- Target codebase: F:\MK_DM_project\super-kayyem\Super_kayyem_website\server
- Authoritative request file: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\ORIGINAL_REQUEST.md
- Scope document: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\PROJECT.md
- Explorer Handoffs:
  - F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\explorer_survey_2\handoff.md
  - F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\explorer_survey_3\handoff.md
- Parent Orchestrator conversation ID: 1ed67a6a-39fa-4497-aec0-ddd776eca93e

MANDATORY FIRST STEP: Read F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\ORIGINAL_REQUEST.md and F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\PROJECT.md completely before writing any code.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusively Owned Files:
- `server/Services/MongoDbSettings.cs`
- `server/Program.cs`
- `server/Controllers/AccountController.cs`
- `server/Controllers/StoriesController.cs`
- `server/Controllers/AdminController.cs`
- Deletion of `server/Services/IStoryService.cs` and `server/Services/StoryService.cs`
- `server/CHANGES_AR.md`

Strict Boundaries:
- Do NOT touch `server/Templates/` (leave completely untouched).
- Do NOT touch `server/Models/` or `server/Data/SeedData.cs`.
- Do NOT touch `client/` or anything in the React frontend.

Detailed Tasks:
1. Fix `server/Services/MongoDbSettings.cs`:
   - Align property to `public string? ConnectionString { get; set; }`
   - Include compatibility alias: `public string? AtlasURI { get => ConnectionString; set => ConnectionString = value; }`
   - Keep `public string? DatabaseName { get; set; }`
2. Fix `server/Program.cs`:
   - Bind `MongoDbSettings` and use `mongoSettings?.ConnectionString ?? ""`
   - Remove duplicate `builder.Services.AddSingleton<MongoDbContext>();`
   - Remove `builder.Services.AddSingleton<IStoryService, StoryService>();`
   - Add inline comments documenting the DI registrations and why AddDbContext is used.
3. Fix & Modernize `server/Controllers/AccountController.cs`:
   - Rename constructor to `AccountController(MongoDbContext mongoDbContext)`
   - Remove the dangling code `_mongoDbContext.` on line 23.
   - Remove nonexistent `AccountSeedData.Accounts` reference; query `_mongoDbContext.Accounts` asynchronously.
   - Make all public actions async returning `Task<IActionResult>`, accepting `CancellationToken ct` where appropriate.
   - Add `[ValidateAntiForgeryToken]` on POST actions.
   - Include beginner-friendly inline comments on all public actions.
4. Rewrite `server/Controllers/StoriesController.cs`:
   - Inject `MongoDbContext` directly (remove `IStoryService`).
   - Implement full async REST CRUD:
     - `[HttpGet] GetAll(CancellationToken ct = default)`: returns all stories asynchronously. If empty, seed from `SeedData.GetStories()` and save changes.
     - `[HttpGet("{id}")] GetById(string id, CancellationToken ct = default)`: parse id, returns story or 404 NotFound.
     - `[HttpPost] Create([FromBody] Story story, CancellationToken ct = default)`: compute `nextId = stories.Any() ? stories.Max(s => s.Id) + 1 : 1`, generate `Slug`, add story, SaveChangesAsync, return CreatedAtAction.
     - `[HttpPut("{id}")] Update(int id, [FromBody] Story story, CancellationToken ct = default)`: find story, update fields, SaveChangesAsync, return NoContent or NotFound.
     - `[HttpDelete("{id}")] Delete(int id, CancellationToken ct = default)`: find story, remove, SaveChangesAsync, return NoContent or NotFound.
   - Inline comments on all public actions.
5. Rewrite `server/Controllers/AdminController.cs`:
   - Inject `MongoDbContext` directly (remove `IStoryService`).
   - Maintain all 8 actions: `Index`, `Details`, `Create` [GET], `Create` [POST], `Edit` [GET], `Edit` [POST], `Delete` [GET], `DeleteConfirmed` [POST].
   - Make ALL actions async returning `Task<IActionResult>` (including `Create()` GET: `return Task.FromResult<IActionResult>(View(new Story()));` or `await Task.Yield(); return View(new Story());`).
   - In `Index`, if stories collection is empty, auto-seed from `SeedData.GetStories()` so Razor view `@Model.Average(s => s.Rating)` never throws.
   - Retain all `[ValidateAntiForgeryToken]` and `[ActionName("Delete")]` attributes.
   - Inline comments on all public actions.
6. Delete `server/Services/IStoryService.cs` and `server/Services/StoryService.cs`.
7. Generate `server/CHANGES_AR.md`:
   - Write clear Arabic markdown with the 3 required sections:
     1. شرح مشكلة حزم الإعدادات والتهيئة (AtlasURI مقابل ConnectionString وتكرار تسجيل MongoDbContext في Program.cs) وكيف تم حلها.
     2. التغييرات في كل Controller (المقارنة بين النهج القديم والجديد لكل من StoriesController و AdminController و AccountController ودمج MongoDbContext مباشرة وحذف طبقة الخدمات).
     3. شرح مبسط لآلية async/await في C# وكيف تمنع حجب الخيوط (threads) للمبتدئين.
8. Build & Verification:
   - Run `dotnet restore && dotnet build` inside `F:\MK_DM_project\super-kayyem\Super_kayyem_website\server`.
   - Verify that the build completes with **0 errors and 0 warnings**.
9. Produce `report.md` and `handoff.md` in your working directory `F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\worker_m1_1`.
10. Send a completion message back to Parent Orchestrator (`1ed67a6a-39fa-4497-aec0-ddd776eca93e`) via `send_message`.
