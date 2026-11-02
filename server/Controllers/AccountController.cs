// ============================================================
// AccountController.cs — إدارة حسابات العملاء (Razor MVC Views)
// المسار الافتراضي: /Account/AccountList
// يُستخدم لعرض وتعديل وحذف حسابات العملاء عبر صفحات Razor.
// ============================================================

namespace SuperKayyem.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // مطلوب لـ ToListAsync, FirstOrDefaultAsync...
using SuperKayyem.Models;            // مطلوب لنموذجي Account و Child
using SuperKayyem.Services;          // مطلوب لـ MongoDbContext

/// <summary>
/// Controller for managing customer accounts and children profiles via Razor views.
/// </summary>
// يرث من Controller (وليس ControllerBase) لأنه يُرجع Razor Views
public class AccountController : Controller
{
    // _mongoDbContext: الوصول إلى قاعدة البيانات MongoDB
    private readonly MongoDbContext _mongoDbContext;

    // _logger: لتسجيل الأحداث والتحذيرات في سجل التطبيق
    private readonly ILogger<AccountController> _logger;

    // المُنشئ: ASP.NET يحقن MongoDbContext و ILogger تلقائياً عند إنشاء الكائن
    public AccountController(MongoDbContext mongoDbContext, ILogger<AccountController> logger)
    {
        _mongoDbContext = mongoDbContext;
        _logger = logger;
    }

    /// <summary>
    /// Displays the default accounts overview by redirecting to the account list view.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken ct = default)
    {
        // Task.Yield(): يحافظ على كون الدالة async حقاً حتى لو لا تنتظر عملية طويلة
        await Task.Yield();

        // إعادة التوجيه إلى دالة AccountList في نفس الـ Controller
        // nameof(AccountList): أسلوب آمن لكتابة اسم الدالة بدلاً من "AccountList" كنص
        return RedirectToAction(nameof(AccountList));
    }

    /// <summary>
    /// Displays the list of all customer accounts fetched asynchronously from MongoDB.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> AccountList(CancellationToken ct = default)
    {
        // جلب جميع حسابات العملاء من MongoDB بشكل غير متزامن
        var accounts = await _mongoDbContext.Accounts.ToListAsync(ct);

        // تمرير القائمة لصفحة Razor Views/Account/AccountList.cshtml
        return View(accounts);
    }

    /// <summary>
    /// Displays the detailed profile of a single customer account by its identifier.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Read(int id, CancellationToken ct = default)
    {
        // جلب الحساب بمعرفه — FirstOrDefaultAsync يُرجع null إذا لم يجد السجل
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            _logger.LogWarning("Account with ID {AccountId} not found.", id);
            return NotFound(); // HTTP 404
        }

        return View(account); // يفتح Views/Account/Read.cshtml
    }

    /// <summary>
    /// Displays the edit form populated with current account data.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Update(int id, CancellationToken ct = default)
    {
        // جلب الحساب لملء نموذج التعديل بالبيانات الحالية
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            _logger.LogWarning("Account with ID {AccountId} not found for edit.", id);
            return NotFound();
        }

        return View(account); // يفتح Views/Account/Update.cshtml مع بيانات الحساب
    }

    /// <summary>
    /// Saves the modified account details back to MongoDB asynchronously.
    /// </summary>
    // [HttpPost]: يستجيب لإرسال نموذج التعديل
    // [ValidateAntiForgeryToken]: يحمي النموذج من هجمات CSRF
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(Account model, CancellationToken ct = default)
    {
        // إزالة تحقق Password من ModelState لأن هذه الصفحة لا تُعدّل كلمة المرور
        // بدون هذا السطر، سيرفض ModelState النموذج لأن Password يبدو فارغاً
        ModelState.Remove(nameof(model.Password));

        // التحقق من صحة باقي الحقول قبل الحفظ
        if (!ModelState.IsValid)
        {
            return View(model); // أعد عرض النموذج مع رسائل الخطأ
        }

        // جلب الحساب الأصلي من MongoDB لتعديله
        var existingAccount = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == model.Id, ct);
        if (existingAccount == null)
        {
            return NotFound();
        }

        // تطبيق التغييرات على الحساب الأصلي
        existingAccount.FirstName = model.FirstName;
        existingAccount.LastName = model.LastName;
        existingAccount.Email = model.Email;
        existingAccount.DateOfBirth = model.DateOfBirth;
        existingAccount.Gender = model.Gender;

        // تحديث قائمة الأطفال فقط إذا أُرسلت — لتجنب حذف القائمة عند عدم إرسالها
        if (model.Children != null)
        {
            existingAccount.Children = model.Children;
        }

        // تسجيل أن الحساب تم تعديله
        existingAccount.IsUpdated = true;
        existingAccount.UpdatedAt = DateTime.UtcNow;

        // حفظ التعديلات في MongoDB
        await _mongoDbContext.SaveChangesAsync(ct);
        _logger.LogInformation("Account with ID {AccountId} successfully updated.", model.Id);

        return RedirectToAction(nameof(AccountList));
    }

    /// <summary>
    /// Displays the confirmation page for deleting an account.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        // جلب الحساب لعرض تفاصيله في صفحة تأكيد الحذف
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            _logger.LogWarning("Account with ID {AccountId} not found for deletion.", id);
            return NotFound();
        }

        return View(account); // يفتح Views/Account/Delete.cshtml
    }

    /// <summary>
    /// Performs the actual deletion of the specified account from MongoDB asynchronously.
    /// </summary>
    // [HttpPost, ActionName("Delete")]: يربط هذه الدالة بـ POST على /Account/Delete
    // ActionName مطلوب لتمييزها عن دالة Delete [HttpGet] بنفس الاسم
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken ct = default)
    {
        // جلب الحساب للتحقق من وجوده قبل الحذف
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account != null)
        {
            // وضع علامة الحذف على السجل في الـ DbContext
            _mongoDbContext.Accounts.Remove(account);

            // تنفيذ الحذف الفعلي في MongoDB
            await _mongoDbContext.SaveChangesAsync(ct);
            _logger.LogInformation("Account with ID {AccountId} deleted.", id);
        }

        // إعادة التوجيه لقائمة الحسابات بعد الحذف
        return RedirectToAction(nameof(AccountList));
    }
}
