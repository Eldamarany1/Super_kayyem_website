// ============================================================
// Program.cs — نقطة بداية التطبيق (Entry Point)
// هنا يتم تهيئة كل خدمات البرنامج قبل أن يبدأ باستقبال الطلبات.
// ============================================================

// استيراد المكتبات المطلوبة
using SuperKayyem.Models;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Services;

// إنشاء كائن builder: هو الذي يبني التطبيق ويضبط إعداداته
var builder = WebApplication.CreateBuilder(args);

#region Original Code Ai Generated Block to be used or understood later
//// Add MVC with Views + API Controllers with camelCase JSON

//builder.Services.AddControllersWithViews()
//    .AddJsonOptions(options =>
//    {
//        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
//    });
#endregion

// تسجيل دعم MVC: يتيح للتطبيق استخدام Controllers و Razor Views معاً
builder.Services.AddControllersWithViews();

// قراءة إعدادات MongoDB من ملف appsettings.json
// GetSection("MongoDbSettings"): يحدد القسم المطلوب من الملف
// .Get<MongoDbSettings>(): يحوّل بيانات JSON إلى كائن C# من نوع MongoDbSettings
var mongoSettings = builder.Configuration.GetSection("MongoDbSettings").Get<MongoDbSettings>();

// تسجيل إعدادات MongoDB في نظام DI حتى تتمكن باقي الأجزاء من استخدامها عبر IOptions<MongoDbSettings>
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));

// تسجيل سياق قاعدة البيانات (DbContext) مع دورة حياة Scoped:
// - Scoped: نسخة جديدة تُنشأ لكل طلب HTTP واحد ثم تُتلف تلقائياً عند انتهائه
// - UseMongoDB: يربط EF Core بقاعدة بيانات MongoDB باستخدام عنوان الاتصال واسم قاعدة البيانات
// - ?? "": إذا كانت القيمة null، استخدم نصاً فارغاً بدلاً من الانهيار
builder.Services.AddDbContext<MongoDbContext>(options => 
    options.UseMongoDB(mongoSettings?.ConnectionString ?? "", mongoSettings?.DatabaseName ?? ""));

// إعداد سياسة CORS: تسمح للفرونت إند بالتواصل مع الـ API
// بدون CORS سيرفض المتصفح أي طلب يأتي من عنوان مختلف عن عنوان الخادم
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // السماح فقط لهذه العناوين: Vite dev, React dev, Local preview
        policy.WithOrigins(
                  "http://localhost:5173",
                  "http://localhost:3000",
                  "http://localhost:5080"
              )
              .AllowAnyHeader()   // السماح بأي header في الطلب
              .AllowAnyMethod();  // السماح بأي HTTP method: GET, POST, PUT, DELETE
    });
});

// بناء التطبيق النهائي بعد تسجيل جميع الخدمات
var app = builder.Build();

// إعداد مسار معالجة الطلبات (HTTP pipeline)
if (!app.Environment.IsDevelopment())
{
    // في بيئة الإنتاج: إعادة التوجيه عند حدوث خطأ غير متوقع
    app.UseExceptionHandler("/Admin/Error");
    // HSTS: يجبر المتصفح على استخدام HTTPS فقط
    app.UseHsts();
}

// تمكين تقديم الملفات الثابتة مثل CSS و JS و الصور من مجلد wwwroot
app.UseStaticFiles();

// تفعيل نظام التوجيه: يطابق عنوان الطلب بالـ Controller المناسب
app.UseRouting();

// تطبيق سياسة CORS على كل الطلبات الواردة
app.UseCors("AllowFrontend");

// تعريف المسار الافتراضي لصفحات MVC (Razor Views)
// {id?}: علامة الـ ? تعني أن id اختياري، مثال: /Admin/Edit/5
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Admin}/{action=Index}/{id?}");

// تفعيل توجيه طلبات API التي تستخدم [ApiController] و [Route("api/...")]
app.MapControllers();

// تشغيل التطبيق والبدء باستقبال الطلبات
app.Run();
