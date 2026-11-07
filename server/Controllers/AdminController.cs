// ============================================================
// AdminController.cs — Comprehensive Admin Dashboard Overview Hub
// Default route: /Admin/Index
// ============================================================

namespace SuperKayyem.Controllers;

using CloudinaryDotNet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;
using SuperKayyem.ViewModels;
using Account = SuperKayyem.Models.Account;

/// <summary>
/// Overview Hub Controller for the Super Kayyem Admin Dashboard.
/// Serves the central KPI, visual analytics charts, live polling, and official PDF status reporting.
/// </summary>
[Authorize(Roles = "SuperAdmin,Admin")]
public class AdminController : Controller
{
    private readonly SuperKayyemDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(SuperKayyemDbContext context, ILogger<AdminController> logger, Cloudinary? cloudinary = null)
    {
        _context = context;
        _logger = logger;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (User.IsInRole("SuperAdmin"))
        {
            try
            {
                ViewBag.PendingRequestsCount = await _context.AdminUsers.CountAsync(u => u.Status == "Pending");
            }
            catch
            {
                // Fallback if db is not reachable
            }
        }
        await next();
    }

    /// <summary>
    /// Displays the comprehensive admin overview dashboard with KPIs, visual analytics, entity relations, and cross-links.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken ct = default)
    {
        // 1. Stories
        var stories = await _context.Stories.AsNoTracking().ToListAsync(ct);
        if (!stories.Any())
        {
            var seedStories = SeedData.GetStories();
            await _context.Stories.AddRangeAsync(seedStories, ct);
            await _context.SaveChangesAsync(ct);
            stories = seedStories;
        }

        // 2. Articles
        var articles = await _context.Articles.AsNoTracking().ToListAsync(ct);
        if (!articles.Any())
        {
            var seedArticles = ArticleSeedData.GetInitialArticles();
            await _context.Articles.AddRangeAsync(seedArticles, ct);
            await _context.SaveChangesAsync(ct);
            articles = seedArticles;
        }

        // 3. Customer Accounts & Children
        var accounts = await _context.Accounts.AsNoTracking().ToListAsync(ct);
        if (!accounts.Any())
        {
            var seedAccounts = AccountSeedData.Accounts;
            await _context.Accounts.AddRangeAsync(seedAccounts, ct);
            await _context.SaveChangesAsync(ct);
            accounts = seedAccounts;
        }

        // 4. Admin Users
        await AdminUserSeedData.EnsureSuperAdminSeededAsync(_context, ct);
        var adminUsers = await _context.AdminUsers.AsNoTracking().ToListAsync(ct);

        var totalStories = stories.Count;
        var totalArticles = articles.Count;
        var totalAccounts = accounts.Count;
        var totalChildren = accounts.Sum(a => a.Children?.Count ?? 0);
        var totalApprovedAdmins = adminUsers.Count(u => u.Status == "Approved");
        var pendingAdminRequests = adminUsers.Count(u => u.Status == "Pending");

        // Recent Stories (5 most recently added)
        var recentStories = stories.OrderByDescending(s => s.CreatedAt).Take(5).ToList();

        // Admin-Articles Relationship
        var adminArticleStats = adminUsers
            .Where(u => u.Status == "Approved")
            .Select(u =>
            {
                var userArticles = articles
                    .Where(a => (!string.IsNullOrWhiteSpace(a.AuthorEmail) && string.Equals(a.AuthorEmail.Trim(), u.Email.Trim(), StringComparison.OrdinalIgnoreCase))
                             || (string.IsNullOrWhiteSpace(a.AuthorEmail) && string.Equals(a.AuthorName?.Trim(), u.FullName.Trim(), StringComparison.OrdinalIgnoreCase)))
                    .OrderByDescending(a => a.PublishedAt)
                    .ToList();

                var latest = userArticles.FirstOrDefault();

                return new AdminArticleStatsItem
                {
                    AdminId = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role,
                    ArticlesCount = userArticles.Count,
                    LatestArticleTitle = latest?.Title,
                    LatestArticleDate = latest?.PublishedAt
                };
            })
            .OrderByDescending(s => s.ArticlesCount)
            .ToList();

        // Age Group Distribution (4-6, 6-8, 8-10)
        var allChildren = accounts.SelectMany(a => a.Children ?? Enumerable.Empty<Child>()).ToList();

        var ageGroups = new List<AgeGroupDistributionItem>
        {
            new AgeGroupDistributionItem
            {
                AgeGroup = "4-6",
                StoriesCount = stories.Count(s => s.TargetAge >= 4 && s.TargetAge <= 6),
                ChildrenCount = allChildren.Count(c => c.Age >= 4 && c.Age <= 6)
            },
            new AgeGroupDistributionItem
            {
                AgeGroup = "6-8",
                StoriesCount = stories.Count(s => s.TargetAge >= 6 && s.TargetAge <= 8),
                ChildrenCount = allChildren.Count(c => c.Age >= 6 && c.Age <= 8)
            },
            new AgeGroupDistributionItem
            {
                AgeGroup = "8-10",
                StoriesCount = stories.Count(s => s.TargetAge >= 8 && s.TargetAge <= 10),
                ChildrenCount = allChildren.Count(c => c.Age >= 8 && c.Age <= 10)
            }
        };

        var analytics = BuildAnalyticsDto(stories, articles, accounts);

        var now = DateTime.UtcNow;
        var allPurchases = accounts
            .SelectMany(a => a.PurchasedStories ?? Enumerable.Empty<StoryPurchaseRecord>())
            .ToList();
        if (!allPurchases.Any())
        {
            allPurchases = AccountSeedData.Accounts
                .SelectMany(a => a.PurchasedStories ?? Enumerable.Empty<StoryPurchaseRecord>())
                .ToList();
        }
        var currentMonthPurchases = allPurchases
            .Where(p => p.PurchasedAt.Year == now.Year && p.PurchasedAt.Month == now.Month)
            .ToList();

        var storySalesMap = stories.ToDictionary(
            s => s.Id,
            s => currentMonthPurchases.Count(p => p.StoryId == s.Id)
        );

        var viewModel = new AdminDashboardViewModel
        {
            TotalStories = totalStories,
            TotalArticles = totalArticles,
            TotalAccounts = totalAccounts,
            TotalChildren = totalChildren,
            TotalApprovedAdmins = totalApprovedAdmins,
            PendingAdminRequests = pendingAdminRequests,
            RecentStories = recentStories,
            AdminArticleStats = adminArticleStats,
            AgeGroupDistributions = ageGroups,
            Analytics = analytics,
            AllStories = stories.OrderBy(s => s.Id).ToList(),
            AllArticles = articles.OrderByDescending(a => a.PublishedAt).ToList(),
            StoryCurrentMonthSalesCount = storySalesMap
        };

        return View(viewModel);
    }

    /// <summary>
    /// Periodic live polling endpoint for dashboard visual analytics charts.
    /// Returns JSON dataset for Chart.js live update every 30 seconds.
    /// </summary>
    [HttpGet]
    [Route("/Admin/AnalyticsData")]
    public async Task<IActionResult> AnalyticsData(CancellationToken ct = default)
    {
        var stories = await _context.Stories.AsNoTracking().ToListAsync(ct);
        if (!stories.Any())
        {
            stories = SeedData.GetStories();
        }

        var articles = await _context.Articles.AsNoTracking().ToListAsync(ct);
        if (!articles.Any())
        {
            articles = ArticleSeedData.GetInitialArticles();
        }

        var accounts = await _context.Accounts.AsNoTracking().ToListAsync(ct);
        if (!accounts.Any())
        {
            accounts = AccountSeedData.Accounts;
        }

        var analytics = BuildAnalyticsDto(stories, articles, accounts);
        return Json(analytics);
    }

    /// <summary>
    /// Helper to aggregate visual analytics datasets for charts and KPI cards.
    /// </summary>
    public static DashboardAnalyticsDto BuildAnalyticsDto(List<Story> stories, List<Article> articles, List<Account> accounts)
    {
        var now = DateTime.UtcNow;
        string[] arabicMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        string currentMonthName = $"{arabicMonths[now.Month - 1]} {now.Year}";

        // Purchases across accounts (fallback to sample seed if accounts have none)
        var allPurchases = accounts
            .SelectMany(a => a.PurchasedStories ?? Enumerable.Empty<StoryPurchaseRecord>())
            .ToList();

        if (!allPurchases.Any())
        {
            allPurchases = AccountSeedData.Accounts
                .SelectMany(a => a.PurchasedStories ?? Enumerable.Empty<StoryPurchaseRecord>())
                .ToList();
        }

        var currentMonthPurchases = allPurchases
            .Where(p => p.PurchasedAt.Year == now.Year && p.PurchasedAt.Month == now.Month)
            .ToList();

        // 1. Monthly Sales Line Chart: 4 Weeks Breakdown
        var w1 = currentMonthPurchases.Where(p => p.PurchasedAt.Day >= 1 && p.PurchasedAt.Day <= 7).ToList();
        var w2 = currentMonthPurchases.Where(p => p.PurchasedAt.Day >= 8 && p.PurchasedAt.Day <= 14).ToList();
        var w3 = currentMonthPurchases.Where(p => p.PurchasedAt.Day >= 15 && p.PurchasedAt.Day <= 21).ToList();
        var w4 = currentMonthPurchases.Where(p => p.PurchasedAt.Day >= 22).ToList();

        var monthlySalesChart = new MonthlySalesChartData
        {
            Labels = ["الأسبوع 1", "الأسبوع 2", "الأسبوع 3", "الأسبوع 4"],
            StoriesSoldCounts = [w1.Count, w2.Count, w3.Count, w4.Count],
            RevenueAmounts = [w1.Sum(p => p.PricePaid), w2.Sum(p => p.PricePaid), w3.Sum(p => p.PricePaid), w4.Sum(p => p.PricePaid)],
            CurrentMonthTotalSalesCount = currentMonthPurchases.Count,
            CurrentMonthTotalRevenue = currentMonthPurchases.Sum(p => p.PricePaid)
        };

        // 2. Category Pie Chart: Stories by Moral Value
        var categoryGroups = stories
            .GroupBy(s => string.IsNullOrWhiteSpace(s.Category) ? "أخرى" : s.Category.Trim())
            .OrderByDescending(g => g.Count())
            .ToList();

        var categoryPieChart = new CategoryPieChartData
        {
            Labels = categoryGroups.Select(g => g.Key).ToList(),
            Counts = categoryGroups.Select(g => g.Count()).ToList()
        };

        // 3. Age Group Comparison Chart
        var allChildren = accounts.SelectMany(a => a.Children ?? Enumerable.Empty<Child>()).ToList();
        if (!allChildren.Any())
        {
            allChildren = AccountSeedData.Accounts.SelectMany(a => a.Children ?? Enumerable.Empty<Child>()).ToList();
        }

        int s46 = stories.Count(s => s.TargetAge >= 4 && s.TargetAge <= 6);
        int s68 = stories.Count(s => s.TargetAge >= 6 && s.TargetAge <= 8);
        int s810 = stories.Count(s => s.TargetAge >= 8 && s.TargetAge <= 10);

        int c46 = allChildren.Count(c => c.Age >= 4 && c.Age <= 6);
        int c68 = allChildren.Count(c => c.Age >= 6 && c.Age <= 8);
        int c810 = allChildren.Count(c => c.Age >= 8 && c.Age <= 10);

        var ageGroupChart = new AgeGroupComparisonChartData
        {
            Labels = ["4 - 6 سنوات", "6 - 8 سنوات", "8 - 10 سنوات"],
            StoryCounts = [s46, s68, s810],
            ChildCounts = [c46, c68, c810]
        };

        int maxChildren = Math.Max(c46, Math.Max(c68, c810));
        string mostPopulatedAge = maxChildren == c68 ? "6 - 8 سنوات" : (maxChildren == c46 ? "4 - 6 سنوات" : "8 - 10 سنوات");

        // 4. Children Interests Chart
        var interestGroups = allChildren
            .SelectMany(c => c.Interests ?? Enumerable.Empty<string>())
            .Where(i => !string.IsNullOrWhiteSpace(i))
            .GroupBy(i => i.Trim())
            .OrderByDescending(g => g.Count())
            .Take(6)
            .ToList();

        if (!interestGroups.Any())
        {
            interestGroups = AccountSeedData.Accounts
                .SelectMany(a => a.Children ?? Enumerable.Empty<Child>())
                .SelectMany(c => c.Interests ?? Enumerable.Empty<string>())
                .GroupBy(i => i.Trim())
                .OrderByDescending(g => g.Count())
                .Take(6)
                .ToList();
        }

        var interestLabels = new List<string>();
        var interestCounts = new List<int>();
        var matchingStories = new List<int>();

        foreach (var grp in interestGroups)
        {
            interestLabels.Add(grp.Key);
            interestCounts.Add(grp.Count());
            matchingStories.Add(stories.Count(s => (s.Category != null && s.Category.Contains(grp.Key))
                                                || (s.Title != null && s.Title.Contains(grp.Key))
                                                || (s.Description != null && s.Description.Contains(grp.Key))));
        }

        var childrenInterestsChart = new ChildrenInterestsChartData
        {
            Labels = interestLabels,
            ChildInterestCounts = interestCounts,
            AvailableStoriesCounts = matchingStories
        };

        int totalStoriesCount = stories.Count;
        int totalPdf = stories.Count(s => !string.IsNullOrWhiteSpace(s.PdfUrl));
        int totalEditor = stories.Count(s => string.IsNullOrWhiteSpace(s.PdfUrl));
        decimal avgPrice = stories.Any() ? Math.Round(stories.Average(s => s.Price), 2) : 0;
        double avgRating = stories.Any()
            ? Math.Round(stories.Where(s => s.Rating.HasValue).Select(s => s.Rating!.Value).DefaultIfEmpty(0).Average(), 1)
            : 0;

        int totalParents = accounts.Count;
        int totalChildrenCount = allChildren.Count;
        double avgChildren = totalParents > 0 ? Math.Round((double)totalChildrenCount / totalParents, 1) : 0;

        return new DashboardAnalyticsDto
        {
            TotalStories = totalStoriesCount,
            TotalPdfStories = totalPdf,
            TotalEditorStories = totalEditor,
            AverageStoryPrice = avgPrice,
            AverageStoryRating = avgRating,
            TotalArticles = articles.Count,
            TotalParentAccounts = totalParents,
            TotalRegisteredChildren = totalChildrenCount,
            AverageChildrenPerAccount = avgChildren,
            MostPopularChildInterest = interestLabels.FirstOrDefault() ?? "التعاون",
            MostPopulatedAgeGroup = mostPopulatedAge,
            MonthlySalesChart = monthlySalesChart,
            CategoryPieChart = categoryPieChart,
            AgeGroupComparisonChart = ageGroupChart,
            ChildrenInterestsChart = childrenInterestsChart,
            LastUpdatedFormatted = DateTime.UtcNow.AddHours(2).ToString("HH:mm:ss"),
            CurrentMonthName = currentMonthName
        };
    }
}
