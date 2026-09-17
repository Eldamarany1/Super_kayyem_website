namespace SuperKayyem.Templates;

/*
// ============================================================================
// TEMPLATE: MongoDB Database Context
// TODO: Uncomment when MongoDB is configured.
// Prerequisites:
//   1. Install MongoDB.Driver NuGet package:
//      dotnet add package MongoDB.Driver
//   2. Configure "MongoDb:ConnectionString" and "MongoDb:DatabaseName" in appsettings.json.
//   3. Register MongoDbContext as Singleton in Program.cs.
// ============================================================================

using Microsoft.Extensions.Configuration;
using MongoDB.Driver;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration["MongoDb:ConnectionString"]
            ?? throw new InvalidOperationException("MongoDB connection string is not configured in appsettings.json");
        var databaseName = configuration["MongoDb:DatabaseName"] ?? "SuperKayyemDb";

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<T> GetCollection<T>(string collectionName)
    {
        return _database.GetCollection<T>(collectionName);
    }

    public IMongoDatabase Database => _database;
}
*/
