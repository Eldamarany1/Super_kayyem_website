namespace SuperKayyem.Templates;

/*
// ============================================================================
// TEMPLATE: MongoDB Generic Repository Implementation
// TODO: Uncomment when MongoDB is configured.
// Prerequisites:
//   1. Install MongoDB.Driver NuGet package:
//      dotnet add package MongoDB.Driver
//   2. Uncomment the implementation below.
// ============================================================================

using System.Linq.Expressions;
using MongoDB.Driver;

public class MongoRepository<T> : IRepository<T> where T : class
{
    protected readonly IMongoCollection<T> _collection;

    public MongoRepository(MongoDbContext context, string collectionName)
    {
        _collection = context.GetCollection<T>(collectionName);
    }

    public async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task<T?> GetByIdAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("Id", id);
        return await _collection.Find(filter).FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> filter)
    {
        return await _collection.Find(filter).ToListAsync();
    }

    public async Task<T> CreateAsync(T entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(string id, T entity)
    {
        var filter = Builders<T>.Filter.Eq("Id", id);
        var result = await _collection.ReplaceOneAsync(filter, entity);
        return result.IsAcknowledged && result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var filter = Builders<T>.Filter.Eq("Id", id);
        var result = await _collection.DeleteOneAsync(filter);
        return result.IsAcknowledged && result.DeletedCount > 0;
    }
}
*/
