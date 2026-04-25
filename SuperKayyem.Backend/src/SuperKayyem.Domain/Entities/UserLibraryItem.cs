using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// Represents a single story owned by a user as a result of a purchase.
/// Stored in the "UserLibraryItems" collection.
/// This is a separate collection for fast ownership queries and audit trails,
/// complementing the denormalized PurchasedStoryIds list on the User document.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class UserLibraryItem : BaseEntity
{
    /// <summary>The MongoDB ObjectId string of the owning user.</summary>
    public string UserId { get; private set; }

    /// <summary>The MongoDB ObjectId string of the purchased story.</summary>
    public string StoryId { get; private set; }

    /// <summary>UTC timestamp when the purchase was completed.</summary>
    public DateTime PurchaseDate { get; private set; }

    /// <summary>
    /// Payment method used ("CreditCard", "Instapay", "VodafoneCash", "ManualReceipt").
    /// </summary>
    public string PaymentMethod { get; private set; }

    // Private BSON constructor
    private UserLibraryItem()
    {
        UserId        = string.Empty;
        StoryId       = string.Empty;
        PaymentMethod = string.Empty;
    }

    /// <summary>
    /// Factory — creates a validated ownership record.
    /// </summary>
    public static UserLibraryItem Create(string userId, string storyId, string paymentMethod = "Online")
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("UserId is required.", nameof(userId));

        if (string.IsNullOrWhiteSpace(storyId))
            throw new ArgumentException("StoryId is required.", nameof(storyId));

        return new UserLibraryItem
        {
            UserId        = userId,
            StoryId       = storyId,
            PaymentMethod = paymentMethod,
            PurchaseDate  = DateTime.UtcNow,
        };
    }
}
