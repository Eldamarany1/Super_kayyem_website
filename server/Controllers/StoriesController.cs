namespace SuperKayyem.Controllers;

using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;

public class StoriesController : Controller
{
    private readonly SuperKayyemDbContext _context;
    private readonly ILogger<StoriesController> _logger;
    private readonly Cloudinary _cloudinary;

    public StoriesController(SuperKayyemDbContext context, ILogger<StoriesController> logger, Cloudinary cloudinary)
    {
        _context = context;
        _logger = logger;
        _cloudinary = cloudinary;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (User.IsInRole("SuperAdmin"))
        {
            try
            {
                ViewBag.PendingRequestsCount = await _context.AdminUsers.CountAsync(u => u.Status == "Pending");
            }
            catch
            {
                // Fallback
            }
        }
        await base.OnActionExecutionAsync(context, next);
    }

    // ============================================================
    // Public REST API Endpoints (For React Client & Mobile)
    // ============================================================

    // GET: /api/stories
    [AllowAnonymous]
    [HttpGet("/api/stories")]
    public async Task<ActionResult<IEnumerable<Story>>> GetAll(CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching all stories");
        var stories = await _context.Stories.ToListAsync(ct);

        if (!stories.Any())
        {
            _logger.LogInformation("Database is empty. Seeding initial stories from SeedData");
            var seedStories = SeedData.GetStories();
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }

        bool needsUpdate = false;
        foreach (var s in stories)
        {
            if (!s.TargetAge.HasValue)
            {
                s.TargetAge = s.Id switch
                {
                    1 => 6,
                    2 => 4,
                    3 => 8,
                    4 => 6,
                    5 => 4,
                    6 => 8,
                    7 => 8,
                    8 => 7,
                    _ => 6
                };
                needsUpdate = true;
            }
        }
        if (needsUpdate)
        {
            await _context.SaveChangesAsync(ct);
        }

        return Ok(stories);
    }

    // GET: /api/stories/{id}
    [AllowAnonymous]
    [HttpGet("/api/stories/{id:int}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching story with ID: {Id}", id);
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Story with ID {Id} not found", id);
            return NotFound(new { error = "Story not found" });
        }

        return Ok(story);
    }

    // GET: /api/stories/{id}/pdf
    [AllowAnonymous]
    [HttpGet("/api/stories/{id:int}/pdf")]
    public async Task<IActionResult> GetStoryPdf(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == id, ct);

        if (story == null || string.IsNullOrWhiteSpace(story.PdfUrl))
        {
            return NotFound(new { error = "PDF not found for this story" });
        }

        try
        {
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(story.PdfUrl, ct);
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, new { error = "Failed to fetch PDF from storage" });
            }

            var pdfBytes = await response.Content.ReadAsByteArrayAsync(ct);
            Response.Headers["Content-Disposition"] = $"inline; filename=\"story-{id}.pdf\"";
            return File(pdfBytes, "application/pdf");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error streaming PDF for story {StoryId}", id);
            return StatusCode(500, new { error = "Could not stream PDF file" });
        }
    }

    // POST: /api/stories
    [AllowAnonymous]
    [HttpPost("/api/stories")]
    public async Task<IActionResult> Add([FromForm] Story story, IFormFile? pdfFile, IFormFile? imageFile, CancellationToken ct = default)
    {
        if (story == null)
        {
            return BadRequest(new { error = "Invalid story data" });
        }

        bool hasStories = await _context.Stories.AnyAsync(ct);
        int nextId = hasStories ? (await _context.Stories.MaxAsync(s => s.Id, ct)) + 1 : 1;
        story.Id = nextId;

        if (string.IsNullOrWhiteSpace(story.Slug))
        {
            story.Slug = !string.IsNullOrWhiteSpace(story.Title)
                ? story.Title.Replace(' ', '-').ToLowerInvariant()
                : $"story-{nextId}";
        }

        story.Pages ??= [];
        story.CreatedAt = DateTime.UtcNow;
        story.Rating = null;

        if (imageFile != null && imageFile.Length > 0)
        {
            using var stream = imageFile.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(imageFile.FileName, stream),
                Folder = "super_kayyem/covers"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            story.CoverImage = uploadResult.SecureUrl.ToString();
        }

        if (pdfFile != null && pdfFile.Length > 0)
        {
            using var pdfStream = pdfFile.OpenReadStream();
            var cleanFileName = Path.GetFileNameWithoutExtension(pdfFile.FileName).Replace(" ", "_");
            var rawParams = new RawUploadParams
            {
                File = new FileDescription(pdfFile.FileName, pdfStream),
                Folder = "super_kayyem/pdfs",
                PublicId = $"{cleanFileName}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.pdf"
            };

            var pdfResult = await _cloudinary.UploadAsync(rawParams);
            if (pdfResult.SecureUrl != null)
            {
                story.PdfUrl = pdfResult.SecureUrl.ToString();
            }
        }

        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = story.Id }, story);
    }

    // PUT: /api/stories/{id}
    [AllowAnonymous]
    [HttpPut("/api/stories/{id:int}")]
    public async Task<IActionResult> ApiEdit(int id, [FromForm] Story story, IFormFile? imageFile, IFormFile? pdfFile, CancellationToken ct = default)
    {
        if (story == null || id != story.Id)
        {
            return BadRequest(new { error = "Invalid story data" });
        }

        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        existing.Title = story.Title;
        existing.Slug = string.IsNullOrWhiteSpace(story.Slug) ? existing.Slug : story.Slug;
        existing.Category = story.Category;
        existing.TargetAge = story.TargetAge;
        existing.Description = story.Description;
        existing.Price = story.Price;
        existing.PageCount = story.PageCount;

        if (imageFile != null && imageFile.Length > 0)
        {
            using var stream = imageFile.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(imageFile.FileName, stream),
                Folder = "super_kayyem/covers"
            };
            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            existing.CoverImage = uploadResult.SecureUrl.ToString();
        }

        if (pdfFile != null && pdfFile.Length > 0)
        {
            using var pdfStream = pdfFile.OpenReadStream();
            var cleanFileName = Path.GetFileNameWithoutExtension(pdfFile.FileName).Replace(" ", "_");
            var rawParams = new RawUploadParams
            {
                File = new FileDescription(pdfFile.FileName, pdfStream),
                Folder = "super_kayyem/pdfs",
                PublicId = $"{cleanFileName}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.pdf"
            };
            var pdfResult = await _cloudinary.UploadAsync(rawParams);
            if (pdfResult.SecureUrl != null)
            {
                existing.PdfUrl = pdfResult.SecureUrl.ToString();
            }
        }

        if (story.Pages != null)
        {
            existing.Pages = story.Pages;
        }

        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        return Ok(existing);
    }

    // DELETE: /api/stories/{id}
    [AllowAnonymous]
    [HttpDelete("/api/stories/{id:int}")]
    public async Task<IActionResult> ApiDelete(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound(new { error = "Story not found" });
        }

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync(ct);
        return Ok(new { message = "Story deleted successfully" });
    }

    // POST: /api/stories/{id}/rate
    [AllowAnonymous]
    [HttpPost("/api/stories/{id:int}/rate")]
    public async Task<IActionResult> RateStory(int id, [FromBody] RateStoryDto? dto, CancellationToken ct = default)
    {
        if (dto == null)
        {
            return BadRequest(new { error = "بيانات التقييم غير صالحة" });
        }

        double score = dto.Score ?? dto.Rating ?? 0;
        if (score < 1 || score > 5)
        {
            return BadRequest(new { error = "التقييم يجب أن يكون بين 1 و 5 نجوم" });
        }

        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound(new { error = "القصة غير موجودة" });
        }

        string accountName = dto.AccountName?.Trim() ?? "";
        if (dto.AccountId > 0)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == dto.AccountId, ct);
            if (account != null)
            {
                if (string.IsNullOrWhiteSpace(accountName))
                {
                    accountName = $"{account.FirstName} {account.LastName}".Trim();
                }

                account.OwnedStoryIds ??= [];
                if (!account.OwnedStoryIds.Contains(id))
                {
                    account.OwnedStoryIds.Add(id);
                    account.IsUpdated = true;
                    account.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(accountName))
        {
            accountName = "قارئ سوبر قيم";
        }

        story.Ratings ??= [];
        var existingRating = dto.AccountId > 0
            ? story.Ratings.FirstOrDefault(r => r.AccountId == dto.AccountId)
            : null;

        if (existingRating != null)
        {
            existingRating.Score = score;
            existingRating.AccountName = accountName;
            existingRating.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            story.Ratings.Add(new StoryRating
            {
                AccountId = dto.AccountId,
                AccountName = accountName,
                Score = score,
                CreatedAt = DateTime.UtcNow
            });
        }

        story.Rating = Math.Round(story.Ratings.Average(r => r.Score), 1);
        story.IsUpdated = true;
        story.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story {StoryId} rated with score {Score} by account {AccountId}", id, score, dto.AccountId);

        return Ok(new
        {
            success = true,
            message = "تم تسجيل تقييمك بنجاح! ⭐",
            rating = story.Rating,
            ratingsCount = story.Ratings.Count,
            userScore = score
        });
    }

    // ============================================================
    // Admin Razor Views CRUD Operations
    // ============================================================

    // GET: /Stories or /Stories/Index
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpGet("/Stories")]
    [HttpGet("/Stories/Index")]
    public async Task<IActionResult> Index(string? search = null, string? category = null, CancellationToken ct = default)
    {
        var query = _context.Stories.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(st => st.Title.Contains(s) || st.Description.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(st => st.Category == category);
        }

        var stories = await query.ToListAsync(ct);

        if (!stories.Any() && string.IsNullOrWhiteSpace(search) && string.IsNullOrWhiteSpace(category))
        {
            var seedStories = SeedData.GetStories();
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }

        ViewBag.Search = search;
        ViewBag.Category = category;
        return View(stories);
    }

    // GET: /Stories/Details/{id}
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpGet("/Stories/Details/{id:int}")]
    public async Task<IActionResult> Details(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound();
        }
        return View(story);
    }

    private static List<StoryPageItem> ExtractPagesFromForm(HttpRequest request)
    {
        var extracted = new List<StoryPageItem>();
        if (!request.HasFormContentType)
        {
            return extracted;
        }

        int index = 0;
        while (request.Form.ContainsKey($"Pages[{index}].Content") || request.Form.ContainsKey($"Pages[{index}].PageNum"))
        {
            var content = request.Form[$"Pages[{index}].Content"].ToString();
            var headline = request.Form[$"Pages[{index}].Headline"].ToString();
            var separatorStr = request.Form[$"Pages[{index}].HasSeparator"].ToString();
            var illUrl = request.Form[$"Pages[{index}].IllustrationUrl"].ToString();

            bool hasSeparator = bool.TryParse(separatorStr, out bool sep) && sep;
            if (!hasSeparator && separatorStr.Equals("true", StringComparison.OrdinalIgnoreCase))
            {
                hasSeparator = true;
            }

            if (!string.IsNullOrWhiteSpace(content))
            {
                extracted.Add(new StoryPageItem
                {
                    PageNum = index + 1,
                    Headline = string.IsNullOrWhiteSpace(headline) ? null : headline.Trim(),
                    HasSeparator = hasSeparator,
                    Content = content.Trim(),
                    IllustrationUrl = string.IsNullOrWhiteSpace(illUrl) ? null : illUrl.Trim()
                });
            }
            index++;
        }

        return extracted;
    }

    // GET: /Stories/Create
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpGet("/Stories/Create")]
    public IActionResult Create()
    {
        return View(new Story());
    }

    // POST: /Stories/Create
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpPost("/Stories/Create")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Story story, string? contentMode = null, IFormFile? imageFile = null, IFormFile? pdfFile = null, List<IFormFile>? pageImages = null, List<StoryPageItem>? pages = null, CancellationToken ct = default)
    {
        contentMode = contentMode?.Trim().ToLowerInvariant() ?? "";

        if (string.IsNullOrWhiteSpace(contentMode))
        {
            ModelState.AddModelError("ContentMode", "طريقة إدخال محتوى القصة إجبارية. يرجى الاختيار بين رفع PDF أو كتابة الصفحات عبر المحرر.");
        }
        else if (contentMode == "pdf")
        {
            ModelState.Remove(nameof(story.Pages));
            foreach (var key in ModelState.Keys.Where(k => k.StartsWith("Pages")).ToList())
            {
                ModelState.Remove(key);
            }

            if (pdfFile == null || pdfFile.Length == 0)
            {
                ModelState.AddModelError("PdfFile", "يرجى اختيار ملف PDF صالح للقصة.");
            }
        }
        else if (contentMode == "editor")
        {
            ModelState.Remove("PdfFile");
            ModelState.Remove(nameof(story.PdfUrl));

            if (story.Pages == null || story.Pages.Count == 0)
            {
                if (pages != null && pages.Count > 0)
                {
                    story.Pages = pages;
                }
                else
                {
                    story.Pages = ExtractPagesFromForm(Request);
                }
            }

            story.Pages = story.Pages?.Where(p => !string.IsNullOrWhiteSpace(p.Content)).ToList() ?? [];
            if (!story.Pages.Any())
            {
                ModelState.AddModelError("Pages", "يجب إضافة صفحة واحدة على الأقل تحتوي على نص في محرر الصفحات.");
            }
            else
            {
                ModelState.Remove("Pages");
                for (int i = 0; i < story.Pages.Count; i++)
                {
                    var p = story.Pages[i];
                    bool hasImage = !string.IsNullOrWhiteSpace(p.IllustrationUrl);
                    if (Request.HasFormContentType && Request.Form.Files.Count > 0)
                    {
                        var f = Request.Form.Files[$"pageImage_{i}"] ?? Request.Form.Files.FirstOrDefault(file => file.Name == $"pageImage_{i}");
                        if (f != null && f.Length > 0) hasImage = true;
                    }
                    if (hasImage && p.Content?.Length > 160)
                    {
                        ModelState.AddModelError($"Pages[{i}].Content", $"تجاوز نص الصفحة {i + 1} الحد الأقصى المسموح به (160 حرف) للصفحات التي تحتوي على صورة.");
                    }
                }
            }
        }
        else
        {
            ModelState.AddModelError("ContentMode", "طريقة إدخال غير صالحة.");
        }

        if (ModelState.ContainsKey(nameof(story.CoverImage)))
        {
            ModelState.Remove(nameof(story.CoverImage));
        }

        if (!ModelState.IsValid)
        {
            ViewBag.ContentMode = contentMode;
            return View(story);
        }

        bool anyStories = await _context.Stories.AnyAsync(ct);
        int nextId = anyStories ? (await _context.Stories.MaxAsync(s => s.Id, ct)) + 1 : 1;
        story.Id = nextId;

        if (string.IsNullOrWhiteSpace(story.Slug))
        {
            story.Slug = !string.IsNullOrWhiteSpace(story.Title)
                ? story.Title.Replace(' ', '-').ToLowerInvariant()
                : $"story-{nextId}";
        }

        story.CreatedAt = DateTime.UtcNow;
        story.Rating = null;

        // Cover image upload
        if (imageFile != null && imageFile.Length > 0)
        {
            try
            {
                using var stream = imageFile.OpenReadStream();
                var safeCoverId = $"cover_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid().ToString("N")[..8]}";
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(imageFile.FileName, stream),
                    Folder = "super_kayyem/covers",
                    PublicId = safeCoverId
                };
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult?.SecureUrl != null)
                {
                    story.CoverImage = uploadResult.SecureUrl.ToString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload cover image for story: {Title}", story.Title);
            }
        }

        if (string.IsNullOrWhiteSpace(story.CoverImage))
        {
            story.CoverImage = "/images/covers/story1.svg";
        }

        // Mode handling
        if (contentMode == "pdf" && pdfFile != null && pdfFile.Length > 0)
        {
            try
            {
                using var pdfStream = pdfFile.OpenReadStream();
                var safePublicId = $"pdf_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid().ToString("N")[..8]}";
                var rawParams = new RawUploadParams
                {
                    File = new FileDescription(pdfFile.FileName, pdfStream),
                    Folder = "super_kayyem/pdfs",
                    PublicId = $"{safePublicId}.pdf"
                };
                var pdfResult = await _cloudinary.UploadAsync(rawParams);
                if (pdfResult?.SecureUrl != null)
                {
                    story.PdfUrl = pdfResult.SecureUrl.ToString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload PDF file for story: {Title}", story.Title);
            }
            story.Pages = [];
            story.PageCount = story.PageCount > 0 ? story.PageCount : 10;
        }
        else if (contentMode == "editor")
        {
            story.PdfUrl = null;
            story.Pages ??= [];

            for (int i = 0; i < story.Pages.Count; i++)
            {
                var page = story.Pages[i];
                page.PageNum = i + 1;

                IFormFile? file = null;
                if (Request.HasFormContentType && Request.Form.Files.Count > 0)
                {
                    file = Request.Form.Files[$"pageImage_{i}"]
                           ?? Request.Form.Files.FirstOrDefault(f => f.Name == $"pageImage_{i}");
                }
                if (file == null && pageImages != null && i < pageImages.Count && pageImages[i]?.Length > 0)
                {
                    file = pageImages[i];
                }

                if (file != null && file.Length > 0)
                {
                    try
                    {
                        using var stream = file.OpenReadStream();
                        var safeImgId = $"page_{i + 1}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid().ToString("N")[..8]}";
                        var uploadParams = new ImageUploadParams
                        {
                            File = new FileDescription(file.FileName, stream),
                            Folder = "super_kayyem/story_pages",
                            PublicId = safeImgId
                        };
                        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                        if (uploadResult?.SecureUrl != null)
                        {
                            page.IllustrationUrl = uploadResult.SecureUrl.ToString();
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to upload page illustration image for page {PageNum}", page.PageNum);
                    }
                }
            }
            story.PageCount = story.Pages.Count;
        }

        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct);

        TempData["SuccessMessage"] = $"تمت إضافة القصة «{story.Title}» بنجاح.";
        return RedirectToAction(nameof(Index));
    }

    // GET: /Stories/Edit/{id}
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpGet("/Stories/Edit/{id:int}")]
    public async Task<IActionResult> Edit(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound();
        }
        return View(story);
    }

    // POST: /Stories/Edit/{id}
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpPost("/Stories/Edit/{id:int}")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, Story story, string? contentMode = null, IFormFile? imageFile = null, IFormFile? pdfFile = null, List<IFormFile>? pageImages = null, List<StoryPageItem>? pages = null, CancellationToken ct = default)
    {
        if (id != story.Id)
        {
            return BadRequest();
        }

        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            return NotFound();
        }

        contentMode = contentMode?.Trim().ToLowerInvariant() ?? "";
        if (string.IsNullOrWhiteSpace(contentMode))
        {
            // Default based on existing data if not sent
            contentMode = !string.IsNullOrWhiteSpace(existing.PdfUrl) ? "pdf" : "editor";
        }

        if (contentMode == "pdf")
        {
            ModelState.Remove(nameof(story.Pages));
            foreach (var key in ModelState.Keys.Where(k => k.StartsWith("Pages")).ToList())
            {
                ModelState.Remove(key);
            }

            if (string.IsNullOrWhiteSpace(existing.PdfUrl) && (pdfFile == null || pdfFile.Length == 0))
            {
                ModelState.AddModelError("PdfFile", "يرجى رفع ملف PDF للقصة.");
            }
        }
        else if (contentMode == "editor")
        {
            ModelState.Remove("PdfFile");
            ModelState.Remove(nameof(story.PdfUrl));

            if (story.Pages == null || story.Pages.Count == 0)
            {
                if (pages != null && pages.Count > 0)
                {
                    story.Pages = pages;
                }
                else
                {
                    story.Pages = ExtractPagesFromForm(Request);
                }
            }

            story.Pages = story.Pages?.Where(p => !string.IsNullOrWhiteSpace(p.Content)).ToList() ?? [];
            if (!story.Pages.Any())
            {
                ModelState.AddModelError("Pages", "يجب توفير صفحة واحدة على الأقل في محرر الصفحات.");
            }
            else
            {
                ModelState.Remove("Pages");
                for (int i = 0; i < story.Pages.Count; i++)
                {
                    var p = story.Pages[i];
                    bool hasImage = !string.IsNullOrWhiteSpace(p.IllustrationUrl);
                    if (Request.HasFormContentType && Request.Form.Files.Count > 0)
                    {
                        var f = Request.Form.Files[$"pageImage_{i}"] ?? Request.Form.Files.FirstOrDefault(file => file.Name == $"pageImage_{i}");
                        if (f != null && f.Length > 0) hasImage = true;
                    }
                    if (hasImage && p.Content?.Length > 160)
                    {
                        ModelState.AddModelError($"Pages[{i}].Content", $"تجاوز نص الصفحة {i + 1} الحد الأقصى المسموح به (160 حرف) للصفحات التي تحتوي على صورة.");
                    }
                }
            }
        }

        if (ModelState.ContainsKey(nameof(story.CoverImage)))
        {
            ModelState.Remove(nameof(story.CoverImage));
        }

        if (!ModelState.IsValid)
        {
            ViewBag.ContentMode = contentMode;
            return View(story);
        }

        existing.Title = story.Title;
        existing.Slug = string.IsNullOrWhiteSpace(story.Slug)
            ? (!string.IsNullOrWhiteSpace(story.Title) ? story.Title.Replace(' ', '-').ToLowerInvariant() : existing.Slug)
            : story.Slug;
        existing.Category = story.Category;
        existing.TargetAge = story.TargetAge;
        existing.Description = story.Description;
        existing.Price = story.Price;

        // Cover image
        if (imageFile != null && imageFile.Length > 0)
        {
            try
            {
                using var stream = imageFile.OpenReadStream();
                var safeCoverId = $"cover_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid().ToString("N")[..8]}";
                var uploadParams = new ImageUploadParams
                {
                    File = new FileDescription(imageFile.FileName, stream),
                    Folder = "super_kayyem/covers",
                    PublicId = safeCoverId
                };
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                if (uploadResult?.SecureUrl != null)
                {
                    existing.CoverImage = uploadResult.SecureUrl.ToString();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update cover image for story: {Title}", existing.Title);
            }
        }

        if (string.IsNullOrWhiteSpace(existing.CoverImage))
        {
            existing.CoverImage = !string.IsNullOrWhiteSpace(story.CoverImage) ? story.CoverImage : "/images/covers/story1.svg";
        }

        // Mode handling
        if (contentMode == "pdf")
        {
            if (pdfFile != null && pdfFile.Length > 0)
            {
                try
                {
                    using var pdfStream = pdfFile.OpenReadStream();
                    var safePublicId = $"pdf_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid().ToString("N")[..8]}";
                    var rawParams = new RawUploadParams
                    {
                        File = new FileDescription(pdfFile.FileName, pdfStream),
                        Folder = "super_kayyem/pdfs",
                        PublicId = $"{safePublicId}.pdf"
                    };
                    var pdfResult = await _cloudinary.UploadAsync(rawParams);
                    if (pdfResult?.SecureUrl != null)
                    {
                        existing.PdfUrl = pdfResult.SecureUrl.ToString();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to update PDF file for story: {Title}", existing.Title);
                }
            }
            existing.Pages?.Clear();
            existing.PageCount = story.PageCount > 0 ? story.PageCount : (existing.PageCount > 0 ? existing.PageCount : 10);
        }
        else if (contentMode == "editor")
        {
            existing.PdfUrl = null;
            var updatedPages = story.Pages ?? [];

            for (int i = 0; i < updatedPages.Count; i++)
            {
                var page = updatedPages[i];
                page.PageNum = i + 1;

                IFormFile? file = null;
                if (Request.HasFormContentType && Request.Form.Files.Count > 0)
                {
                    file = Request.Form.Files[$"pageImage_{i}"]
                           ?? Request.Form.Files.FirstOrDefault(f => f.Name == $"pageImage_{i}");
                }
                if (file == null && pageImages != null && i < pageImages.Count && pageImages[i]?.Length > 0)
                {
                    file = pageImages[i];
                }

                if (file != null && file.Length > 0)
                {
                    try
                    {
                        using var stream = file.OpenReadStream();
                        var safeImgId = $"page_{i + 1}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}_{Guid.NewGuid().ToString("N")[..8]}";
                        var uploadParams = new ImageUploadParams
                        {
                            File = new FileDescription(file.FileName, stream),
                            Folder = "super_kayyem/story_pages",
                            PublicId = safeImgId
                        };
                        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                        if (uploadResult?.SecureUrl != null)
                        {
                            page.IllustrationUrl = uploadResult.SecureUrl.ToString();
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to update page illustration image for page {PageNum}", page.PageNum);
                    }
                }
            }

            if (existing.Pages == null)
            {
                existing.Pages = new List<StoryPageItem>(updatedPages);
            }
            else
            {
                existing.Pages.Clear();
                existing.Pages.AddRange(updatedPages);
            }
            existing.PageCount = existing.Pages.Count;
        }

        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        TempData["SuccessMessage"] = $"تم تحديث القصة «{existing.Title}» بنجاح.";
        return RedirectToAction(nameof(Index));
    }

    // GET: /Stories/Delete/{id}
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpGet("/Stories/Delete/{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound();
        }
        return View(story);
    }

    // POST: /Stories/Delete/{id}
    [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
    [HttpPost("/Stories/Delete/{id:int}"), ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken ct = default)
    {
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound();
        }

        _context.Stories.Remove(story);
        await _context.SaveChangesAsync(ct);

        TempData["SuccessMessage"] = $"تم حذف القصة «{story.Title}» بنجاح.";
        return RedirectToAction(nameof(Index));
    }
}

public class RateStoryDto
{
    public int AccountId { get; set; }
    public string? AccountName { get; set; }
    public double? Rating { get; set; }
    public double? Score { get; set; }
}
