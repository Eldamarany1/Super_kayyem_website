## 2026-09-16T20:26:49Z

You are the Backend & Environment Explorer for the Super Kayyem full-stack refactoring project.
Your Working Directory: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\survey_explorer_3
Orchestrator Conversation ID: d6113121-51cc-4a52-89c0-0ea5a3e37647

MANDATORY: You MUST read F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\ORIGINAL_REQUEST.md before starting work.

Your task:
1. Investigate the current system environment on this Windows machine:
   - Check dotnet CLI version (dotnet --version, dotnet --list-sdks). Note: The request specifies .NET 10. If .NET 10 preview or .NET 10 is installed, use net10.0 in .csproj. Check what SDKs are available (e.g. 10.0, 9.0, 8.0).
   - Check node and npm versions (node -v, npm -v).
2. Examine the existing SuperKayyem.Backend/ directory to confirm what needs to be deleted (note: ORIGINAL_REQUEST.md explicitly states: "Currently broken and throws errors on startup — do NOT attempt to fix; delete entirely and rebuild as a clean .NET 10 project").
3. Design the clean server/ architecture:
   - Solution file at project root: SuperKayyem.sln
   - server/ directory: Controllers/StoriesController.cs, Models/Story.cs, Services/StoryService.cs and IStoryService.cs, Data/SeedData.cs, Program.cs, appsettings.json, SuperKayyem.csproj.
   - CORS policy to allow client (e.g. http://localhost:5173 or all origins for development)
   - JSON serialization settings (camelCase)
   - In-memory static data service serving the 6 Arabic stories without any database dependencies
   - Templates directory structure in server/Templates/
4. Detail the exact commands to build and run the .NET server, and how the Vite client proxy should be configured in client/vite.config.js to forward /api requests to the .NET backend.
5. Write your findings and recommendations to F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\survey_explorer_3\handoff.md.
6. Send a message to orchestrator d6113121-51cc-4a52-89c0-0ea5a3e37647 with a concise summary and pointer to your handoff.md.
