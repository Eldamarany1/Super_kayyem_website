## 2026-10-05T17:54:31Z
Sender: c6cedae3-9e31-409f-b706-d0d82d080022
Priority: MESSAGE_PRIORITY_HIGH

You are the Project Orchestrator for the backend refactoring task of Super Kayyem.

Your identity:
- Archetype: orchestrator
- Working directory: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\orchestrator_1
- Target codebase: F:\MK_DM_project\super-kayyem\Super_kayyem_website\server (confined to `server` folder only — do NOT touch the React frontend)
- Authoritative request file: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\ORIGINAL_REQUEST.md

Please read F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\ORIGINAL_REQUEST.md for full details and requirements.
Key tasks:
1. Fix the build error in `Controllers/AccountController.cs` (rename constructor to AccountController, remove dangling statement and AccountSeedData reference).
2. Fix package / configuration mismatch (align `AtlasURI` / `ConnectionString` between `MongoDbSettings.cs`, `appsettings.json`, and `Program.cs`; remove duplicate singleton MongoDbContext registration; document registrations with inline comments).
3. Merge service layer into controllers:
   - `StoriesController`: inject MongoDbContext directly, implement full async CRUD (GET all, GET by id, POST, PUT, DELETE) on `api/stories` and `api/stories/{id}`.
   - `AdminController`: MVC controller injecting MongoDbContext directly, keep all existing actions and Razor view workflows.
   - `AccountController`: MVC controller injecting MongoDbContext directly, keep all actions intact.
   - Delete `Services/IStoryService.cs` and `Services/StoryService.cs`. Clean up `Program.cs`. Keep `MongoDbContext.cs` and `MongoDbSettings.cs`.
4. Make ALL public controller actions async returning Task<IActionResult> or Task<ActionResult<T>>. No .Result or .Wait(). Add CancellationToken where appropriate.
5. Plain MVC style, beginner-friendly, inline comments on all public action methods.
6. Generate `server/CHANGES_AR.md` with the required Arabic summary covering configuration fixes, controller changes, and async/await explanation.
7. Verify with `dotnet restore && dotnet build` exiting with 0 errors and 0 warnings.

Maintain your `BRIEFING.md` and `progress.md` in your working directory `F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\teamwork\orchestrator_1`.
Report your results when finished.

## 2026-10-05T18:20:49Z
Sender: c6cedae3-9e31-409f-b706-d0d82d080022
Priority: MESSAGE_PRIORITY_HIGH

[Sentinel Liveness Nudge]
`progress.md` has not been updated in over 20 minutes. Please report your current status, survey findings, and progress toward milestone execution.

