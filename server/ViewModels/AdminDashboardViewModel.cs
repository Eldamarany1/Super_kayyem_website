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
