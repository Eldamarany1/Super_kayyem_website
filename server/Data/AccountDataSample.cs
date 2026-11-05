// ============================================================
// AccountDataSample.cs — Sample data for customer accounts
// This class contains static sample data for development and testing.
// Note: This data is in-memory only — not connected to the database.
// ============================================================

using SuperKayyem.Models;

namespace SuperKayyem.Data
{
    // static: you do not need to create an instance — access it directly by name
    public static class AccountSeedData
    {
        // Accounts: static list of sample customer accounts
        // static: shared property across the entire application
        // { get; set; }: can be read and updated from anywhere
        public static List<Account> Accounts { get; set; } = new List<Account>
    {
                // Account 1: Ahmed El-Shinawy — customer with two children
                new Account
                {
                    Id = 1,
                    FirstName = "أحمد",
                    LastName = "الشناوي",
                    Email = "ahmed.elshinawy@example.com",
                    Password = "password123",
                    // new DateTime(year, month, day): creates a birth date
                    DateOfBirth = new DateTime(1988, 5, 14),
                    Gender = "ذكر",
                    ProfilePictureUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
                    OwnedStoryIds = new List<int> { 1, 2, 3, 4 },
                    Children = new List<Child>
                    {
                        new Child { Id = 101, Name = "عمر", Age = 6, Gender = "ذكر" },
                        new Child { Id = 102, Name = "مريم", Age = 8, Gender = "أنثى" }
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
                    Children = new List<Child>
                    {
                        new Child { Id = 103, Name = "يوسف", Age = 5, Gender = "ذكر" }
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
                    Children = new List<Child>
                    {
                        new Child { Id = 104, Name = "نور", Age = 9, Gender = "أنثى" },
                        new Child { Id = 105, Name = "حمزة", Age = 4, Gender = "ذكر" },
                        new Child { Id = 106, Name = "فريدة", Age = 7, Gender = "أنثى" }
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
                    Children = new List<Child>
                    {
                        new Child { Id = 107, Name = "آدم", Age = 3, Gender = "ذكر" }
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
                    Children = new List<Child>
                    {
                        new Child { Id = 108, Name = "جودي", Age = 7, Gender = "أنثى" },
                        new Child { Id = 109, Name = "ياسين", Age = 10, Gender = "ذكر" }
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
                    OwnedStoryIds = new List<int> { 1 },
                    Children = new List<Child>() // No children
                }
            };
        }
    }