namespace SuperKayyem.Infrastructure.Settings;

/// <summary>
/// Bound to the "MongoDB" section in appsettings.json via IOptions pattern.
/// </summary>
public class MongoDbSettings
{
    public string ConnectionString { get; set; } = default!;
    public string DatabaseName { get; set; } = default!;
}

/// <summary>JWT configuration bound to the "Jwt" section in appsettings.json.</summary>
public class JwtSettings
{
    public string SecretKey { get; set; } = default!;
    public string Issuer { get; set; } = default!;
    public string Audience { get; set; } = default!;
    public int ExpiryInDays { get; set; } = 30;
}
