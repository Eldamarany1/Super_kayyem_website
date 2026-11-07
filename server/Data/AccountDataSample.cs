// ============================================================
// AccountDataSample.cs — Sample data for customer accounts
// This class contains static sample data for development, testing, and analytics.
// Provides realistic purchase histories for current-month sales analytics.
// ============================================================

namespace SuperKayyem.Data;

using SuperKayyem.Models;

/// <summary>
/// Alias for AccountSeedData to provide direct access via AccountDataSample.Accounts
/// </summary>
public static class AccountDataSample
{
    public static List<Account> Accounts => AccountSeedData.Accounts;
}

public static class AccountSeedData
{
    private static DateTime GetCurrentMonthDate(int day, int hour = 14)
    {
        var now = DateTime.UtcNow;
        int safeDay = Math.Clamp(day, 1, DateTime.DaysInMonth(now.Year, now.Month));
        return new DateTime(now.Year, now.Month, safeDay, hour, 30, 0, DateTimeKind.Utc);
    }

    // Accounts: static list of sample customer accounts with realistic current-month purchases
    public static List<Account> Accounts { get; set; } = BuildSampleAccounts();

    public static List<Account> BuildSampleAccounts()
    {
        return new List<Account>
        {
            // Account 1: Ahmed El-Shinawy — customer with two children
            new Account
            {
                Id = 1,
                FirstName = "أحمد",
                LastName = "الشناوي",
                Email = "ahmed.elshinawy@example.com",
                Password = "password123",
                DateOfBirth = new DateTime(1988, 5, 14),
                Gender = "ذكر",
                ProfilePictureUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
                OwnedStoryIds = new List<int> { 1, 2, 3, 4 },
                PurchasedStories = new List<StoryPurchaseRecord>
                {
                    new() { StoryId = 1, StoryTitle = "باسم ومسبار الأمل", PricePaid = 35.00m, PurchasedAt = GetCurrentMonthDate(2, 10) },
                    new() { StoryId = 2, StoryTitle = "سر اللؤلؤة الزرقاء", PricePaid = 40.00m, PurchasedAt = GetCurrentMonthDate(8, 14) },
                    new() { StoryId = 3, StoryTitle = "خريطة الشجرة العتيقة", PricePaid = 45.00m, PurchasedAt = GetCurrentMonthDate(15, 16) },
                    new() { StoryId = 4, StoryTitle = "حارس الواحة الصغير", PricePaid = 35.00m, PurchasedAt = GetCurrentMonthDate(22, 11) }
                },
                Children = new List<Child>
                {
                    new() { Id = 101, Name = "عمر", Age = 6, Gender = "ذكر", Interests = new List<string> { "التعاون", "الشجاعة", "الاستكشاف" } },
                    new() { Id = 102, Name = "مريم", Age = 8, Gender = "أنثى", Interests = new List<string> { "الصدق", "التعاون", "القراءة" } }
                }
            },
            // Account 2: Sara Mahmoud — customer with one child
            new Account
            {
                Id = 2,
                FirstName = "سارة",
                LastName = "محمود",
                Email = "sara.mahmoud@example.com",
                Password = "password123",
                DateOfBirth = new DateTime(1992, 11, 23),
                Gender = "أنثى",
                ProfilePictureUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
                OwnedStoryIds = new List<int> { 1, 2 },
                PurchasedStories = new List<StoryPurchaseRecord>
                {
                    new() { StoryId = 1, StoryTitle = "باسم ومسبار الأمل", PricePaid = 35.00m, PurchasedAt = GetCurrentMonthDate(5, 9) },
                    new() { StoryId = 2, StoryTitle = "سر اللؤلؤة الزرقاء", PricePaid = 40.00m, PurchasedAt = GetCurrentMonthDate(19, 15) }
                },
                Children = new List<Child>
                {
                    new() { Id = 103, Name = "يوسف", Age = 5, Gender = "ذكر", Interests = new List<string> { "الشجاعة", "المسؤولية", "الرسم" } }
                }
            },
            // Account 3: Karim Abdelaziz — customer with three children
            new Account
            {
                Id = 3,
                FirstName = "كريم",
                LastName = "عبد العزيز",
                Email = "karim.abdelaziz@example.com",
                Password = "password123",
                DateOfBirth = new DateTime(1985, 3, 10),
                Gender = "ذكر",
                ProfilePictureUrl = "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
                OwnedStoryIds = new List<int> { 1, 3, 5 },
                PurchasedStories = new List<StoryPurchaseRecord>
                {
                    new() { StoryId = 1, StoryTitle = "باسم ومسبار الأمل", PricePaid = 35.00m, PurchasedAt = GetCurrentMonthDate(3, 12) },
                    new() { StoryId = 3, StoryTitle = "خريطة الشجرة العتيقة", PricePaid = 45.00m, PurchasedAt = GetCurrentMonthDate(12, 17) },
                    new() { StoryId = 5, StoryTitle = "جسر النجوم الدافئ", PricePaid = 30.00m, PurchasedAt = GetCurrentMonthDate(25, 18) }
                },
                Children = new List<Child>
                {
                    new() { Id = 104, Name = "نور", Age = 9, Gender = "أنثى", Interests = new List<string> { "الصدق", "العلوم", "الصداقة" } },
                    new() { Id = 105, Name = "حمزة", Age = 4, Gender = "ذكر", Interests = new List<string> { "التعاون", "الشجاعة" } },
                    new() { Id = 106, Name = "فريدة", Age = 7, Gender = "أنثى", Interests = new List<string> { "الصبر", "الصداقة", "التعاون" } }
                }
            },
            // Account 4: Mona El-Naggar — customer with one child
            new Account
            {
                Id = 4,
                FirstName = "منى",
                LastName = "النجار",
                Email = "mona.elnaggar@example.com",
                Password = "password123",
                DateOfBirth = new DateTime(1995, 8, 19),
                Gender = "أنثى",
                ProfilePictureUrl = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
                OwnedStoryIds = new List<int> { 2, 4, 6 },
                PurchasedStories = new List<StoryPurchaseRecord>
                {
                    new() { StoryId = 2, StoryTitle = "سر اللؤلؤة الزرقاء", PricePaid = 40.00m, PurchasedAt = GetCurrentMonthDate(9, 13) },
                    new() { StoryId = 4, StoryTitle = "حارس الواحة الصغير", PricePaid = 35.00m, PurchasedAt = GetCurrentMonthDate(16, 11) },
                    new() { StoryId = 6, StoryTitle = "بذرة الحكمة العجيبة", PricePaid = 50.00m, PurchasedAt = GetCurrentMonthDate(27, 20) }
                },
                Children = new List<Child>
                {
                    new() { Id = 107, Name = "آدم", Age = 3, Gender = "ذكر", Interests = new List<string> { "الاستكشاف", "الشجاعة" } }
                }
            },
            // Account 5: Tarek El-Sayed — customer with two children
            new Account
            {
                Id = 5,
                FirstName = "طارق",
                LastName = "السيد",
                Email = "tarek.elsayed@example.com",
                Password = "password123",
                DateOfBirth = new DateTime(1990, 1, 5),
                Gender = "ذكر",
                ProfilePictureUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
                OwnedStoryIds = new List<int> { 1, 2, 3, 4, 5, 6 },
                PurchasedStories = new List<StoryPurchaseRecord>
                {
                    new() { StoryId = 1, StoryTitle = "باسم ومسبار الأمل", PricePaid = 35.00m, PurchasedAt = GetCurrentMonthDate(4, 15) },
                    new() { StoryId = 2, StoryTitle = "سر اللؤلؤة الزرقاء", PricePaid = 40.00m, PurchasedAt = GetCurrentMonthDate(11, 10) },
                    new() { StoryId = 3, StoryTitle = "خريطة الشجرة العتيقة", PricePaid = 45.00m, PurchasedAt = GetCurrentMonthDate(18, 14) },
                    new() { StoryId = 5, StoryTitle = "جسر النجوم الدافئ", PricePaid = 30.00m, PurchasedAt = GetCurrentMonthDate(24, 16) }
                },
                Children = new List<Child>
                {
                    new() { Id = 108, Name = "جودي", Age = 7, Gender = "أنثى", Interests = new List<string> { "المسؤولية", "الصدق", "التعاون" } },
                    new() { Id = 109, Name = "ياسين", Age = 10, Gender = "ذكر", Interests = new List<string> { "الشجاعة", "العلوم", "الصبر" } }
                }
            },
            // Account 6: Reham Hassan — customer without registered children
            new Account
            {
                Id = 6,
                FirstName = "ريهام",
                LastName = "حسن",
                Email = "reham.hassan@example.com",
                Password = "password123",
                DateOfBirth = new DateTime(1993, 7, 30),
                Gender = "أنثى",
                ProfilePictureUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
                OwnedStoryIds = new List<int> { 1, 6 },
                PurchasedStories = new List<StoryPurchaseRecord>
                {
                    new() { StoryId = 1, StoryTitle = "باسم ومسبار الأمل", PricePaid = 35.00m, PurchasedAt = GetCurrentMonthDate(7, 19) },
                    new() { StoryId = 6, StoryTitle = "بذرة الحكمة العجيبة", PricePaid = 50.00m, PurchasedAt = GetCurrentMonthDate(21, 12) }
                },
                Children = new List<Child>() // No children
            }
        };
    }
}