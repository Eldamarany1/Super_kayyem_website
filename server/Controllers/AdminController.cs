// ============================================================
// AdminController.cs — Admin dashboard controller (Razor MVC Views)
// Default route: /Admin/Index
// Used to display and manage stories via Razor HTML pages, not an API.
// ============================================================

namespace SuperKayyem.Controllers;

using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Required for ToListAsync, FirstOrDefaultAsync...
using SuperKayyem.Data;              // Required for SeedData
using SuperKayyem.Models;            // Required for Story and SuperKayyemDbContext

/// <summary>
/// MVC Controller for the Super Kayyem Admin Dashboard and story management views.
/// </summary>
// No [ApiController] here because this controller returns HTML pages (Views), not JSON
// Inherits from Controller (not ControllerBase) because it needs View() and RedirectToAction()
public class AdminController : Controller
{
    // _context: Access to the MongoDB database
    private readonly SuperKayyemDbContext _context;

    // _logger: Logs events in the application log
    private readonly ILogger<AdminController> _logger;

    // _cloudinary: Cloudinary client for uploading images and PDFs
    private readonly Cloudinary _cloudinary;

    // Constructor: ASP.NET injects SuperKayyemDbContext, ILogger, and Cloudinary automatically (Dependency Injection)
    public AdminController(SuperKayyemDbContext context, ILogger<AdminController> logger, Cloudinary cloudinary)
    {
        _context = context;
        _logger = logger;
        _cloudinary = cloudinary;
    }

    /// <summary>
    /// Displays the admin dashboard with all stories and statistical summaries.
    /// Auto-seeds if empty so Razor view Average calculation never throws.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken ct = default)
    {
        // Fetch all stories from MongoDB asynchronously
        var stories = await _context.Stories.ToListAsync(ct);

        // If the database is empty, seed it automatically to prevent Average calculation errors in the View
        // Reason: LINQ's Average() throws an exception when called on an empty collection
        if (!stories.Any())
        {
            _logger.LogInformation("Database is empty. Seeding initial stories for Admin dashboard");

            var seedStories = SeedData.GetStories();

            // AddRangeAsync: Adds the entire list at once — more efficient than adding one by one
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }

        // Migrate any existing stories in database that were created before TargetAge was added
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

        // View(stories): Opens Razor view Views/Admin/Index.cshtml and passes the stories list
        return View(stories);
    }

    /// <summary>
    /// Displays the detailed view for a single story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Details(int id, CancellationToken ct = default)
    {
        // Fetch the story by ID from MongoDB
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Details: Story with ID {StoryId} not found", id);
            return NotFound(); // HTTP 404
        }

        return View(story); // Opens Views/Admin/Details.cshtml
    }

    /// <summary>
    /// Displays the form for creating a new story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        // Task.Yield(): Allows the method to be async even without a real await
        // Prevents compiler warning CS1998 and maintains a consistent async pattern
        await Task.Yield();

        // Pass an empty model to the View to populate form fields
        return View(new Story());
    }

    /// <summary>
    /// Handles submission of the new story form, saving it to MongoDB asynchronously.
    /// Uploads cover image and PDF to Cloudinary if files are provided.
    /// </summary>
    // [HttpPost]: Handles form submission from the Create page
    // [ValidateAntiForgeryToken]: Protects against CSRF (Cross-Site Request Forgery) attacks
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Story story, IFormFile? imageFile, IFormFile? pdfFile, CancellationToken ct = default)
    {
        // ModelState.IsValid: Checks that all form fields are valid according to Model rules
        if (!ModelState.IsValid)
        {
            return View(story); // Re-display the form with error messages
        }

        // Calculate the next ID automatically
        var anyStories = await _context.Stories.AnyAsync(ct);
        int nextId = anyStories ? (await _context.Stories.MaxAsync(s => s.Id, ct)) + 1 : 1;
        story.Id = nextId;

        // Auto-generate slug from title if not entered in the form
        if (string.IsNullOrWhiteSpace(story.Slug))
        {
            story.Slug = !string.IsNullOrWhiteSpace(story.Title)
                ? story.Title.Replace(' ', '-').ToLowerInvariant()
                : $"story-{nextId}";
        }

        story.Pages ??= [];
        story.CreatedAt = DateTime.UtcNow;
        story.Rating = null; // Unrated on creation; will be calculated dynamically from user reviews

        // Upload cover image to Cloudinary if a file was provided
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

        // Upload PDF to Cloudinary if a file was provided
        if (pdfFile != null && pdfFile.Length > 0)
        {
            using var pdfStream = pdfFile.OpenReadStream();
            var rawParams = new RawUploadParams
            {
                File = new FileDescription(pdfFile.FileName, pdfStream),
                Folder = "super_kayyem/pdfs"
            };

            var pdfResult = await _cloudinary.UploadAsync(rawParams);
            story.PdfUrl = pdfResult.SecureUrl.ToString();
        }

        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct); // Actual save in MongoDB

        _logger.LogInformation("Story '{Title}' (ID: {Id}) created.", story.Title, story.Id);

        // RedirectToAction: Redirects to the Index page after saving successfully
        // nameof(Index): Type-safe way to write the action name — better than writing "Index" as a plain string
        return RedirectToAction(nameof(Index));
    }

    /// <summary>
    /// Displays the edit form pre-populated with data for the specified story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Edit(int id, CancellationToken ct = default)
    {
        // Fetch the story to populate the edit form
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Edit GET: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        return View(story); // Opens Views/Admin/Edit.cshtml with story data
    }

    /// <summary>
    /// Handles submission of the edited story, saving modifications to MongoDB asynchronously.
    /// Uploads new cover image and PDF to Cloudinary if replacement files are provided.
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, Story story, IFormFile? imageFile, IFormFile? pdfFile, CancellationToken ct = default)
    {
        // Verify that the route id matches the model id to prevent tampering
        if (id != story.Id)
        {
            return BadRequest(); // HTTP 400
        }

        if (!ModelState.IsValid)
        {
            return View(story);
        }

        // Fetch the existing record from MongoDB to update it
        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            _logger.LogWarning("Admin Edit POST: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        // Apply changes to the existing record
        existing.Title = story.Title;

        // Generate new slug from title if not sent, otherwise use the sent slug
        existing.Slug = string.IsNullOrWhiteSpace(story.Slug)
            ? (!string.IsNullOrWhiteSpace(story.Title) ? story.Title.Replace(' ', '-').ToLowerInvariant() : existing.Slug)
            : story.Slug;

        existing.Category = story.Category;
        existing.TargetAge = story.TargetAge;
        existing.Description = story.Description;
        existing.Price = story.Price;
        // Rating is calculated dynamically from user reviews; preserve existing value
        existing.PageCount = story.PageCount;

        // Upload new cover image to Cloudinary if a replacement file was provided
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

        // Upload new PDF to Cloudinary if a replacement file was provided
        if (pdfFile != null && pdfFile.Length > 0)
        {
            using var pdfStream = pdfFile.OpenReadStream();
            var rawParams = new RawUploadParams
            {
                File = new FileDescription(pdfFile.FileName, pdfStream),
                Folder = "super_kayyem/pdfs"
            };

            var pdfResult = await _cloudinary.UploadAsync(rawParams);
            existing.PdfUrl = pdfResult.SecureUrl.ToString();
        }

        // Update pages only if sent in the request
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

        await _context.SaveChangesAsync(ct); // Save changes to MongoDB
        _logger.LogInformation("Story '{Title}' (ID: {Id}) updated.", story.Title, id);

        return RedirectToAction(nameof(Index));
    }

    /// <summary>
    /// Displays the delete confirmation page for the specified story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        // Fetch the story to display on the delete confirmation page
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Delete GET: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        return View(story); // Opens Views/Admin/Delete.cshtml to confirm deletion
    }

    /// <summary>
    /// Deletes the specified story from MongoDB asynchronously and redirects to dashboard.
    /// </summary>
    // [HttpPost, ActionName("Delete")]: Maps this method to POST requests on /Admin/Delete
    // ActionName("Delete"): Required because we have two Delete methods (GET and POST) in the same class
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken ct = default)
    {
        // Fetch the story to make sure it exists before deleting
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Delete POST: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        // Mark the record for deletion in DbContext
        _context.Stories.Remove(story);

        // Execute the actual deletion in MongoDB
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story (ID: {Id}) deleted.", id);

        return RedirectToAction(nameof(Index));
    }
}
