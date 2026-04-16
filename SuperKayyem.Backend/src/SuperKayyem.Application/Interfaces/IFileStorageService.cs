namespace SuperKayyem.Application.Interfaces;

/// <summary>
/// Abstracts file persistence so the implementation can be swapped
/// from local disk to Azure Blob Storage, AWS S3, etc.
/// </summary>
public interface IFileStorageService
{
    /// <summary>
    /// Persists the stream to storage and returns the public URL for the file.
    /// </summary>
    /// <param name="stream">File content to store.</param>
    /// <param name="fileName">Original file name (used for extension detection).</param>
    /// <param name="folder">Logical sub-folder (e.g., "covers", "content").</param>
    Task<string> SaveAsync(Stream stream, string fileName, string folder);

    /// <summary>
    /// Deletes a file by its public URL. No-ops if the file does not exist.
    /// </summary>
    Task DeleteAsync(string publicUrl);
}
