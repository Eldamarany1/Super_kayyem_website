using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.DTOs.Account;
using SuperKayyem.Application.Interfaces;
using System.Security.Claims;

namespace SuperKayyem.API.Controllers;

/// <summary>
/// Self-service account management for authenticated users.
/// Exposes profile fetch, profile update, and child management.
/// All endpoints require a valid JWT — the userId is extracted from claims.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IAccountService _account;

    public AccountController(IAccountService account) => _account = account;

    // ── Helper: extract the caller's userId from JWT claims ───────────────────
    private string? GetUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("nameid");

    // ── GET api/account/me ────────────────────────────────────────────────────
    /// <summary>Retrieve the authenticated user's full profile, including children.</summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _account.GetProfileAsync(userId);
        return result.Success ? Ok(result) : NotFound(result);
    }

    // ── PUT api/account/update ────────────────────────────────────────────────
    /// <summary>Update the user's editable fields (name, WhatsApp). Email is immutable.</summary>
    [HttpPut("update")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _account.UpdateProfileAsync(userId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── POST api/account/children ─────────────────────────────────────────────
    /// <summary>Add a child profile to the authenticated user's account.</summary>
    [HttpPost("children")]
    public async Task<IActionResult> AddChild([FromBody] AddChildRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _account.AddChildAsync(userId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── DELETE api/account/children ───────────────────────────────────────────
    /// <summary>Remove a child profile (matched by name + age) from the user's account.</summary>
    [HttpDelete("children")]
    public async Task<IActionResult> RemoveChild([FromBody] RemoveChildRequest request)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var result = await _account.RemoveChildAsync(userId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }
}
