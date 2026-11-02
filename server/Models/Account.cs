// ============================================================
// Account.cs — نموذج حساب العميل
// يمثل مستخدماً مسجلاً في المنصة مع بيانات أطفاله.
// يرث من BaseEntity لاستخدام: Id, CreatedAt, IsDeleted...
// ============================================================

// استيراد مكتبة MongoDB.EntityFrameworkCore لاستخدام [Collection]
using MongoDB.EntityFrameworkCore;

namespace SuperKayyem.Models
{
    // [Collection("Accounts")]: يخبر EF Core أن سجلات هذا الكلاس
    // تُخزَّن في مجموعة "Accounts" داخل قاعدة بيانات MongoDB
    [Collection ("Accounts")]
    // Account يرث من BaseEntity: يحصل تلقائياً على Id, CreatedAt, IsDeleted...
    public class Account : BaseEntity
    {
        // = null!: قيمة افتراضية تخبر المترجم "ستُملأ قبل الاستخدام، لا تحذّرني"
        // هذا مطلوب لأن Nullable reference types مفعّل في المشروع
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;

        // قائمة أطفال العميل — كل طفل من نوع Child (معرَّف أدناه)
        // = []: تهيئة القائمة كفارغة لتجنب NullReferenceException
        public List<Child> Children { get; set; } = [];
    }

    // Child: كلاس مُدمَج يُخزَّن داخل سجل Account في MongoDB (Embedded Document)
    // يرث من BaseEntity لاستخدام Id فقط في الغالب
    public class Child : BaseEntity
    {
        public string Name { get; set; } = null!;
        public int Age { get; set; }

        // string?: علامة ? تعني أن الجنس اختياري (يمكن أن يكون null)
        public string? Gender { get; set; } = null!;
    }
}
