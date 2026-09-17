namespace SuperKayyem.Services;

using SuperKayyem.Models;

public interface IStoryService
{
    Task<IEnumerable<Story>> GetAllStoriesAsync();
    Task<Story?> GetStoryByIdAsync(int id);
}
