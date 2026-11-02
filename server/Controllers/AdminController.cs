// ============================================================
// AdminController.cs — لوحة تحكم الإدارة (Razor MVC Views)
// المسار الافتراضي: /Admin/Index
// يُستخدم لعرض وإدارة القصص عبر صفحات Razor (HTML) وليس API.
// ============================================================

namespace SuperKayyem.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // مطلوب لـ ToListAsync, FirstOrDefaultAsync...
using SuperKayyem.Data;              // مطلوب لـ SeedData
using SuperKayyem.Models;            // مطلوب لنموذج Story
using SuperKayyem.Services;          // مطلوب لـ MongoDbContext

/// <summary>
/// MVC Controller for the Super Kayyem Admin Dashboard and story management views.
/// </summary>
// لا يوجد [ApiController] هنا لأن هذا Controller يُرجع صفحات HTML (Views) وليس JSON
// يرث من Controller (وليس ControllerBase) لأنه يحتاج View() و RedirectToAction()
public class AdminController : Controller
{
    // _context: الوصول إلى قاعدة البيانات MongoDB
    private readonly MongoDbContext _context;

    // _logger: لتسجيل الأحداث في سجل التطبيق
    private readonly ILogger<AdminController> _logger;

    // المُنشئ: ASP.NET يحقن MongoDbContext و ILogger تلقائياً (Dependency Injection)
    public AdminController(MongoDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Displays the admin dashboard with all stories and statistical summaries.
    /// Auto-seeds if empty so Razor view Average calculation never throws.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken ct = default)
    {
        // جلب جميع القصص من MongoDB بشكل غير متزامن
        var stories = await _context.Stories.ToListAsync(ct);

        // إذا كانت قاعدة البيانات فارغة، نملأها تلقائياً لتجنب انهيار حساب Average في الـ View
        // سبب المشكلة: LINQ's Average() ترمي استثناء عند تطبيقها على قائمة فارغة
        if (!stories.Any())
        {
            _logger.LogInformation("Database is empty. Seeding initial stories for Admin dashboard");

            var seedStories = SeedData.GetStories();

            // AddRangeAsync: إضافة قائمة كاملة دفعة واحدة — أكثر كفاءة من Add واحدة واحدة
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }

        // View(stories): يفتح صفحة Razor Views/Admin/Index.cshtml ويمررها قائمة القصص
        return View(stories);
    }

    /// <summary>
    /// Displays the detailed view for a single story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Details(int id, CancellationToken ct = default)
    {
        // جلب القصة بمعرفها من MongoDB
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Details: Story with ID {StoryId} not found", id);
            return NotFound(); // HTTP 404
        }

        return View(story); // يفتح Views/Admin/Details.cshtml
    }

    /// <summary>
    /// Displays the form for creating a new story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        // Task.Yield(): يتيح للدالة أن تكون async حتى لو لا تحتوي على await حقيقي
        // هذا يمنع تحذير المترجم CS1998 ويحافظ على نمط async/await متسق
        await Task.Yield();

        // تمرير نموذج فارغ للـ View لملء حقول النموذج (Form)
        return View(new Story());
    }

    /// <summary>
    /// Handles submission of the new story form, saving it to MongoDB asynchronously.
    /// </summary>
    // [HttpPost]: يستجيب لإرسال النموذج من صفحة Create
    // [ValidateAntiForgeryToken]: يحمي من هجمات CSRF (تزوير الطلبات عبر المواقع)
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Story story, CancellationToken ct = default)
    {
        // ModelState.IsValid: يتحقق أن جميع حقول النموذج صالحة وفق قواعد الـ Model
        if (!ModelState.IsValid)
        {
            return View(story); // أعد عرض النموذج مع رسائل الخطأ
        }

        // حساب المعرف التالي تلقائياً
        var anyStories = await _context.Stories.AnyAsync(ct);
        int nextId = anyStories ? (await _context.Stories.MaxAsync(s => s.Id, ct)) + 1 : 1;
        story.Id = nextId;

        // توليد Slug تلقائياً من العنوان إذا لم يُملأ في النموذج
        if (string.IsNullOrWhiteSpace(story.Slug))
        {
            story.Slug = !string.IsNullOrWhiteSpace(story.Title)
                ? story.Title.Replace(' ', '-').ToLowerInvariant()
                : $"story-{nextId}";
        }

        story.CreatedAt = DateTime.UtcNow;
        await _context.Stories.AddAsync(story, ct);
        await _context.SaveChangesAsync(ct); // الحفظ الفعلي في MongoDB

        _logger.LogInformation("Story '{Title}' (ID: {Id}) created.", story.Title, story.Id);

        // RedirectToAction: إعادة التوجيه إلى صفحة Index بعد الحفظ بنجاح
        // nameof(Index): طريقة آمنة لكتابة اسم الدالة — أفضل من كتابة "Index" كنص مباشر
        return RedirectToAction(nameof(Index));
    }

    /// <summary>
    /// Displays the edit form pre-populated with data for the specified story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Edit(int id, CancellationToken ct = default)
    {
        // جلب القصة لملء نموذج التعديل
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Edit GET: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        return View(story); // يفتح Views/Admin/Edit.cshtml مع بيانات القصة
    }

    /// <summary>
    /// Handles submission of the edited story, saving modifications to MongoDB asynchronously.
    /// </summary>
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Edit(int id, Story story, CancellationToken ct = default)
    {
        // التحقق أن id في الـ URL يطابق id في بيانات النموذج لمنع التلاعب
        if (id != story.Id)
        {
            return BadRequest(); // HTTP 400
        }

        if (!ModelState.IsValid)
        {
            return View(story);
        }

        // جلب السجل الأصلي من MongoDB لتعديله
        var existing = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (existing == null)
        {
            _logger.LogWarning("Admin Edit POST: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        // تطبيق التغييرات على السجل الأصلي
        existing.Title = story.Title;

        // توليد Slug جديد من العنوان إذا لم يُرسَل، وإلا استخدام الـ Slug المُرسَل
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

        // تحديث الصفحات فقط إذا أُرسلت في الطلب
        if (story.Pages != null)
        {
            existing.Pages = story.Pages;
        }

        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct); // حفظ التعديلات في MongoDB
        _logger.LogInformation("Story '{Title}' (ID: {Id}) updated.", story.Title, id);

        return RedirectToAction(nameof(Index));
    }

    /// <summary>
    /// Displays the delete confirmation page for the specified story.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        // جلب القصة لعرضها في صفحة تأكيد الحذف
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Delete GET: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        return View(story); // يفتح Views/Admin/Delete.cshtml لتأكيد الحذف
    }

    /// <summary>
    /// Deletes the specified story from MongoDB asynchronously and redirects to dashboard.
    /// </summary>
    // [HttpPost, ActionName("Delete")]: يربط هذه الدالة بطلبات POST على المسار /Admin/Delete
    // ActionName("Delete"): ضروري لأن لدينا دالتين باسم Delete (GET و POST) في نفس الكلاس
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken ct = default)
    {
        // جلب القصة للتأكد من وجودها قبل الحذف
        var story = await _context.Stories.FirstOrDefaultAsync(s => s.Id == id, ct);
        if (story == null)
        {
            _logger.LogWarning("Admin Delete POST: Story with ID {StoryId} not found", id);
            return NotFound();
        }

        // وضع علامة حذف على السجل في الـ DbContext
        _context.Stories.Remove(story);

        // تنفيذ الحذف الفعلي في MongoDB
        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Story (ID: {Id}) deleted.", id);

        return RedirectToAction(nameof(Index));
    }
}
