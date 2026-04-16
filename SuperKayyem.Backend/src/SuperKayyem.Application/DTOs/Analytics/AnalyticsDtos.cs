namespace SuperKayyem.Application.DTOs.Analytics;

public record MonthlyStats(
    int Year,
    int Month,
    int ActiveUsers,
    int SalesCount,
    decimal TotalRevenue
);

public record TopSellingStory(
    string StoryId,
    string Title,
    int SalesCount,
    decimal TotalRevenue
);

public record DashboardAnalytics(
    List<MonthlyStats> MonthlyStats,
    List<TopSellingStory> TopSellingStories
);
