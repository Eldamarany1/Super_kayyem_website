namespace SuperKayyem.Controllers;

using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Models;
using SuperKayyem.Services;

[ApiController]
[Route("api/[controller]")]
public class StoriesController : ControllerBase
{
    private readonly IStoryService _storyService;
    private readonly ILogger<StoriesController> _logger;

    public StoriesController(IStoryService storyService, ILogger<StoriesController> logger)
    {
        _storyService = storyService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Story>>> GetAll()
    {
        _logger.LogInformation("Fetching all stories");
        var stories = await _storyService.GetAllStoriesAsync();
        return Ok(stories);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        _logger.LogInformation("Fetching story with identifier: {StoryId}", id);
        if (!int.TryParse(id, out int storyId))
        {
            _logger.LogWarning("Invalid story ID format: {StoryId}", id);
            return NotFound(new { error = "Story not found" });
        }

        var story = await _storyService.GetStoryByIdAsync(storyId);
        if (story == null)
        {
            _logger.LogWarning("Story with ID {StoryId} not found", storyId);
            return NotFound(new { error = "Story not found" });
        }

        return Ok(story);
    }
}
