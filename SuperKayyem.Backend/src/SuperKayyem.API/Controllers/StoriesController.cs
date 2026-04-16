using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.DTOs.Stories;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoriesController : ControllerBase
{
    private readonly IStoryService _stories;
    public StoriesController(IStoryService stories) => _stories = stories;

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

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateStoryRequest request)
    {
        var result = await _stories.CreateAsync(request);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
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
