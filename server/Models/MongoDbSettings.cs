// ============================================================
// MongoDbSettings.cs — كلاس إعدادات قاعدة بيانات MongoDB
// يتطابق مع قسم "MongoDbSettings" في ملف appsettings.json
// ============================================================

namespace SuperKayyem.Services
{
    public class MongoDbSettings
    {
        // عنوان الاتصال بقاعدة البيانات (يُقرأ من appsettings.json)
        // يجب أن يتطابق اسم الخاصية هنا مع المفتاح في ملف JSON
        public string? ConnectionString { get; set; }

        // خاصية توافقية (Alias): تتيح استخدام الاسم القديم AtlasURI دون كسر أي كود سابق
        // get: عند القراءة تُرجع نفس قيمة ConnectionString
        // set: عند الكتابة تحفظ القيمة في ConnectionString
        public string? AtlasURI { get => ConnectionString; set => ConnectionString = value; }

        // اسم قاعدة البيانات داخل خادم MongoDB
        public string? DatabaseName { get; set; }
    }
}