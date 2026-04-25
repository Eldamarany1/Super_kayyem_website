using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// Parent Article Entity
/// Represents an article published specifically for parents.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class ParentArticle : BaseEntity
{
    public string Title { get; private set; }
    public string Content { get; private set; }
    public string CoverImageUrl { get; private set; }
    public bool IsPublished { get; private set; }

    /// <summary>Constructor for BSON deserialization</summary>
    private ParentArticle()
    {
        Title = string.Empty;
        Content = string.Empty;
        CoverImageUrl = string.Empty;
    }

    /// <summary>Creates a newly formed un-published parent article.</summary>
    public static ParentArticle Create(string title, string content, string coverImageUrl)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.");
        if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Content is required.");

        return new ParentArticle
        {
            Title = title,
            Content = content,
            CoverImageUrl = coverImageUrl ?? string.Empty,
            IsPublished = false
        };
    }

    public void Update(string title, string content, string coverImageUrl, bool isPublished)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new ArgumentException("Title is required.");
        if (string.IsNullOrWhiteSpace(content)) throw new ArgumentException("Content is required.");

        Title = title;
        Content = content;
        CoverImageUrl = coverImageUrl ?? string.Empty;
        IsPublished = isPublished;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Publish()
    {
        IsPublished = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unpublish()
    {
        IsPublished = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
