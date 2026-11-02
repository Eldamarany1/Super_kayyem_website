namespace SuperKayyem.Models;

public class MongoDBSettings
{
    public string AtlasURI { get; set; } = string.Empty;
    public string DatabaseName { get; set; } = string.Empty;

    // Compatibility alias
    public string ConnectionString
    {
        get => AtlasURI;
        set => AtlasURI = value;
    }
}
