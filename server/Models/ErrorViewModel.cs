// ============================================================
// ErrorViewModel.cs — نموذج صفحة الخطأ
// يُستخدم من قِبَل Views/Shared/Error.cshtml لعرض معلومات الخطأ.
// ============================================================

namespace SuperKayyem.Models;

public class ErrorViewModel
{
    // معرّف الطلب الذي سبّب الخطأ — مفيد لتتبع المشكلة في سجلات التطبيق
    // string?: يعني أن القيمة قد تكون null (اختيارية)
    public string? RequestId { get; set; }

    // خاصية محسوبة (Computed Property): تُرجع true إذا كان RequestId موجوداً وغير فارغ
    // => تعني "يساوي" — هذه طريقة مختصرة للكتابة بدلاً من { get { return ...; } }
    // تُستخدم في الـ View لإظهار RequestId فقط عندما تكون له قيمة
    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
