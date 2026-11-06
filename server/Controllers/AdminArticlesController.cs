using System.Security.Claims;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;

namespace SuperKayyem.Controllers
{
    [Authorize(Roles = "SuperAdmin,Admin")]
    public class AdminArticlesController : Controller
    {
        private readonly SuperKayyemDbContext _context;
        private readonly Cloudinary? _cloudinary;
        private readonly ILogger<AdminArticlesController> _logger;

        public AdminArticlesController(
            SuperKayyemDbContext context,
            ILogger<AdminArticlesController> logger,
            Cloudinary? cloudinary = null,
            IConfiguration? configuration = null)
        {
            _context = context;
            _logger = logger;
            _cloudinary = cloudinary;

            if (_cloudinary == null && configuration != null)
            {
                var cloudName = configuration["Cloudinary:CloudName"];
                var apiKey = configuration["Cloudinary:ApiKey"];
                var apiSecret = configuration["Cloudinary:ApiSecret"];

                if (!string.IsNullOrWhiteSpace(cloudName) &&
                    !string.IsNullOrWhiteSpace(apiKey) &&
                    !string.IsNullOrWhiteSpace(apiSecret) &&
                    !apiKey.StartsWith("<"))
                {
                    var account = new CloudinaryDotNet.Account(cloudName, apiKey, apiSecret);
                    _cloudinary = new Cloudinary(account);
                }
            }
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

        private bool CanManageArticle(Article article)
        {
            if (User.IsInRole("SuperAdmin"))
            {
                return true;
            }

            var currentEmail = User.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant() ?? "";
            if (!string.IsNullOrWhiteSpace(currentEmail) &&
                !string.IsNullOrWhiteSpace(article.AuthorEmail) &&
                article.AuthorEmail.Trim().ToLowerInvariant() == currentEmail)
            {
                return true;
            }

            // Only fallback to name if the article has no recorded AuthorEmail (e.g. legacy seed data)
            if (string.IsNullOrWhiteSpace(article.AuthorEmail))
            {
                var currentName = User.Identity?.Name?.Trim().ToLowerInvariant() ?? "";
                if (!string.IsNullOrWhiteSpace(currentName) &&
                    !string.IsNullOrWhiteSpace(article.AuthorName) &&
                    article.AuthorName.Trim().ToLowerInvariant() == currentName)
                {
                    return true;
                }
            }

            return false;
        }

        // GET: /AdminArticles
        [HttpGet]
        public async Task<IActionResult> Index(CancellationToken ct = default)
        {
            if (!await _context.Articles.AnyAsync(ct))
            {
                var seedArticles = ArticleSeedData.GetInitialArticles();
                await _context.Articles.AddRangeAsync(seedArticles, ct);
                await _context.SaveChangesAsync(ct);
            }

            var articles = await _context.Articles
                .OrderByDescending(a => a.PublishedAt)
                .ThenByDescending(a => a.Id)
                .AsNoTracking()
                .ToListAsync(ct);

            return View(articles);
        }

        // GET: /AdminArticles/Create
        [HttpGet]
        public IActionResult Create()
        {
            var model = new Article
            {
                AuthorName = User.Identity?.Name ?? "مشرف سوبر قيم",
                Category = "التربية الإيجابية"
            };
            return View(model);
        }

        // POST: /AdminArticles/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(
            [FromForm] Article article,
            IFormFile? imageFile,
            CancellationToken ct = default)
        {
            // Populate author info from logged-in admin claims
            article.AuthorName = string.IsNullOrWhiteSpace(article.AuthorName)
                ? (User.Identity?.Name ?? "مشرف سوبر قيم")
                : article.AuthorName.Trim();

            article.AuthorEmail = User.FindFirstValue(ClaimTypes.Email) ?? "";
            article.PublishedAt = DateTime.UtcNow;

            ModelState.Remove(nameof(Article.ImageUrl));
            ModelState.Remove(nameof(Article.AuthorEmail));

            if (!ModelState.IsValid)
            {
                return View(article);
            }

            if (!await _context.Articles.AnyAsync(ct))
            {
                var seedArticles = ArticleSeedData.GetInitialArticles();
                await _context.Articles.AddRangeAsync(seedArticles, ct);
                await _context.SaveChangesAsync(ct);
            }

            int nextId = (await _context.Articles.MaxAsync(a => a.Id, ct)) + 1;
            article.Id = nextId;

            if (imageFile != null && imageFile.Length > 0 && _cloudinary != null)
            {
                try
                {
                    using var stream = imageFile.OpenReadStream();
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(imageFile.FileName, stream),
                        Folder = "super_kayyem/articles"
                    };
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.SecureUrl != null)
                    {
                        article.ImageUrl = uploadResult.SecureUrl.ToString();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading article image to Cloudinary");
                }
            }

            if (string.IsNullOrWhiteSpace(article.ImageUrl))
            {
                article.ImageUrl = "https://images.unsplash.com/photo-1536640712-4d4c36ff0e4e?auto=format&fit=crop&w=1200&q=80";
            }

            await _context.Articles.AddAsync(article, ct);
            await _context.SaveChangesAsync(ct);

            TempData["SuccessMessage"] = $"✅ تم نشر المقال «{article.Title}» بنجاح!";
            return RedirectToAction(nameof(Index));
        }

        // GET: /AdminArticles/Edit/5
        [HttpGet]
        public async Task<IActionResult> Edit(int id, CancellationToken ct = default)
        {
            var article = await _context.Articles.AsNoTracking().FirstOrDefaultAsync(a => a.Id == id, ct);
            if (article == null)
            {
                return NotFound();
            }

            if (!CanManageArticle(article))
            {
                TempData["ErrorMessage"] = "⚠️ عذراً، يمكنك فقط تعديل المقالات التي قمت بنشرها بنفسك (أو عبر حساب الـ SuperAdmin).";
                return RedirectToAction(nameof(Index));
            }

            return View(article);
        }

        // POST: /AdminArticles/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(
            int id,
            [FromForm] Article updated,
            IFormFile? imageFile,
            CancellationToken ct = default)
        {
            var existing = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (existing == null)
            {
                return NotFound();
            }

            if (!CanManageArticle(existing))
            {
                return Forbid();
            }

            ModelState.Remove(nameof(Article.ImageUrl));
            ModelState.Remove(nameof(Article.AuthorEmail));

            if (!ModelState.IsValid)
            {
                updated.ImageUrl = existing.ImageUrl;
                return View(updated);
            }

            existing.Title = updated.Title.Trim();
            existing.Category = string.IsNullOrWhiteSpace(updated.Category) ? "التربية الإيجابية" : updated.Category.Trim();
            existing.Introduction = updated.Introduction;
            existing.BodyContent = updated.BodyContent;
            existing.Conclusion = updated.Conclusion;

            if (!string.IsNullOrWhiteSpace(updated.AuthorName))
            {
                existing.AuthorName = updated.AuthorName.Trim();
            }

            if (imageFile != null && imageFile.Length > 0 && _cloudinary != null)
            {
                try
                {
                    using var stream = imageFile.OpenReadStream();
                    var uploadParams = new ImageUploadParams
                    {
                        File = new FileDescription(imageFile.FileName, stream),
                        Folder = "super_kayyem/articles"
                    };
                    var uploadResult = await _cloudinary.UploadAsync(uploadParams);
                    if (uploadResult.SecureUrl != null)
                    {
                        existing.ImageUrl = uploadResult.SecureUrl.ToString();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error uploading updated article image to Cloudinary");
                }
            }

            await _context.SaveChangesAsync(ct);
            TempData["SuccessMessage"] = $"✅ تم تحديث المقال «{existing.Title}» بنجاح!";
            return RedirectToAction(nameof(Index));
        }

        // POST: /AdminArticles/Delete/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
        {
            var existing = await _context.Articles.FirstOrDefaultAsync(a => a.Id == id, ct);
            if (existing == null)
            {
                return NotFound();
            }

            if (!CanManageArticle(existing))
            {
                TempData["ErrorMessage"] = "⚠️ عذراً، لا تملك صلاحية حذف مقال لم تقم بنشره.";
                return RedirectToAction(nameof(Index));
            }

            _context.Articles.Remove(existing);
            await _context.SaveChangesAsync(ct);

            TempData["SuccessMessage"] = $"🗑️ تم حذف المقال «{existing.Title}» بنجاح.";
            return RedirectToAction(nameof(Index));
        }
    }
}
