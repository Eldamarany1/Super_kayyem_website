namespace SuperKayyem.Controllers;

using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;

[ApiController]
[Route("api/[controller]")]
public class StoriesController : ControllerBase
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

    // GET: api/stories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Story>>> GetAll(CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching all stories");
        var stories = await _context.Stories.ToListAsync(ct);

        // Auto-seed initial stories if database is empty
        if (!stories.Any())
        {
            _logger.LogInformation("Database is empty. Seeding initial stories from SeedData");
            var seedStories = SeedData.GetStories();
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }

        // Migrate any existing stories missing TargetAge
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

    // GET: api/stories/5
    [HttpGet("{id}")]
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

    // GET: api/stories/{id}/pdf
    [HttpGet("{id}/pdf")]
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

    // POST: api/stories
    [HttpPost]
    public async Task<IActionResult> Add([FromForm] Story story, IFormFile? pdfFile, IFormFile? imageFile, CancellationToken ct = default)
    {
        if (story == null)
        {
            return BadRequest(new { error = "Invalid story data" });
        }

        // Calculate next integer ID
        bool hasStories = await _context.Stories.AnyAsync(ct);
        int nextId = hasStories ? (await _context.Stories.MaxAsync(s => s.Id, ct)) + 1 : 1;
        story.Id = nextId;

        // Auto-generate slug from title if empty
        if (string.IsNullOrWhiteSpace(story.Slug))
        {
            story.Slug = !string.IsNullOrWhiteSpace(story.Title)
                ? story.Title.Replace(' ', '-').ToLowerInvariant()
                : $"story-{nextId}";
        }

        story.Pages ??= [];
        story.CreatedAt = DateTime.UtcNow;
        story.Rating = null; // Unrated on creation; calculated dynamically from user reviews

        // Upload cover image to Cloudinary
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

        // Upload PDF to Cloudinary as raw file
        if (pdfFile != null && pdfFile.Length > 0)
        {
            using var pdfStream = pdfFile.OpenReadStream();
            var cleanFileName = Path.GetFileNameWithoutExtension(pdfFile.FileName)
                .Replace(" ", "_");

            var rawParams = new RawUploadParams
            {
                File = new FileDescription(pdfFile.FileName, pdfStream),
                Folder = "super_kayyem/pdfs",
                // Explicitly preserve .pdf extension so Cloudinary & browsers recognize it as a PDF document
                PublicId = $"{cleanFileName}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.pdf"
            };

            var pdfResult = await _cloudinary.UploadAsync(rawParams);
            if (pdfResult.Error != null)
            {
                _logger.LogError("Cloudinary PDF upload error: {Error}", pdfResult.Error.Message);
            }
            else if (pdfResult.SecureUrl != null)
            {
                story.PdfUrl = pdfResult.SecureUrl.ToString();
            }
        }

        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Story '{Title}' (ID: {Id}) added successfully", story.Title, story.Id);
        return CreatedAtAction(nameof(GetById), new { id = story.Id }, story);
    }

    // PUT: api/stories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Edit(int id, [FromForm] Story story, IFormFile? imageFile, IFormFile? pdfFile, CancellationToken ct = default)
    {
        if (story == null)
        {
            return BadRequest(new { error = "Invalid story data" });
        }

        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            _logger.LogWarning("Story with ID {Id} not found for edit", id);
            return NotFound(new { error = "Story not found" });
        }

        existing.Title = story.Title;
        existing.Slug = string.IsNullOrWhiteSpace(story.Slug)
            ? (!string.IsNullOrWhiteSpace(story.Title) ? story.Title.Replace(' ', '-').ToLowerInvariant() : existing.Slug)
            : story.Slug;
        existing.Category = story.Category;
        existing.TargetAge = story.TargetAge;
        existing.Description = story.Description;
        existing.Price = story.Price;
        // Rating is calculated dynamically from user reviews; preserve existing value
        if (story.Rating.HasValue)
        {
            existing.Rating = story.Rating;
        }
        existing.PageCount = story.PageCount;

        // Upload new cover image to Cloudinary if provided
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
        else if (!string.IsNullOrWhiteSpace(story.CoverImage))
        {
            // Keep URL from form only if no file uploaded
            existing.CoverImage = story.CoverImage;
        }

        // Upload new PDF to Cloudinary if provided
        if (pdfFile != null && pdfFile.Length > 0)
        {
            using var pdfStream = pdfFile.OpenReadStream();
            var cleanFileName = Path.GetFileNameWithoutExtension(pdfFile.FileName)
                .Replace(" ", "_");

            var rawParams = new RawUploadParams
            {
                File = new FileDescription(pdfFile.FileName, pdfStream),
                Folder = "super_kayyem/pdfs",
                // Explicitly preserve .pdf extension so Cloudinary & browsers recognize it as a PDF document
                PublicId = $"{cleanFileName}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}.pdf"
            };

            var pdfResult = await _cloudinary.UploadAsync(rawParams);
            if (pdfResult.Error != null)
            {
                _logger.LogError("Cloudinary PDF upload error: {Error}", pdfResult.Error.Message);
            }
            else if (pdfResult.SecureUrl != null)
            {
                existing.PdfUrl = pdfResult.SecureUrl.ToString();
            }
        }

        if (story.Pages != null)
        {
            if (existing.Pages == null)
            {
                existing.Pages = new List<StoryPageItem>(story.Pages);
            }
            else
            {
                existing.Pages.Clear();
                existing.Pages.AddRange(story.Pages);
            }
        }

        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story with ID {Id} updated successfully", id);

        return NoContent();
    }

    // DELETE: api/stories/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            _logger.LogWarning("Story with ID {Id} not found for deletion", id);
            return NotFound(new { error = "Story not found" });
        }

        _context.Stories.Remove(existing);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Story with ID {Id} deleted successfully", id);
        return NoContent();
    }

    // POST: api/stories/5/rate
    [HttpPost("{id}/rate")]
    public async Task<IActionResult> Rate(int id, [FromBody] RateStoryDto rateDto, CancellationToken ct = default)
    {
        if (rateDto == null || rateDto.Rating < 1 || rateDto.Rating > 5)
        {
            return BadRequest(new { error = "التقييم يجب أن يكون بين 1 و 5 نجوم" });
        }

        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            return NotFound(new { error = "القصة غير موجودة" });
        }

        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == rateDto.AccountId, ct);
        if (account == null)
        {
            return Unauthorized(new { error = "يجب تسجيل الدخول لتقييم القصة" });
        }

        // Verify story ownership: account owns it if story ID is in account.OwnedStoryIds
        account.OwnedStoryIds ??= [];
        if (!account.OwnedStoryIds.Contains(id))
        {
            return BadRequest(new { error = "يمكنك فقط تقييم القصص التي تمتلكها في مكتبتك" });
        }

        story.Ratings ??= [];
        var existingRating = story.Ratings.FirstOrDefault(r => r.AccountId == rateDto.AccountId);
        if (existingRating != null)
        {
            existingRating.Score = rateDto.Rating;
            existingRating.AccountName = $"{account.FirstName} {account.LastName}".Trim();
            existingRating.CreatedAt = DateTime.UtcNow;
        }
        else
        {
            story.Ratings.Add(new StoryRating
            {
                AccountId = rateDto.AccountId,
                AccountName = $"{account.FirstName} {account.LastName}".Trim(),
                Score = rateDto.Rating,
                CreatedAt = DateTime.UtcNow
            });
        }

        // Recalculate average rating rounded to 1 decimal place
        story.Rating = Math.Round(story.Ratings.Average(r => r.Score), 1);
        story.IsUpdated = true;
        story.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story {Id} rated {Rating} by Account {AccountId}. New average: {Avg}", id, rateDto.Rating, rateDto.AccountId, story.Rating);

        return Ok(new
        {
            storyId = story.Id,
            rating = story.Rating,
            ratingCount = story.Ratings.Count,
            userRating = rateDto.Rating,
            message = "تم تسجيل تقييمك بنجاح"
        });
    }
}

public class RateStoryDto
{
    public int AccountId { get; set; }
    public double Rating { get; set; }
}
