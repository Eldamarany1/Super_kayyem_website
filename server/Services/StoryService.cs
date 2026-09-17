namespace SuperKayyem.Services;

using SuperKayyem.Data;
using SuperKayyem.Models;

public class StoryService : IStoryService
{
    private readonly List<Story> _stories;

    public StoryService()
    {
        _stories = SeedData.GetStories();
    }

    public Task<IEnumerable<Story>> GetAllStoriesAsync()
    {
        return Task.FromResult<IEnumerable<Story>>(_stories);
    }

    public Task<Story?> GetStoryByIdAsync(int id)
    {
        var story = _stories.FirstOrDefault(s => s.Id == id);
        return Task.FromResult(story);
    }
}
