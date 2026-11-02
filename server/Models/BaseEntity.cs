// ============================================================
// BaseEntity.cs — الكلاس الأساسي لجميع النماذج (Base Model)
// كل نموذج في المشروع يرث منه ويحصل على هذه الخصائص المشتركة تلقائياً.
// ============================================================

namespace SuperKayyem.Models
{
    // BaseEntity: كلاس أساسي يُورَّث — بدلاً من تكرار نفس الحقول في كل نموذج
    public class BaseEntity
    {
        // معرّف فريد لكل سجل في قاعدة البيانات (مثل رقم الهوية)
        public int Id { get; set; }

        // تاريخ ووقت إنشاء السجل (يُسجَّل تلقائياً عند الإضافة)
        public DateTime CreatedAt { get; set; }

        // علامة للحذف الناعم (Soft Delete): بدلاً من حذف السجل نهائياً، نضع true
        // = false: القيمة الافتراضية — السجل موجود وليس محذوفاً
        public bool IsDeleted { get; set; } = false;

        // تاريخ الحذف الناعم — يبقى null ما لم يُحذف السجل
        // DateTime?: علامة ? تعني أن القيمة يمكن أن تكون null (nullable)
        public DateTime? DeletedAt { get; set; }

        // علامة تشير إلى أن السجل تم تعديله
        // = false: القيمة الافتراضية — لم يُعدَّل بعد
        public bool IsUpdated { get; set; } = false;

        // تاريخ آخر تعديل — يبقى null حتى يتم التعديل الأول
        public DateTime? UpdatedAt { get; set; }

        
    }

}