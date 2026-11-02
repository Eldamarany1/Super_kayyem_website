namespace SuperKayyem.Models;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
    [NotMapped]
    public string ValueLearned
    {
        get => Category;
        set => Category = value;
    }

    // Target age for children as integer (4-12 years old)
    [Range(4, 12, ErrorMessage = "العمر المستهدف يجب أن يكون بين 4 و 12 سنة")]
    public int? TargetAge { get; set; } = 4;

    // Compatibility alias for TargetAge (NotMapped so EF Core does not try to read existing string '6-8' from MongoDB)
    [NotMapped]
    public int? TargetAgeGroup
    {
        get => TargetAge;
        set => TargetAge = value;
    }

    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }

    // Rating is nullable: calculated as average from user reviews; null/dash when no reviews yet
    public double? Rating { get; set; }

    public string CoverImage { get; set; } = string.Empty;

    // Compatibility alias for CoverImage used by client components
    [NotMapped]
    public string CoverImageUrl
    {
        get => CoverImage;
        set => CoverImage = value;
    }

    public string? PdfUrl { get; set; }

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
