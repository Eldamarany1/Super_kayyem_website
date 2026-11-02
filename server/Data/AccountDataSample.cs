// ============================================================
// AccountDataSample.cs — بيانات تجريبية لحسابات العملاء
// هذا الكلاس يحتوي على بيانات نموذجية ثابتة للتطوير والاختبار.
// ملاحظة: هذه البيانات في الذاكرة فقط — لا ترتبط بقاعدة البيانات.
// ============================================================

using SuperKayyem.Models;

namespace SuperKayyem.Data
{
    // static: يعني أنك لا تحتاج لإنشاء كائن منه — تصل إليه مباشرة بالاسم
    public static class AccountSeedData
    {
        // Accounts: قائمة ثابتة من حسابات العملاء النموذجية
        // static: خاصية مشتركة بين كل أجزاء البرنامج
        // { get; set; }: يمكن قراءتها وتعديلها من أي مكان
        public static List<Account> Accounts { get; set; } = new List<Account>
    {
                // حساب 1: أحمد الشناوي — عميل مع طفلين
                new Account
                {
                    Id = 1,
                    FirstName = "أحمد",
                    LastName = "الشناوي",
                    Email = "ahmed.elshinawy@example.com",
                    Password = "password123",
                    // new DateTime(السنة, الشهر, اليوم): طريقة إنشاء تاريخ ميلاد
                    DateOfBirth = new DateTime(1988, 5, 14),
                    Gender = "ذكر",
                    Children = new List<Child>
                    {
                        new Child { Id = 101, Name = "عمر", Age = 6, Gender = "ذكر" },
                        new Child { Id = 102, Name = "مريم", Age = 8, Gender = "أنثى" }
                    }
                },
                // حساب 2: سارة محمود — عميلة مع طفل واحد
                new Account
                {
                    Id = 2,
                    FirstName = "سارة",
                    LastName = "محمود",
                    Email = "sara.mahmoud@example.com",
                    Password = "password123",
                    DateOfBirth = new DateTime(1992, 11, 23),
                    Gender = "أنثى",
                    Children = new List<Child>
                    {
                        new Child { Id = 103, Name = "يوسف", Age = 5, Gender = "ذكر" }
                    }
                },
                // حساب 3: كريم عبد العزيز — عميل مع ثلاثة أطفال
                new Account
                {
                    Id = 3,
                    FirstName = "كريم",
                    LastName = "عبد العزيز",
                    Email = "karim.abdelaziz@example.com",
                    Password = "password123",
                    DateOfBirth = new DateTime(1985, 3, 10),
                    Gender = "ذكر",
                    Children = new List<Child>
                    {
                        new Child { Id = 104, Name = "نور", Age = 9, Gender = "أنثى" },
                        new Child { Id = 105, Name = "حمزة", Age = 4, Gender = "ذكر" },
                        new Child { Id = 106, Name = "فريدة", Age = 7, Gender = "أنثى" }
                    }
                },
                // حساب 4: منى النجار — عميلة مع طفل واحد
                new Account
                {
                    Id = 4,
                    FirstName = "منى",
                    LastName = "النجار",
                    Email = "mona.elnaggar@example.com",
                    Password = "password123",
                    DateOfBirth = new DateTime(1995, 8, 19),
                    Gender = "أنثى",
                    Children = new List<Child>
                    {
                        new Child { Id = 107, Name = "آدم", Age = 3, Gender = "ذكر" }
                    }
                },
                // حساب 5: طارق السيد — عميل مع طفلين
                new Account
                {
                    Id = 5,
                    FirstName = "طارق",
                    LastName = "السيد",
                    Email = "tarek.elsayed@example.com",
                    Password = "password123",
                    DateOfBirth = new DateTime(1990, 1, 5),
                    Gender = "ذكر",
                    Children = new List<Child>
                    {
                        new Child { Id = 108, Name = "جودي", Age = 7, Gender = "أنثى" },
                        new Child { Id = 109, Name = "ياسين", Age = 10, Gender = "ذكر" }
                    }
                },
                // حساب 6: ريهام حسن — عميلة بدون أطفال مسجلين
                new Account
                {
                    Id = 6,
                    FirstName = "ريهام",
                    LastName = "حسن",
                    Email = "reham.hassan@example.com",
                    Password = "password123",
                    DateOfBirth = new DateTime(1993, 7, 30),
                    Gender = "أنثى",
                    Children = new List<Child>() // بدون أطفال
                }
            };
        }
    }