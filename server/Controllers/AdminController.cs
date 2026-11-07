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

/// <summary>
/// Overview Hub Controller for the Super Kayyem Admin Dashboard.
/// Serves the central KPI and cross-link overview.
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
    /// Displays the comprehensive admin overview dashboard with KPIs, entity relations, and cross-links.
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
            AgeGroupDistributions = ageGroups
        };

        return View(viewModel);
    }
}
