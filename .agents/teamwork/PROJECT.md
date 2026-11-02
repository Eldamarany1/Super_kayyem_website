# Project: Super Kayyem Backend Refactoring & Remediation

## Architecture
- **Framework**: ASP.NET Core 10.0 (.NET 10)
- **Database**: MongoDB Atlas via `MongoDB.EntityFrameworkCore` 10.0.4 + `MongoDB.Driver` 3.12.0
- **Architectural Style**: Plain MVC / Web API without intermediary service layer. Controllers directly inject scoped `MongoDbContext`.
- **Target Boundary**: `server/` directory only. Frontend `client/` is strictly out-of-scope and untouched.
- **Data Flow**:
  - Web API: `client` -> `/api/stories` -> `StoriesController` -> `MongoDbContext.Stories` -> MongoDB Atlas
  - Admin Razor MVC: Admin user -> `/Admin/*` -> `AdminController` -> `MongoDbContext.Stories` -> Razor Views (`server/Views/Admin/`)
  - Account MVC: `/Account/*` -> `AccountController` -> `MongoDbContext.Accounts` -> Razor Views

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | AccountController build fix | Rename constructor to AccountController, remove dangling statement on line 23, remove AccountSeedData reference | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Config key alignment | Align ConnectionString and AtlasURI between appsettings.json, MongoDbSettings.cs, and Program.cs | M1 | ORIGINAL_REQUEST §R2 |
| 3 | Remove duplicate DI registration | Remove AddSingleton<MongoDbContext>() in Program.cs, retain AddDbContext with inline explanation comments | M1 | ORIGINAL_REQUEST §R2 |
| 4 | Clean Program.cs DI | Remove IStoryService/StoryService registrations from Program.cs | M1 | ORIGINAL_REQUEST §R2 |
| 5 | StoriesController Direct DbContext Async CRUD | Full async REST endpoints (GET all, GET by id, POST, PUT, DELETE) on api/stories directly using MongoDbContext.Stories | M1 | ORIGINAL_REQUEST §R3, §R4 |
| 6 | AdminController Direct DbContext MVC Actions | Rewrite AdminController to inject MongoDbContext directly, keep all 8 actions, make async, maintain Razor view compatibility | M1 | ORIGINAL_REQUEST §R3, §R4 |
| 7 | AccountController Direct DbContext MVC Actions | Rewrite AccountController to inject MongoDbContext directly, keep all actions, make async | M1 | ORIGINAL_REQUEST §R3, §R4 |
| 8 | Delete Service Layer Files | Delete Services/IStoryService.cs and Services/StoryService.cs | M1 | ORIGINAL_REQUEST §R3 |
| 9 | Preserve Infrastructure & Templates | Keep MongoDbContext.cs, MongoDbSettings.cs, and leave Templates/ untouched | M1 | ORIGINAL_REQUEST §R3 |
| 10 | Async/Await & CancellationToken | Ensure 100% of public controller actions return Task<IActionResult> or Task<ActionResult<T>> with no .Result/.Wait() | M1 | ORIGINAL_REQUEST §R4 |
| 11 | Beginner-friendly Code Style & Inline Comments | Plain MVC style with clear inline comments on every public action method | M1 | ORIGINAL_REQUEST §R5 |
| 12 | Arabic Documentation CHANGES_AR.md | Comprehensive Arabic explanation covering config fixes, controller changes, and async/await fundamentals | M1 | ORIGINAL_REQUEST §R6 |
| 13 | Final Build & Integrity Verification | dotnet restore && dotnet build exits with 0 errors and 0 warnings, verified by Reviewer, Challenger, and Forensic Auditor | M1 | ORIGINAL_REQUEST Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Complete Backend Remediation & Refactoring | Full remediation of build errors, config alignment, service layer elimination, async CRUD controllers, CHANGES_AR.md, and 0-warning build | none | IN_PROGRESS |

## Interface Contracts
### Program.cs ↔ MongoDbSettings.cs
- `MongoDbSettings` class exposes `public string? ConnectionString { get; set; }` and `public string? AtlasURI { get => ConnectionString; set => ConnectionString = value; }`
- `appsettings.json` has `MongoDbSettings: { ConnectionString: "...", DatabaseName: "..." }`
- `Program.cs` binds `MongoDbSettings` and registers `MongoDbContext` via `AddDbContext<MongoDbContext>(options => options.UseMongoDB(mongoSettings?.ConnectionString ?? "", mongoSettings?.DatabaseName ?? ""))`
- No `AddSingleton<MongoDbContext>()` or service layer registrations.

### StoriesController ↔ Web API Consumers
- `GET /api/stories`: returns `200 OK` with `IEnumerable<Story>` (auto-seeds from `SeedData.GetStories()` if DB is empty)
- `GET /api/stories/{id}`: returns `200 OK` with `Story` or `404 Not Found`
- `POST /api/stories`: accepts `[FromBody] Story story`, generates integer `Id = max(Id) + 1`, generates `Slug`, returns `201 CreatedAtAction`
- `PUT /api/stories/{id}`: accepts `int id, [FromBody] Story story`, updates fields, returns `204 NoContent` or `404 Not Found`
- `DELETE /api/stories/{id}`: accepts `int id`, soft or hard deletes, returns `204 NoContent` or `404 Not Found`

### AdminController ↔ Razor Views
- `Index()`: `GET /Admin` -> `Task<IActionResult>`, returns `View(stories)` (seeding fallback if empty so `@Model.Average()` never throws)
- `Details(int id)`: `GET /Admin/Details/{id}` -> returns `View(story)`
- `Create()`: `GET /Admin/Create` -> returns `View(new Story())`
- `Create(Story story)`: `POST /Admin/Create` `[ValidateAntiForgeryToken]` -> creates story, redirects to `Index`
- `Edit(int id)`: `GET /Admin/Edit/{id}` -> returns `View(story)`
- `Edit(int id, Story story)`: `POST /Admin/Edit/{id}` `[ValidateAntiForgeryToken]` -> updates story, redirects to `Index`
- `Delete(int id)`: `GET /Admin/Delete/{id}` -> returns `View(story)`
- `DeleteConfirmed(int id)`: `POST /Admin/Delete/{id}` `[ActionName("Delete")]` `[ValidateAntiForgeryToken]` -> removes story, redirects to `Index`

### AccountController ↔ Razor Views
- `AccountList()`: `GET /Account/AccountList` -> returns `View(accounts)`
- `Index()`: `GET /Account` -> returns `View(accounts)` or redirects to `AccountList`
- `Read(int id)`: `GET /Account/Read/{id}` -> returns `View(account)`
- `Update(int id)`: `GET /Account/Update/{id}` -> returns `View(account)`
- `Update(Account model)`: `POST /Account/Update` `[ValidateAntiForgeryToken]` -> updates account, redirects to `AccountList`
- `Delete(int id)`: `GET /Account/Delete/{id}` -> returns `View(account)`
- `DeleteConfirmed(int id)`: `POST /Account/Delete/{id}` `[ActionName("Delete")]` `[ValidateAntiForgeryToken]` -> removes account, redirects to `AccountList`

## Code Layout
- `server/SuperKayyem.csproj`: Project file (.NET 10.0)
- `server/appsettings.json`: Configuration settings
- `server/Program.cs`: Entry point and service configuration
- `server/Services/MongoDbSettings.cs`: Settings model for MongoDB
- `server/Services/MongoDbContext.cs`: EF Core DbContext for MongoDB (kept intact)
- `server/Controllers/StoriesController.cs`: REST API controller
- `server/Controllers/AdminController.cs`: MVC controller for admin Razor views
- `server/Controllers/AccountController.cs`: MVC controller for account Razor views
- `server/Data/SeedData.cs`: Seed data for stories (kept intact)
- `server/Models/`: Entity models (Story, Account, BaseEntity) (kept intact)
- `server/Templates/`: Template files (strictly kept untouched)
- `server/CHANGES_AR.md`: Generated Arabic documentation summary
