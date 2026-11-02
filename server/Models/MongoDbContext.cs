/*
// ============================================================================
// TEMPLATE: MongoDB Database Context
// TODO: Uncomment when MongoDB is configured.
// Prerequisites:
//   1. Install MongoDB.Driver NuGet package:
//      dotnet add package MongoDB.Driver
//   2. Configure "MongoDb:ConnectionString" and "MongoDb:DatabaseName" in appsettings.json.
//   3. Register MongoDbContext as Singleton in Program.cs.
// ============================================================================
*/

// ============================================================
// MongoDbContext.cs — سياق قاعدة البيانات (Database Context)
// هذا الكلاس هو الوسيط بين الكود والـ MongoDB Atlas.
// يرث من DbContext الخاص بـ EF Core مع دعم MongoDB
// عبر حزمة MongoDB.EntityFrameworkCore.
// ============================================================

namespace SuperKayyem.Services;

// استيراد المكتبات المطلوبة — بعضها غير مستخدم مباشرة هنا
// لكن مطلوب لكي يعمل EF Core مع MongoDB
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore;
using SuperKayyem.Models;

// DbContext: الكلاس الأساسي في EF Core — نرثه ونضيف عليه مجموعاتنا
public class MongoDbContext : DbContext
{
    // DbSet<Account>: يمثل مجموعة "Accounts" في MongoDB
    // يتيح كتابة استعلامات LINQ مثل: _context.Accounts.ToListAsync()
    public DbSet<Account> Accounts { get; init; }

    // DbSet<Story>: يمثل مجموعة "Stories" في MongoDB
    public DbSet<Story> Stories { get; init; }

    #region Constructor Method 1

    //private readonly IMongoDatabase _database;

    //public AccountMongoDbContext(IConfiguration configuration)
    //{
    //    var connectionString = configuration["mongodb+srv://eldamaranyahmed75_db_user:<db_password>@cluster0.gsekyqe.mongodb.net/?appName=Cluster0"]
    //        ?? throw new InvalidOperationException("MongoDB connection string is not configured in appsettings.json");
    //    var databaseName = configuration["MongoDb:DatabaseName"] ?? "SuperKayyemDb";

    //    var client = new MongoClient(connectionString);
    //    _database = client.GetDatabase(databaseName);

    //  public IMongoCollection<T> GetCollection<T>(string collectionName)
    //  {
    //      return _database.GetCollection<T>(collectionName);
    //  }

    //  public IMongoDatabase Database => _database;
    //  }

    #endregion

    // المُنشئ (Constructor): يستقبل خيارات الاتصال ويمررها لـ DbContext الأساسي
    // DbContextOptions: تحمل إعدادات الاتصال مثل عنوان MongoDB واسم قاعدة البيانات
    // base(options): استدعاء مُنشئ الكلاس الأب (DbContext) بنفس الخيارات
    public MongoDbContext(DbContextOptions options) : base(options)
    {

    }

    // OnModelCreating: يُستدعى تلقائياً عند بناء النموذج لأول مرة
    // نستخدمه لتسجيل الـ Entities (النماذج) مع EF Core حتى يعرف مجموعاتها في MongoDB
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // استدعاء الكود الأساسي في DbContext قبل إضافتنا
        base.OnModelCreating(modelBuilder);

        // تسجيل نموذج Account — سيقرأ اسم المجموعة من [Collection("Accounts")] في الكلاس
        modelBuilder.Entity<Account>();

        // تسجيل نموذج Story — سيقرأ اسم المجموعة من [Collection("Stories")] في الكلاس
        modelBuilder.Entity<Story>();
    }


}
