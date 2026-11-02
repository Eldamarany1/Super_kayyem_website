// ============================================================
// StoriesController.cs — واجهة برمجة التطبيقات للقصص (REST API)
// المسار الأساسي: GET/POST/PUT/DELETE /api/stories
// يُستخدم من قِبَل الفرونت إند (React) لعرض وإدارة القصص.
// ============================================================

namespace SuperKayyem.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // مطلوب لاستخدام ToListAsync, FirstOrDefaultAsync, AnyAsync...
using SuperKayyem.Data;              // مطلوب لاستخدام SeedData
using SuperKayyem.Models;            // مطلوب لاستخدام نموذج Story
using SuperKayyem.Services;          // مطلوب لاستخدام MongoDbContext

/// <summary>
/// REST API Controller for managing children's stories consumed by the frontend and client applications.
/// </summary>
// [ApiController]: يخبر ASP.NET أن هذا Controller مخصص لـ API (يتعامل مع JSON)
// [Route("api/[controller]")]: يحدد المسار تلقائياً إلى "api/stories" بناءً على اسم الكلاس
[ApiController]
[Route("api/[controller]")]
public class StoriesController : ControllerBase
{
    // _context: الوصول إلى قاعدة البيانات MongoDB عبر EF Core
    private readonly MongoDbContext _context;

    // _logger: لتسجيل الأحداث والأخطاء في سجل التطبيق (Console أو ملف)
    private readonly ILogger<StoriesController> _logger;

    // المُنشئ: ASP.NET يحقن هذه الكائنات تلقائياً عند إنشاء الـ Controller (Dependency Injection)
    public StoriesController(MongoDbContext context, ILogger<StoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Fetches all stories asynchronously. Automatically seeds initial stories from SeedData if the database is empty.
    /// </summary>
    // [HttpGet]: يعني أن هذه الدالة تستجيب لطلبات GET على المسار /api/stories
    // CancellationToken ct: يسمح بإلغاء العملية إذا أغلق المتصفح الطلب قبل اكتماله
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Story>>> GetAll(CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching all stories asynchronously from database");

        // ToListAsync: يجلب كل القصص من MongoDB بشكل غير متزامن (لا يحجب الخيط)
        var stories = await _context.Stories.ToListAsync(ct);

        // إذا كانت قاعدة البيانات فارغة في أول تشغيل، نملأها بالبيانات الأولية تلقائياً
        if (!stories.Any())
        {
            _logger.LogInformation("Stories collection is empty. Auto-seeding initial stories from SeedData");

            // جلب القصص الثابتة (Hard-coded) من كلاس SeedData
            var seedStories = SeedData.GetStories();

            // AddRangeAsync: إضافة قائمة كاملة من القصص دفعة واحدة بدلاً من إضافتها واحدة واحدة
            await _context.Stories.AddRangeAsync(seedStories, ct);

            // SaveChangesAsync: حفظ التغييرات فعلياً في MongoDB (بدونها لن تُحفظ أي تغييرات)
            await _context.SaveChangesAsync(ct);

            stories = seedStories;
        }

        // Ok(stories): يُرجع استجابة HTTP 200 مع البيانات بصيغة JSON
        return Ok(stories);
    }

    /// <summary>
    /// Fetches a single story by its identifier asynchronously.
    /// </summary>
    // [HttpGet("{id}")]: يعني أن هذه الدالة تستجيب لطلبات مثل GET /api/stories/3
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id, CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching story with identifier: {StoryId}", id);

        // int.TryParse: يحاول تحويل النص إلى رقم — يُرجع false إذا فشل التحويل
        if (!int.TryParse(id, out int storyId))
        {
            _logger.LogWarning("Invalid story ID format: {StoryId}", id);
            // NotFound: يُرجع HTTP 404 مع رسالة خطأ بصيغة JSON
            return NotFound(new { error = "Story not found" });
        }

        // FirstOrDefaultAsync: يجلب أول سجل يطابق الشرط، أو null إذا لم يجد شيئاً
        // s => s.Id == storyId: Lambda Expression — تعني "القصة التي معرّفها يساوي storyId"
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == storyId, ct);
        if (story == null)
        {
            _logger.LogWarning("Story with ID {StoryId} not found", storyId);
            return NotFound(new { error = "Story not found" });
        }

        return Ok(story);
    }

    /// <summary>
    /// Creates a new story asynchronously, computing the next integer ID and slug before persisting.
    /// </summary>
    // [HttpPost]: يعني أن هذه الدالة تستجيب لطلبات POST على /api/stories
    // [FromBody]: يعني أن بيانات القصة تأتي في جسم الطلب (Request Body) بصيغة JSON
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Story story, CancellationToken ct = default)
    {
        if (story == null)
        {
            // BadRequest: يُرجع HTTP 400 عند إرسال بيانات غير صالحة
            return BadRequest(new { error = "Invalid story payload" });
        }

        // AnyAsync: يتحقق إذا كانت هناك أي سجلات موجودة أصلاً
        var anyStories = await _context.Stories.AnyAsync(ct);

        // حساب المعرف التالي: إذا في قصص نأخذ أعلى id ونضيف 1، وإلا نبدأ من 1
        int nextId = anyStories ? (await _context.Stories.MaxAsync(s => s.Id, ct)) + 1 : 1;
        story.Id = nextId;

        // إذا لم يُرسَل Slug، نولّده تلقائياً من العنوان بتحويل المسافات إلى - وتصغير الحروف
        if (string.IsNullOrWhiteSpace(story.Slug))
        {
            story.Slug = !string.IsNullOrWhiteSpace(story.Title)
                ? story.Title.Replace(' ', '-').ToLowerInvariant()
                : $"story-{nextId}"; // fallback إذا لم يكن هناك عنوان أيضاً
        }

        // تسجيل تاريخ الإنشاء بالتوقيت العالمي UTC
        story.CreatedAt = DateTime.UtcNow;

        // AddAsync: إضافة القصة إلى الـ DbContext (لم تُحفظ بعد في MongoDB)
        await _context.Stories.AddAsync(story, ct);

        // SaveChangesAsync: الحفظ الفعلي في MongoDB
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("Story '{Title}' (ID: {Id}) created successfully", story.Title, story.Id);

        // CreatedAtAction: يُرجع HTTP 201 مع رابط الـ GET الخاص بالقصة الجديدة في الـ Header
        return CreatedAtAction(nameof(GetById), new { id = story.Id.ToString() }, story);
    }

    /// <summary>
    /// Updates an existing story asynchronously with new property values.
    /// </summary>
    // [HttpPut("{id}")]: يعني أن هذه الدالة تستجيب لطلبات مثل PUT /api/stories/3
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] Story story, CancellationToken ct = default)
    {
        if (story == null)
        {
            return BadRequest(new { error = "Invalid story payload" });
        }

        // جلب السجل الموجود أولاً لتعديله بدلاً من استبداله كاملاً
        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            _logger.LogWarning("Story with ID {StoryId} not found for update", id);
            return NotFound(new { error = "Story not found" });
        }

        // تحديث خصائص السجل الموجود بالقيم الجديدة القادمة من الطلب
        existing.Title = story.Title;

        // إذا لم يُرسَل Slug جديد، نولّده من العنوان — وإلا نستخدم الـ Slug المُرسَل
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

        // تحديث الصفحات فقط إذا أُرسلت — لتجنب حذفها عند عدم إرسالها
        if (story.Pages != null)
        {
            existing.Pages = story.Pages;
        }

        // تسجيل أن السجل تم تعديله مع التوقيت
        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        // حفظ التغييرات في MongoDB
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story '{Title}' (ID: {Id}) updated successfully", existing.Title, id);

        // NoContent: يُرجع HTTP 204 — يعني "تم التعديل بنجاح، لا يوجد محتوى للإرجاع"
        return NoContent();
    }

    /// <summary>
    /// Deletes a story asynchronously by its identifier.
    /// </summary>
    // [HttpDelete("{id}")]: يعني أن هذه الدالة تستجيب لطلبات مثل DELETE /api/stories/3
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        // جلب القصة أولاً للتحقق من وجودها
        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            _logger.LogWarning("Story with ID {StoryId} not found for deletion", id);
            return NotFound(new { error = "Story not found" });
        }

        // Remove: يضع علامة على السجل للحذف (لم يُحذف بعد من MongoDB)
        _context.Stories.Remove(existing);

        // SaveChangesAsync: تنفيذ الحذف الفعلي في MongoDB
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story with ID {StoryId} deleted successfully", id);

        // NoContent: HTTP 204 — يعني "تم الحذف بنجاح"
        return NoContent();
    }
}
