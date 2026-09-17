## 2026-09-16T20:26:49Z

You are the Specification Miner for the Super Kayyem full-stack refactoring project.
Your Working Directory: F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\survey_spec_miner_2
Orchestrator Conversation ID: d6113121-51cc-4a52-89c0-0ea5a3e37647

MANDATORY: You MUST read F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\ORIGINAL_REQUEST.md before starting work.

Your task:
1. Mine and enumerate all functional and non-functional requirements from ORIGINAL_REQUEST.md (Requirements R1 through R5).
2. Detail the exact specifications for the 6 complete Arabic moral stories:
   - Required categories: التعاون (Cooperation), الشجاعة (Courage), الصدق (Honesty), المسؤولية (Responsibility), الصداقة (Friendship), الصبر (Patience).
   - Required fields for each story: id, title, slug, category, targetAgeGroup, description (2-3 sentences in Arabic), price (in EGP ج.م), rating, coverImage, pageCount.
   - Endpoint behavior: GET /api/stories (returns 6 stories array), GET /api/stories/{id} (returns 200 with story or 404 for invalid id).
3. Detail the inactive MongoDB scaffolding templates required in server/Templates/:
   - IRepository<T> and MongoRepository<T> (commented out)
   - MongoDbContext class with collection accessors and appsettings.json placeholder
   - IAuthService and AuthService stubs with JWT token generation and password hashing stubs (commented out)
   - Commented-out MongoDB.Driver package reference in .csproj
   - README.md in server/Templates/ explaining how to activate each piece
4. Enumerate all Acceptance Criteria across:
   - Build & Lint (npm run build, npm run lint, dotnet build, dotnet run)
   - API Response Verification
   - No Dead Code (grep rules, file existence checks)
   - Architecture & Directory Layout
   - Stories data rules (currency in EGP, no SAR/ريال)
   - Visual & Functional rules (RTL, Cairo font, theme toggle persistence, 3 navigable routes: /, /library, /story/:id)
5. Write your complete specifications report to F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\survey_spec_miner_2\handoff.md.
6. Send a message to orchestrator d6113121-51cc-4a52-89c0-0ea5a3e37647 with a concise summary and pointer to your handoff.md.
