namespace SuperKayyem.Infrastructure.Settings;

public class FileStorageSettings
{
    /// <summary>Absolute or relative path to the folder where uploads are stored.</summary>
    public string RootPath { get; set; } = "uploads";

    /// <summary>Public base URL used to build access URLs returned to the client.</summary>
    public string BaseUrl { get; set; } = "http://localhost:5080/uploads";
}
