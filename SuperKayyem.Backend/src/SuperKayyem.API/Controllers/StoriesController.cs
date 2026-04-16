using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.API.Models;
using SuperKayyem.Application.DTOs.Stories;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoriesController : ControllerBase
{
    private readonly IStoryService _stories;
    private readonly IFileStorageService _files;

    public StoriesController(IStoryService stories, IFileStorageService files)
    {
        _stories = stories;
        _files = files;
    }

    /// <summary>Get all published stories. Admins can also filter by status.</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PublicationStatus? status)
    {
        // Non-admins only see Published stories
        var isAdmin = User.IsInRole("Admin");
        var filter = isAdmin ? status : PublicationStatus.Published;
        var result = await _stories.GetAllAsync(filter);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _stories.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Create a story supplying asset URLs directly (simple JSON variant).
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateStoryRequest request)
    {
        var result = await _stories.CreateAsync(request);
        return result.Success
            ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result)
            : BadRequest(result);
    }

    /// <summary>
    /// Create a story by uploading the cover image and content file directly (multipart/form-data).
    /// The uploaded files are stored locally and their URLs are set on the story automatically.
    /// </summary>
    [HttpPost("upload")]
    [Authorize(Roles = "Admin")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateWithFiles([FromForm] CreateStoryWithFilesRequest request)
    {
        string coverImageUrl = string.Empty;
        string? contentUrl = null;

        // ── Upload cover image ───────────────────────────────────────────────
        if (request.CoverImage is { Length: > 0 })
        {
            await using var coverStream = request.CoverImage.OpenReadStream();
            coverImageUrl = await _files.SaveAsync(coverStream, request.CoverImage.FileName, "covers");
        }
        else if (!string.IsNullOrWhiteSpace(request.CoverImageUrl))
        {
            coverImageUrl = request.CoverImageUrl;
        }

        // ── Upload content file (PDF, etc.) ──────────────────────────────────
        if (request.ContentFile is { Length: > 0 })
        {
            await using var contentStream = request.ContentFile.OpenReadStream();
            contentUrl = await _files.SaveAsync(contentStream, request.ContentFile.FileName, "content");
        }
        else if (!string.IsNullOrWhiteSpace(request.ContentUrl))
        {
            contentUrl = request.ContentUrl;
        }

        if (string.IsNullOrWhiteSpace(coverImageUrl))
            return BadRequest(new { success = false, message = "A cover image or cover image URL is required." });

        var dto = new CreateStoryRequest(
            request.Title,
            coverImageUrl,
            request.Description,
            request.ValueLearned,
            request.TargetAgeGroup,
            request.BookType,
            request.Price,
            contentUrl
        );

        var result = await _stories.CreateAsync(dto);
        return result.Success
            ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result)
            : BadRequest(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateStoryRequest request)
    {
        var result = await _stories.UpdateAsync(id, request);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _stories.DeleteAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPatch("{id}/publish")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Publish(string id) => Ok(await _stories.PublishAsync(id));

    [HttpPatch("{id}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Cancel(string id) => Ok(await _stories.CancelAsync(id));
}
