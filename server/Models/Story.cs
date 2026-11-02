// ============================================================
// Story.cs — نموذج القصة
// يمثل قصة أطفال واحدة بكامل بياناتها وصفحاتها.
// يرث من BaseEntity لاستخدام: Id, CreatedAt, IsDeleted...
// ============================================================

// استيراد مكتبة MongoDB.EntityFrameworkCore لاستخدام [Collection]
using MongoDB.EntityFrameworkCore;

namespace SuperKayyem.Models;

// [Collection("Stories")]: يخبر EF Core أن سجلات هذا الكلاس
// تُخزَّن في مجموعة "Stories" داخل قاعدة بيانات MongoDB
[Collection("Stories")]
// Story يرث من BaseEntity: يحصل تلقائياً على Id, CreatedAt, IsDeleted...
public class Story : BaseEntity
{
    // عنوان القصة — = string.Empty: قيمة افتراضية فارغة لتجنب null
    public string Title { get; set; } = string.Empty;

    // الرابط اللطيف (URL-friendly slug) مثل: "basem-hope-probe"
    // يُستخدم في روابط الصفحات بدلاً من الأرقام
    public string Slug { get; set; } = string.Empty;

    // فئة القصة (القيمة الأخلاقية): مثل "التعاون"، "الصدق"...
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility alias for Category used by legacy components.
    /// </summary>
    // خاصية توافقية: تسمح باستخدام "ValueLearned" كبديل لـ "Category"
    // get: عند القراءة تُرجع قيمة Category
    // set: عند الكتابة تحفظ في Category
    // هذا يمنع كسر أي كود قديم كان يستخدم الاسم القديم
    public string ValueLearned
    {
        get => Category;
        set => Category = value;
    }

    // الفئة العمرية المستهدفة، مثل: "6-8 سنوات"
    public string TargetAgeGroup { get; set; } = string.Empty;

    // وصف مختصر للقصة يظهر في بطاقة العرض
    public string Description { get; set; } = string.Empty;

    // سعر القصة — decimal: نوع دقيق لتجنب أخطاء التقريب في الأسعار
    public decimal Price { get; set; }

    // تقييم القصة من 0 إلى 5 — double: يسمح بقيم عشرية مثل 4.8
    public double Rating { get; set; }

    // مسار أو رابط صورة غلاف القصة
    public string CoverImage { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility alias for CoverImage used by legacy components.
    /// </summary>
    // خاصية توافقية: تسمح باستخدام "CoverImageUrl" كبديل لـ "CoverImage"
    public string CoverImageUrl
    {
        get => CoverImage;
        set => CoverImage = value;
    }

    // عدد صفحات القصة
    public int PageCount { get; set; }

    // قائمة صفحات القصة (محتوى كل صفحة)
    // = []: تهيئة القائمة كفارغة — C# 12 collection expression syntax
    public List<StoryPageItem> Pages { get; set; } = [];
}

// StoryPageItem: يمثل صفحة واحدة داخل القصة (مُدمَجة في وثيقة Story)
public class StoryPageItem
{
    // رقم الصفحة داخل القصة (1، 2، 3...)
    public int PageNum { get; set; }

    // نص محتوى هذه الصفحة من القصة
    public string Content { get; set; } = string.Empty;
}
