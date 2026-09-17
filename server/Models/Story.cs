namespace SuperKayyem.Models;

public class StoryPageItem
{
    public int PageNum { get; set; }
    public string Content { get; set; } = string.Empty;
}

public class Story
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility alias for Category used by legacy components.
    /// </summary>
    public string ValueLearned
    {
        get => Category;
        set => Category = value;
    }

    public string TargetAgeGroup { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Rating { get; set; }
    public string CoverImage { get; set; } = string.Empty;

    /// <summary>
    /// Compatibility alias for CoverImage used by legacy components.
    /// </summary>
    public string CoverImageUrl
    {
        get => CoverImage;
        set => CoverImage = value;
    }

    public int PageCount { get; set; }
    public List<StoryPageItem> Pages { get; set; } = new();
}
