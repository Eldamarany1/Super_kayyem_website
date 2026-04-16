using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.Interfaces;
using System.Security.Claims;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LibraryController : ControllerBase
{
    private readonly ILibraryService _library;
    private readonly IReviewService _reviews;

    public LibraryController(ILibraryService library, IReviewService reviews)
    {
        _library = library;
        _reviews = reviews;
    }

    /// <summary>
    /// Get the authenticated user's purchased stories.
    /// Each item includes a HasReviewed flag.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetMyLibrary()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        return Ok(await _library.GetUserLibraryAsync(userId));
    }

    /// <summary>
    /// Submit a review for a purchased story.
    /// Validates that the story is in the user's library before allowing submission.
    /// </summary>
    [HttpPost("reviews")]
    public async Task<IActionResult> SubmitReview([FromBody] Application.DTOs.Reviews.SubmitReviewRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        var userName = User.FindFirstValue("fullName") ?? "User";
        var result = await _reviews.SubmitReviewAsync(userId, userName, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
