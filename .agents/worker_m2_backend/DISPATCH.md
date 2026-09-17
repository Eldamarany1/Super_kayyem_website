# Dispatch — Worker M2 Backend

**Working Directory**: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\worker_m2_backend
**Role**: Worker for Milestone 2 (.NET 10 MVC Backend & Scaffolding)
**Parent**: Orchestrator (Conversation ID: 26420394-9c67-4e74-8355-a352847811c1)

## Mission
Build a clean, robust, production-ready ASP.NET Core (.NET 10 Web API) backend in `server/` with complete models, static in-memory seed data for 6 Arabic moral stories (EGP only), controllers, services, configuration, commented-out MongoDB templates, and successful `dotnet build` verification.

## Scope & Owned Files
You exclusively own `server/` and its contents:
- `server/SuperKayyem.csproj`
- `server/Program.cs`
- `server/appsettings.json`
- `server/appsettings.Development.json`
- `server/Properties/launchSettings.json`
- `server/Models/Story.cs`
- `server/Data/SeedData.cs`
- `server/Services/IStoryService.cs`
- `server/Services/StoryService.cs`
- `server/Controllers/StoriesController.cs`
- `server/Templates/README.md`
- `server/Templates/IRepository.cs`
- `server/Templates/MongoRepository.cs`
- `server/Templates/MongoDbContext.cs`
- `server/Templates/IAuthService.cs`
- `server/Templates/AuthService.cs`

DO NOT modify `client/` or `.agents/` outside your working directory.

## Technical Specifications
1. **Target Framework**: `net10.0` in `SuperKayyem.csproj`.
   Ensure `<TargetFramework>net10.0</TargetFramework>`, `<Nullable>enable</Nullable>`, `<ImplicitUsings>enable</ImplicitUsings>`.
2. **Program.cs**:
   - Add Controllers with System.Text.Json camelCase naming option.
   - Configure CORS allowing `http://localhost:5173` (Vite default), `http://localhost:3000`, `http://localhost:5080`.
   - Register `IStoryService, StoryService` in DI as Singleton or Scoped.
   - MapControllers.
3. **Properties/launchSettings.json**:
   - `applicationUrl`: `http://localhost:5080`.
4. **appsettings.json**:
   - Standard logging and ASP.NET configuration.
   - Include a `"MongoDb"` section with an empty `ConnectionString`: `""` and `DatabaseName`: `"SuperKayyemDb"`.
5. **Models/Story.cs**:
   - `int Id`
   - `string Title`
   - `string Slug`
   - `string Category` (and `string ValueLearned => Category` for compatibility)
   - `string TargetAgeGroup`
   - `string Description`
   - `decimal Price`
   - `double Rating`
   - `string CoverImage` (and `string CoverImageUrl => CoverImage` for compatibility)
   - `int PageCount`
6. **Data/SeedData.cs**:
   - Exactly 6 authentic, rich Arabic stories covering the 6 required categories:
     1. `التعاون` (Cooperation): باسم ومسبار الأمل
     2. `الشجاعة` (Courage): سر اللؤلؤة الزرقاء
     3. `الصدق` (Honesty): خريطة الشجرة العتيقة
     4. `المسؤولية` (Responsibility): حارس الواحة الصغير
     5. `الصداقة` (Friendship): جسر النجوم الدافئ
     6. `الصبر` (Patience): بذرة الحكمة العجيبة
   - Prices in Egyptian Pounds (ج.م) only (e.g. 35.00, 40.00, 45.00, etc.). ABSOLUTELY ZERO mentions of `SAR`, `ريال`, `ر.س`.
7. **Services/IStoryService.cs & StoryService.cs**:
   - `Task<IEnumerable<Story>> GetAllStoriesAsync()`
   - `Task<Story?> GetStoryByIdAsync(int id)`
   - Implementation uses in-memory list from `SeedData`.
8. **Controllers/StoriesController.cs**:
   - `[ApiController]`, `[Route("api/[controller]")]`
   - `[HttpGet]`: returns 200 OK with all 6 stories.
   - `[HttpGet("{id:int}")]:` returns 200 OK with story if found; 404 Not Found (`new { error = "Story not found" }`) if not found.
9. **server/Templates/**:
   - `README.md` explaining MongoDB and JWT auth activation steps.
   - `IRepository.cs`, `MongoRepository.cs`, `MongoDbContext.cs`, `IAuthService.cs`, `AuthService.cs`.
   - ALL template C# files MUST have their class/interface code fully commented out (e.g. with `/* ... */`) so the backend builds without MongoDB or JWT packages installed.
10. **Build Verification**:
    - Run `dotnet build server/SuperKayyem.csproj` and `dotnet build SuperKayyem.sln` to confirm 0 errors.

## Handoff Requirements
Write your progress to `progress.md` in your directory and write a complete handoff report to `handoff.md` with build logs and verification results.

## 2026-09-17T02:10:46Z
Mission:
Build the ASP.NET Core (.NET 10 Web API) backend in server/:
1. Create server/SuperKayyem.csproj targeting net10.0.
2. Create server/Program.cs with CORS policy, camelCase JSON naming, Controller mapping, and DI registration.
3. Create server/Properties/launchSettings.json setting applicationUrl to http://localhost:5080.
4. Create server/appsettings.json and appsettings.Development.json with MongoDb section containing empty ConnectionString.
5. Create server/Models/Story.cs with Id, Title, Slug, Category, TargetAgeGroup, Description, Price (decimal), Rating, CoverImage, PageCount, plus compatibility aliases.
6. Create server/Data/SeedData.cs with exactly 6 authentic Arabic moral stories covering the 6 required categories (التعاون, الشجاعة, الصدق, المسؤولية, الصداقة, الصبر) with Egyptian Pounds (ج.م) only (no SAR/ريال/ر.س anywhere).
7. Create server/Services/IStoryService.cs and server/Services/StoryService.cs returning seed stories.
8. Create server/Controllers/StoriesController.cs with GET /api/stories and GET /api/stories/{id} (404 with error message if not found).
9. Create server/Templates/ with README.md, IRepository.cs, MongoRepository.cs, MongoDbContext.cs, IAuthService.cs, AuthService.cs (all code commented out so build succeeds without MongoDB).
10. Run `dotnet build server/SuperKayyem.csproj` and `dotnet build SuperKayyem.sln` to verify clean build with 0 errors.
11. Write progress.md and handoff.md in your working directory.
12. Send a message to parent when done.

