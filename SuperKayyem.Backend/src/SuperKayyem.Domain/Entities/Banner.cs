using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Domain.Entities;

/// <summary>Dynamic homepage banner managed via Admin CMS endpoints.</summary>
[BsonIgnoreExtraElements]
public sealed class Banner : BaseEntity
{
    public string ImageUrl { get; private set; }
    public string? Link { get; private set; }
    public bool IsActive { get; private set; }

    private Banner() 
    {
        ImageUrl = string.Empty;
    }

    public static Banner Create(string imageUrl, string? link)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) throw new ArgumentException("ImageUrl is required.");

        return new Banner
        {
            ImageUrl = imageUrl,
            Link = link,
            IsActive = true // Active by default
        };
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }
}
