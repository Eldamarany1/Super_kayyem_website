## 2026-11-02T10:35:38Z
This is a single self-contained fix; keep it small and focused. Refactor the SuperKayyem backend to MongoDB EF Core using a direct controller-to-DbContext architecture (no-services architecture) while preserving frontend compatibility for the SuperKayyem website.

Integrity mode: development

## Requirements

### R1. Remove Legacy Scaffolding & Services Layer
- Delete the entire `server/Services/` directory (`IStoryService.cs`, `StoryService.cs`).
- Delete the entire `server/Templates/` directory (`MongoDbContext.cs`, `IRepository.cs`, `MongoRepository.cs`, `IAuthService.cs`, `AuthService.cs`, `README.md`).

### R2. Direct MongoDB EF Core Architecture
- Install `MongoDB.EntityFrameworkCore` package in `server/SuperKayyem.csproj` matching the installed .NET SDK.
- Create `server/Models/MongoDBSettings.cs` with `AtlasURI` and `DatabaseName` properties under `SuperKayyem.Models`.
- Update `server/Models/Story.cs` with `StoryPageItem` owned entity configuration and `Story` model preserving `Id` as an integer.
- Create `server/Models/SuperKayyemDbContext.cs` inheriting from `DbContext` with `DbSet<Story> Stories`, configuring `entity.OwnsMany(s => s.Pages)`.
- In `server/Program.cs`, bind `MongoDBSettings` from configuration and register `SuperKayyemDbContext` with `options.UseMongoDB(...)`.
- Update `server/appsettings.json` and `server/appsettings.Development.json` with the `MongoDBSettings` configuration section.
- Inject `SuperKayyemDbContext` directly into `server/Controllers/StoriesController.cs` and implement all CRUD operations (`GetAll`, `GetById`, `Add`, `Edit`, `Delete`) and initial `SeedData` seeding directly in controller actions using EF Core.

### R3. Frontend Compatibility & Constraints
- Keep `public int Id { get; set; }` on `Story` so `/api/stories/{id}` continues to work with integer IDs expected by `client/src/pages/StoryPage.jsx`.
- Preserve `JsonNamingPolicy.CamelCase` and the `"AllowFrontend"` CORS policy in `server/Program.cs`.
- Do not modify any files inside the `client/` directory.
- Keep `server/Data/SeedData.cs` intact and unmodified.

### R4. Code Simplicity
- The code must not be complicated and must follow a simple basic coding style that a beginner can understand.

## Acceptance Criteria

### Code Structure & Architecture
- [ ] `server/Services/` directory no longer exists.
- [ ] `server/Templates/` directory no longer exists.
- [ ] `server/Data/SeedData.cs` remains intact and unmodified.
- [ ] `server/Models/` contains `MongoDBSettings.cs`, `Story.cs`, and `SuperKayyemDbContext.cs`.
- [ ] `server/Controllers/StoriesController.cs` directly uses `SuperKayyemDbContext` without intermediate service or repository classes.
- [ ] No files in `client/` are modified.

### Build & Verification
- [ ] `cd server && dotnet restore` succeeds.
- [ ] `cd server && dotnet build` succeeds with 0 errors.
