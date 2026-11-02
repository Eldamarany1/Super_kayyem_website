namespace SuperKayyem.Models;

using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore;

// Maps this entity to the "Stories" collection in MongoDB
[Collection("Stories")]
public class Story
{
    // Primary key identifier as integer (used by frontend /api/stories/{id})
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    // Compatibility alias for Category used by client components
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

    // Compatibility alias for CoverImage used by client components
    public string CoverImageUrl
    {
        get => CoverImage;
        set => CoverImage = value;
    }

    public int PageCount { get; set; }

    // Collection of story pages embedded as owned entities
    public List<StoryPageItem> Pages { get; set; } = [];

    // Audit and soft-delete properties
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsDeleted { get; set; } = false;

    public DateTime? DeletedAt { get; set; }

    public bool IsUpdated { get; set; } = false;

    public DateTime? UpdatedAt { get; set; }
}

// Owned entity configuration for story pages embedded inside Story
[Owned]
public class StoryPageItem
{
    public int PageNum { get; set; }

    public string Content { get; set; } = string.Empty;
}
