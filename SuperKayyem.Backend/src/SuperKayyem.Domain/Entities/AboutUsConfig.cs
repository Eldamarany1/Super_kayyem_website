using MongoDB.Bson.Serialization.Attributes;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Domain.Entities;

/// <summary>
/// Singleton CMS document for the "About Us" page.
/// Stored as a single document in MongoDB — Admin can update without code changes.
/// Physical addresses are explicitly excluded per business requirements.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class AboutUsConfig : BaseEntity
{
    /// <summary>Singleton marker — only one document should exist.</summary>
    public static readonly string SingletonKey = "about_us_singleton";

    public string Content { get; private set; }

    [BsonElement("WhatsAppNumbers")]
    private List<string> _whatsAppNumbers = new();
    
    [BsonElement("Emails")]
    private List<string> _emails = new();
    
    [BsonElement("CoreValues")]
    private List<CoreValue> _coreValues = new();

    [BsonIgnore]
    public IReadOnlyCollection<string> WhatsAppNumbers => _whatsAppNumbers.AsReadOnly();
    
    [BsonIgnore]
    public IReadOnlyCollection<string> Emails => _emails.AsReadOnly();
    
    [BsonIgnore]
    public IReadOnlyCollection<CoreValue> CoreValues => _coreValues.AsReadOnly();

    private AboutUsConfig() 
    {
        Content = string.Empty;
    }

    public static AboutUsConfig Create(string content, IEnumerable<string>? whatsAppNumbers, IEnumerable<string>? emails, IEnumerable<CoreValue>? coreValues)
    {
        var config = new AboutUsConfig();
        config.UpdateDetails(content, whatsAppNumbers, emails, coreValues);
        return config;
    }

    public void UpdateDetails(string content, IEnumerable<string>? whatsAppNumbers, IEnumerable<string>? emails, IEnumerable<CoreValue>? coreValues)
    {
        Content = content?.Trim() ?? string.Empty;
        
        _whatsAppNumbers = (whatsAppNumbers ?? Array.Empty<string>())
            .Where(w => !string.IsNullOrWhiteSpace(w))
            .Distinct()
            .ToList();
            
        _emails = (emails ?? Array.Empty<string>())
            .Where(e => !string.IsNullOrWhiteSpace(e))
            .Select(e => e.ToLowerInvariant().Trim())
            .Distinct()
            .ToList();
            
        _coreValues = (coreValues ?? Array.Empty<CoreValue>())
            .Where(c => !string.IsNullOrWhiteSpace(c.Title))
            .ToList();

        UpdatedAt = DateTime.UtcNow;
    }
}

public class CoreValue
{
    public string Title { get; set; } = default!;
    public string Description { get; set; } = default!;
}
