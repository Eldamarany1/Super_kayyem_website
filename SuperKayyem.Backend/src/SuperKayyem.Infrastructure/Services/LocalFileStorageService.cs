using Microsoft.Extensions.Options;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Infrastructure.Settings;

namespace SuperKayyem.Infrastructure.Services;

/// <summary>
/// Stores uploaded files on the local filesystem under <see cref="FileStorageSettings.RootPath"/>.
/// In production, replace this with an Azure Blob or S3 implementation of IFileStorageService.
/// </summary>
public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly FileStorageSettings _settings;

    public LocalFileStorageService(IOptions<FileStorageSettings> settings)
    {
        _settings = settings.Value;
        // Ensure the root directory exists at startup
        Directory.CreateDirectory(_settings.RootPath);
    }

    /// <inheritdoc/>
    public async Task<string> SaveAsync(Stream stream, string fileName, string folder)
    {
        var safeFolder = SanitizeSegment(folder);
        var dir = Path.Combine(_settings.RootPath, safeFolder);
        Directory.CreateDirectory(dir);

        var ext = Path.GetExtension(fileName);
        var uniqueFileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(dir, uniqueFileName);

        await using var fs = File.Create(filePath);
        await stream.CopyToAsync(fs);

        // Return the public URL
        return $"{_settings.BaseUrl.TrimEnd('/')}/{safeFolder}/{uniqueFileName}";
    }

    /// <inheritdoc/>
    public Task DeleteAsync(string publicUrl)
    {
        if (string.IsNullOrWhiteSpace(publicUrl)) return Task.CompletedTask;

        try
        {
            // Convert public URL back to file path
            var baseUrl = _settings.BaseUrl.TrimEnd('/');
            if (!publicUrl.StartsWith(baseUrl, StringComparison.OrdinalIgnoreCase))
                return Task.CompletedTask;

            var relativePath = publicUrl[baseUrl.Length..].TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
            var fullPath = Path.Combine(_settings.RootPath, relativePath);

            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
        catch (IOException)
        {
            // Best-effort delete; log in production
        }

        return Task.CompletedTask;
    }

    private static string SanitizeSegment(string segment) =>
        string.Join("_", segment.Split(Path.GetInvalidPathChars()));
}
