// ============================================================
// Account.cs — Customer account model
// Represents a registered user on the platform with their children's data.
// Inherits from BaseEntity to use: Id, CreatedAt, IsDeleted...
// ============================================================

using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
// Import MongoDB.EntityFrameworkCore to use [Collection] attribute
using MongoDB.EntityFrameworkCore;

namespace SuperKayyem.Models
{
    // [Collection("Accounts")]: Tells EF Core that records of this class
    // are stored in the "Accounts" collection in the MongoDB database
    [Collection ("Accounts")]
    // Account inherits from BaseEntity: gets Id, CreatedAt, IsDeleted automatically
    public class Account : BaseEntity
    {
        // = null!: Default value that tells the compiler the property will be set before use
        // This is needed because nullable reference types are enabled
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = null!;

        // User's profile picture URL (stored in Cloudinary or avatar preset)
        public string? ProfilePictureUrl { get; set; }

        // Compatibility alias for frontend components
        [NotMapped]
        public string? AvatarUrl
        {
            get => ProfilePictureUrl;
            set => ProfilePictureUrl = value;
        }

        // List of owned/purchased story IDs (nullable so existing MongoDB documents without this field don't throw)
        private List<int>? _ownedStoryIds = [];
        public List<int>? OwnedStoryIds
        {
            get => _ownedStoryIds ??= [];
            set => _ownedStoryIds = value ?? [];
        }

        // Detailed purchase history for analytical and sales tracking (nullable so existing MongoDB documents without this field don't throw)
        private List<StoryPurchaseRecord>? _purchasedStories = [];
        public List<StoryPurchaseRecord>? PurchasedStories
        {
            get => _purchasedStories ??= [];
            set => _purchasedStories = value ?? [];
        }

        // List of the customer's children — each child is of type Child (defined below)
        // = []: Initializes an empty list to prevent NullReferenceException
        public List<Child> Children { get; set; } = [];
    }

    // StoryPurchaseRecord: Embedded record for story purchases
    [Owned]
    public class StoryPurchaseRecord
    {
        public int StoryId { get; set; }
        public string? StoryTitle { get; set; } = string.Empty;
        public decimal PricePaid { get; set; }
        public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;
    }

    // Child: Embedded class stored inside the Account document in MongoDB (embedded document)
    // Inherits from BaseEntity mostly to use Id
    public class Child : BaseEntity
    {
        public string Name { get; set; } = null!;
        public int Age { get; set; }

        // string?: The ? mark means Gender is optional (nullable)
        public string? Gender { get; set; } = null!;

        // Interests and favorite educational values selected by or for the child (nullable so existing MongoDB documents without this field don't throw)
        private List<string>? _interests = [];
        public List<string>? Interests
        {
            get => _interests ??= [];
            set => _interests = value ?? [];
        }
    }
}
