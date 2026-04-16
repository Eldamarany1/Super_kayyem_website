using MongoDB.Driver;
using MongoDB.Driver.Linq;
using SuperKayyem.Application.DTOs.Analytics;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Enums;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly MongoDbContext _db;

    public AnalyticsService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<DashboardAnalytics>> GetDashboardAnalyticsAsync()
    {
        var monthlyStats = await GetMonthlyStatsAsync();
        var topStories = await GetTopSellingStoriesAsync();
        return ApiResponse<DashboardAnalytics>.Ok(new DashboardAnalytics(monthlyStats, topStories));
    }

    private async Task<List<MonthlyStats>> GetMonthlyStatsAsync()
    {
        // 1. Native Aggregation for Sales
        var salesAgg = await _db.Transactions
            .Aggregate()
            .Match(t => t.Status == TransactionStatus.Approved)
            .Group(
                t => new { t.CreatedAt.Year, t.CreatedAt.Month },
                g => new { g.Key.Year, g.Key.Month, SalesCount = g.Count(), TotalRevenue = g.Sum(x => x.Amount) }
            )
            .ToListAsync();

        var salesByMonth = salesAgg.ToDictionary(x => (x.Year, x.Month));

        // 2. Native Aggregation for Users
        var usersAgg = await _db.Users
            .Aggregate()
            .Group(
                u => new { u.CreatedAt.Year, u.CreatedAt.Month },
                g => new { g.Key.Year, g.Key.Month, UserCount = g.Count() }
            )
            .ToListAsync();

        var usersByMonth = usersAgg.ToDictionary(x => (x.Year, x.Month), x => x.UserCount);

        // Merge maps cleanly
        var allMonths = salesByMonth.Keys.Union(usersByMonth.Keys).Distinct().OrderBy(m => m.Year).ThenBy(m => m.Month);

        return allMonths.Select(m => new MonthlyStats(
            m.Year, m.Month,
            usersByMonth.GetValueOrDefault(m, 0),
            salesByMonth.TryGetValue(m, out var s) ? s.SalesCount : 0,
            salesByMonth.TryGetValue(m, out var s2) ? s2.TotalRevenue : 0
        )).ToList();
    }

    private async Task<List<TopSellingStory>> GetTopSellingStoriesAsync()
    {
        // Native Aggregation Pipeline inside MongoDB Engine!
        var topSalesAgg = await _db.Transactions
            .Aggregate()
            .Match(t => t.Status == TransactionStatus.Approved && t.ItemType == PurchaseItemType.Story)
            .Group(
                t => t.ItemId,
                g => new { ItemId = g.Key, SalesCount = g.Count(), TotalRevenue = g.Sum(x => x.Amount) }
            )
            .SortByDescending(x => x.SalesCount)
            .Limit(10)
            .ToListAsync();

        var topStoryIds = topSalesAgg.Select(x => x.ItemId).ToList();
        var stories = await _db.Stories.Find(s => topStoryIds.Contains(s.Id)).ToListAsync();
        var storyMap = stories.ToDictionary(s => s.Id, s => s.Title);

        return topSalesAgg.Select(x => new TopSellingStory(
            x.ItemId,
            storyMap.GetValueOrDefault(x.ItemId, "Unknown"),
            x.SalesCount,
            x.TotalRevenue
        )).ToList();
    }
}
