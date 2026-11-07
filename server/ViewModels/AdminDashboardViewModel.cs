namespace SuperKayyem.ViewModels;

using SuperKayyem.Models;

public class AdminDashboardViewModel
{
    public int TotalStories { get; set; }
    public int TotalArticles { get; set; }
    public int TotalAccounts { get; set; }
    public int TotalChildren { get; set; }
    public int TotalApprovedAdmins { get; set; }
    public int PendingAdminRequests { get; set; }

    public List<Story> RecentStories { get; set; } = [];
    public List<AdminArticleStatsItem> AdminArticleStats { get; set; } = [];
    public List<AgeGroupDistributionItem> AgeGroupDistributions { get; set; } = [];

    // Analytics and charts dataset (for both initial view and live periodic polling)
    public DashboardAnalyticsDto Analytics { get; set; } = new();

    // Published content catalogs for executive PDF report export
    public List<Story> AllStories { get; set; } = [];
    public List<Article> AllArticles { get; set; } = [];
    public Dictionary<int, int> StoryCurrentMonthSalesCount { get; set; } = new();
}

public class AdminArticleStatsItem
{
    public int AdminId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public int ArticlesCount { get; set; }
    public string? LatestArticleTitle { get; set; }
    public DateTime? LatestArticleDate { get; set; }
}

public class AgeGroupDistributionItem
{
    public string AgeGroup { get; set; } = string.Empty;
    public int StoriesCount { get; set; }
    public int ChildrenCount { get; set; }
}

public class MonthlySalesChartData
{
    public List<string> Labels { get; set; } = [];
    public List<int> StoriesSoldCounts { get; set; } = [];
    public List<decimal> RevenueAmounts { get; set; } = [];
    public int CurrentMonthTotalSalesCount { get; set; }
    public decimal CurrentMonthTotalRevenue { get; set; }
}

public class CategoryPieChartData
{
    public List<string> Labels { get; set; } = [];
    public List<int> Counts { get; set; } = [];
}

public class AgeGroupComparisonChartData
{
    public List<string> Labels { get; set; } = ["4 - 6 سنوات", "6 - 8 سنوات", "8 - 10 سنوات"];
    public List<int> StoryCounts { get; set; } = [];
    public List<int> ChildCounts { get; set; } = [];
}

public class ChildrenInterestsChartData
{
    public List<string> Labels { get; set; } = [];
    public List<int> ChildInterestCounts { get; set; } = [];
    public List<int> AvailableStoriesCounts { get; set; } = [];
}

public class DashboardAnalyticsDto
{
    // Content summary metrics
    public int TotalStories { get; set; }
    public int TotalPdfStories { get; set; }
    public int TotalEditorStories { get; set; }
    public decimal AverageStoryPrice { get; set; }
    public double AverageStoryRating { get; set; }

    public int TotalArticles { get; set; }

    // Aggregated parent & child metrics (strictly aggregated, no personal data)
    public int TotalParentAccounts { get; set; }
    public int TotalRegisteredChildren { get; set; }
    public double AverageChildrenPerAccount { get; set; }

    public string MostPopularChildInterest { get; set; } = string.Empty;
    public string MostPopulatedAgeGroup { get; set; } = string.Empty;

    // Charts datasets
    public MonthlySalesChartData MonthlySalesChart { get; set; } = new();
    public CategoryPieChartData CategoryPieChart { get; set; } = new();
    public AgeGroupComparisonChartData AgeGroupComparisonChart { get; set; } = new();
    public ChildrenInterestsChartData ChildrenInterestsChart { get; set; } = new();

    public string LastUpdatedFormatted { get; set; } = string.Empty;
    public string CurrentMonthName { get; set; } = string.Empty;
}
