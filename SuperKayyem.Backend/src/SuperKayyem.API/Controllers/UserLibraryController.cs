using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.Interfaces;
using System.Security.Claims;

namespace SuperKayyem.API.Controllers;

/// <summary>
/// Dedicated controller for the user's owned-story library.
/// Route: /api/user-library
/// All endpoints require JWT authentication.
/// </summary>
[ApiController]
[Route("api/user-library")]
[Authorize]
public class UserLibraryController : ControllerBase
{
    private readonly IUserLibraryService _userLibrary;

    public UserLibraryController(IUserLibraryService userLibrary)
    {
        _userLibrary = userLibrary;
    }

    // ── Helper ──────────────────────────────────────────────────────────────
    private string GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)
           ?? throw new UnauthorizedAccessException("User identity not found in token.");

    // ── Endpoints ───────────────────────────────────────────────────────────

    /// <summary>
    /// GET /api/user-library/me
    /// Returns the authenticated user's purchased stories with full story details
    /// and purchase metadata (date, payment method, review status).
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyLibrary()
    {
        var userId = GetUserId();
        var result = await _userLibrary.GetOwnedStoriesAsync(userId);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// POST /api/user-library/purchase
    /// Records an instant online payment purchase.
    /// Body: { storyIds: string[], paymentMethod: string }
    /// Called by the frontend CheckoutModal after simulated/real payment succeeds.
    /// </summary>
    [HttpPost("purchase")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RecordPurchase([FromBody] RecordPurchaseRequest request)
    {
        if (request.StoryIds == null || !request.StoryIds.Any())
            return BadRequest(new { success = false, message = "StoryIds is required." });

        var userId = GetUserId();
        var result = await _userLibrary.RecordPurchaseAsync(
            userId, request.StoryIds, request.PaymentMethod ?? "Online");

        return result.Success ? Ok(result) : BadRequest(result);
    }
}

// ── Request DTO ──────────────────────────────────────────────────────────────
public record RecordPurchaseRequest(
    List<string> StoryIds,
    string?      PaymentMethod
);
