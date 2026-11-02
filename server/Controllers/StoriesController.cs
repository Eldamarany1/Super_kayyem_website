namespace SuperKayyem.Controllers;

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

    public StoriesController(SuperKayyemDbContext context, ILogger<StoriesController> logger)
    {
        _context = context;
        _logger = logger;
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

    // POST: api/stories
    [HttpPost]
    public async Task<IActionResult> Add([FromBody] Story story, CancellationToken ct = default)
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

        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Story '{Title}' (ID: {Id}) added successfully", story.Title, story.Id);
        return CreatedAtAction(nameof(GetById), new { id = story.Id }, story);
    }

    // PUT: api/stories/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Edit(int id, [FromBody] Story story, CancellationToken ct = default)
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
        existing.TargetAgeGroup = story.TargetAgeGroup;
        existing.Description = story.Description;
        existing.Price = story.Price;
        existing.Rating = story.Rating;
        existing.CoverImage = story.CoverImage;
        existing.PageCount = story.PageCount;

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
}
