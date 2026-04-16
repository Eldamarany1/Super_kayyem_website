using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.DTOs.Reviews;
using SuperKayyem.Application.Interfaces;
using System.Security.Claims;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;
    public ReviewsController(IReviewService reviews) => _reviews = reviews;

    /// <summary>Get all visible reviews for a specific story.</summary>
    [HttpGet("story/{storyId}")]
    public async Task<IActionResult> GetByStory(string storyId) =>
        Ok(await _reviews.GetByStoryIdAsync(storyId));

    /// <summary>Submit a review — only for purchased stories.</summary>
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> Submit([FromBody] SubmitReviewRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        var userName = User.FindFirstValue("fullName") ?? "User";
        var result = await _reviews.SubmitReviewAsync(userId, userName, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Admin: hide a review from public view.</summary>
    [HttpPatch("{id}/hide")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Hide(string id) => Ok(await _reviews.HideReviewAsync(id));

    /// <summary>Admin: unhide a previously hidden review.</summary>
    [HttpPatch("{id}/unhide")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Unhide(string id) => Ok(await _reviews.UnhideReviewAsync(id));

    /// <summary>Admin: soft-delete a review permanently.</summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id) => Ok(await _reviews.SoftDeleteReviewAsync(id));
}
