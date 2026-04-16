using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// User review for a purchased story.
/// IsHidden allows admin moderation without permanent deletion (soft-hide).
/// </summary>
[BsonIgnoreExtraElements]
public sealed class Review : BaseEntity
{
    public string StoryId { get; private set; }
    public string UserId { get; private set; }
    public string UserName { get; private set; }
    
    /// <summary>Rating on a 1–5 star scale.</summary>
    public int Rating { get; private set; }
    
    public string Comment { get; private set; }

    /// <summary>
    /// Admin moderation flag. When true, the review is hidden from public view
    /// but not permanently deleted — preserving audit trail.
    /// </summary>
    public bool IsHidden { get; private set; }
    public bool IsDeleted { get; private set; }

    private Review() 
    {
        StoryId = string.Empty;
        UserId = string.Empty;
        UserName = string.Empty;
        Comment = string.Empty;
    }

    public static Review Create(string storyId, string userId, string userName, int rating, string comment)
    {
        if (string.IsNullOrWhiteSpace(storyId)) throw new ArgumentException("StoryId is required.");
        if (string.IsNullOrWhiteSpace(userId)) throw new ArgumentException("UserId is required.");
        if (rating < 1 || rating > 5) throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");

        return new Review
        {
            StoryId = storyId,
            UserId = userId,
            UserName = userName ?? "Unknown",
            Rating = rating,
            Comment = comment ?? string.Empty,
            IsHidden = false,
            IsDeleted = false
        };
    }

    public void Hide()
    {
        IsHidden = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unhide()
    {
        IsHidden = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void SoftDelete()
    {
        IsDeleted = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
