using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SuperKayyem.Domain.Common;

/// <summary>
/// Base class for all MongoDB documents.
/// Provides a strongly-typed ObjectId string as the document identifier.
/// </summary>
public abstract class BaseEntity
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
