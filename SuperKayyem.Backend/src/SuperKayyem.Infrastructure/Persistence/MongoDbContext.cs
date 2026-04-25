using MongoDB.Driver;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Infrastructure.Settings;
using Microsoft.Extensions.Options;

namespace SuperKayyem.Infrastructure.Persistence;

/// <summary>
/// Single point of access to all MongoDB collections.
/// Injected as a singleton — MongoClient is thread-safe.
/// </summary>
public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("Users");

    public IMongoCollection<Story> Stories =>
        _database.GetCollection<Story>("Stories");

    /// <summary>Packages are in a separate collection per business requirements.</summary>
    public IMongoCollection<Package> Packages =>
        _database.GetCollection<Package>("Packages");

    public IMongoCollection<Review> Reviews =>
        _database.GetCollection<Review>("Reviews");

    public IMongoCollection<Banner> Banners =>
        _database.GetCollection<Banner>("Banners");

    public IMongoCollection<DiscountCode> DiscountCodes =>
        _database.GetCollection<DiscountCode>("DiscountCodes");

    public IMongoCollection<Transaction> Transactions =>
        _database.GetCollection<Transaction>("Transactions");

    /// <summary>
    /// Per-ownership records linking users to their purchased stories.
    /// Complements User.PurchasedStoryIds for audit, filtering, and rich queries.
    /// </summary>
    public IMongoCollection<UserLibraryItem> UserLibraryItems =>
        _database.GetCollection<UserLibraryItem>("UserLibraryItems");

    /// <summary>Singleton CMS collection — one document only.</summary>
    public IMongoCollection<AboutUsConfig> AboutUsConfigs =>
        _database.GetCollection<AboutUsConfig>("AboutUsConfig");

    public IMongoCollection<ParentArticle> ParentArticles =>
        _database.GetCollection<ParentArticle>("ParentArticles");
}
