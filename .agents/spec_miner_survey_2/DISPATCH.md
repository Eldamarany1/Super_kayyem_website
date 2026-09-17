## 2026-09-16T20:14:19Z

<USER_REQUEST>
You are a Spec Miner subagent conducting the specification requirements survey for the Super Kayyem full-stack refactoring.
Your working directory is F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\spec_miner_survey_2
MANDATORY: Read F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\ORIGINAL_REQUEST.md before starting work.
Investigate and extract exhaustive requirements:
1. All functional requirements R1 to R5 and map every single acceptance criterion.
2. Exact story specifications: 6 stories, 6 specific Arabic genres/categories (التعاون, الشجاعة, الصدق, المسؤولية, الصداقة, الصبر), required schema fields (id, title, slug, category, targetAgeGroup, description, price in EGP/ج.م, rating, coverImage, pageCount).
3. Exact API behavior for GET /api/stories and GET /api/stories/{id}, including 404 response on invalid id.
4. Inactive MongoDB scaffolding requirements in server/Templates/ and README.md, appsettings.json placeholder, NuGet package commented out.
5. Negative constraints: exact list of banned words, tokens, routes, files, imports (e.g. no axios, jwt-decode, react-pageflip, no SAR/ريال, zero dead code).
6. Visual/Theme requirements: Cairo font, RTL, dark/light theme toggle with localStorage persistence, breakpoints (320px, 768px, 1024px, 1440px).
Output a comprehensive report to F:\MK_DM_project\super-kayyem\Super_kayyem_website\.agents\spec_miner_survey_2\handoff.md and send a completion message with summary to the orchestrator.
</USER_REQUEST>
