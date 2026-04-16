using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// A bundle/package of multiple Stories sold together at a discounted price.
/// Stored in a separate 'Packages' MongoDB collection.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class Package : BaseEntity
{
    public string Name { get; private set; }
    public string CoverImageUrl { get; private set; }
    public decimal DiscountedPrice { get; private set; }
    
    [BsonElement("StoryIds")]
    private List<string> _storyIds = new();

    /// <summary>Read-only collection of referenced StoryIds included in this bundle.</summary>
    [BsonIgnore]
    public IReadOnlyCollection<string> StoryIds => _storyIds.AsReadOnly();

    /// <summary>Constructor for BSON deserialization</summary>
    private Package() 
    {
        Name = string.Empty;
        CoverImageUrl = string.Empty;
    }

    public static Package Create(string name, string coverImageUrl, decimal discountedPrice)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.");
        if (discountedPrice < 0) throw new ArgumentException("Price cannot be negative.");

        return new Package
        {
            Name = name,
            CoverImageUrl = coverImageUrl ?? string.Empty,
            DiscountedPrice = discountedPrice
        };
    }

    public void UpdateDetails(string name, string coverImageUrl, decimal discountedPrice)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name is required.");
        if (discountedPrice < 0) throw new ArgumentException("Price cannot be negative.");

        Name = name;
        CoverImageUrl = coverImageUrl;
        DiscountedPrice = discountedPrice;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddStory(string storyId)
    {
        if (string.IsNullOrWhiteSpace(storyId)) throw new ArgumentException("StoryId cannot be empty.");
        if (_storyIds.Contains(storyId)) throw new InvalidOperationException("Story is already in the package.");
        
        _storyIds.Add(storyId);
        UpdatedAt = DateTime.UtcNow;
    }

    public void RemoveStory(string storyId)
    {
        if (_storyIds.Remove(storyId))
        {
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
