using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// Represents a registered user of the platform.
/// The IsBlocked flag enforces User Moderation (Phase 3).
/// </summary>
[BsonIgnoreExtraElements]
public sealed class User : BaseEntity
{
    public string FullName { get; private set; }
    public string Email { get; private set; }
    public string PasswordHash { get; private set; }
    public string? WhatsAppNumber { get; private set; }
    public UserRole Role { get; private set; }
    public bool IsBlocked { get; private set; }

    [BsonElement("PurchasedStoryIds")]
    private List<string> _purchasedStoryIds = new();

    [BsonElement("PurchasedPackageIds")]
    private List<string> _purchasedPackageIds = new();

    [BsonIgnore]
    public IReadOnlyCollection<string> PurchasedStoryIds => _purchasedStoryIds.AsReadOnly();

    [BsonIgnore]
    public IReadOnlyCollection<string> PurchasedPackageIds => _purchasedPackageIds.AsReadOnly();

    private User() 
    {
        FullName = string.Empty;
        Email = string.Empty;
        PasswordHash = string.Empty;
    }

    public static User Create(string fullName, string email, string passwordHash, string? whatsAppNumber, UserRole role = UserRole.User)
    {
        if (string.IsNullOrWhiteSpace(fullName)) throw new ArgumentException("FullName is required.");
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email is required.");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("PasswordHash is required.");

        return new User
        {
            FullName = fullName.Trim(),
            Email = email.ToLowerInvariant().Trim(),
            PasswordHash = passwordHash,
            WhatsAppNumber = whatsAppNumber?.Trim(),
            Role = role,
            IsBlocked = false
        };
    }

    public void Block()
    {
        IsBlocked = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Unblock()
    {
        IsBlocked = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void GrantStoryAccess(string storyId)
    {
        if (string.IsNullOrWhiteSpace(storyId)) throw new ArgumentException("StoryId is required.");
        if (!_purchasedStoryIds.Contains(storyId))
        {
            _purchasedStoryIds.Add(storyId);
            UpdatedAt = DateTime.UtcNow;
        }
    }

    public void GrantPackageAccess(string packageId)
    {
        if (string.IsNullOrWhiteSpace(packageId)) throw new ArgumentException("PackageId is required.");
        if (!_purchasedPackageIds.Contains(packageId))
        {
            _purchasedPackageIds.Add(packageId);
            UpdatedAt = DateTime.UtcNow;
        }
    }
}
