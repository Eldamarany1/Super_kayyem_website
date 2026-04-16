using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// Core content entity. Represents a Children's Story or a Parenting Guide book.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class Story : BaseEntity
{
    public string Title { get; private set; }
    public string CoverImageUrl { get; private set; }
    public string Description { get; private set; }
    public string ValueLearned { get; private set; }
    public string TargetAgeGroup { get; private set; }
    public BookType BookType { get; private set; }
    public decimal Price { get; private set; }
    public PublicationStatus PublicationStatus { get; private set; }
    public string? ContentUrl { get; private set; }

    /// <summary>Constructor for BSON deserialization</summary>
    private Story() 
    {
        Title = string.Empty;
        CoverImageUrl = string.Empty;
        Description = string.Empty;
        ValueLearned = string.Empty;
        TargetAgeGroup = string.Empty;
    }

    /// <summary>Creates a new Story ensuring invariants.</summary>
    public static Story Create(string title, string coverImageUrl, string description, string valueLearned, string targetAgeGroup, BookType bookType, decimal price)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.");
        if (price < 0) throw new ArgumentException("Price cannot be negative.");

        return new Story
        {
            Title = title,
            CoverImageUrl = coverImageUrl ?? string.Empty,
            Description = description ?? string.Empty,
            ValueLearned = valueLearned ?? string.Empty,
            TargetAgeGroup = targetAgeGroup ?? string.Empty,
            BookType = bookType,
            Price = price,
            PublicationStatus = PublicationStatus.Draft // Default state
        };
    }

    public void UpdateDetails(string title, string coverImageUrl, string description, string valueLearned, string targetAgeGroup, decimal price)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.");
        if (price < 0) throw new ArgumentException("Price cannot be negative.");

        Title = title;
        CoverImageUrl = coverImageUrl;
        Description = description;
        ValueLearned = valueLearned;
        TargetAgeGroup = targetAgeGroup;
        Price = price;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetContent(string url)
    {
        ContentUrl = url;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Publish()
    {
        if (string.IsNullOrWhiteSpace(ContentUrl))
            throw new InvalidOperationException("Cannot publish a story without ContentUrl.");
            
        PublicationStatus = PublicationStatus.Published;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Cancel()
    {
        PublicationStatus = PublicationStatus.Cancelled;
        UpdatedAt = DateTime.UtcNow;
    }
}
