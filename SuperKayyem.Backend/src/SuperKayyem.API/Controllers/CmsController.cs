using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Entities;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CmsController : ControllerBase
{
    private readonly IAboutUsService _aboutUs;
    private readonly IBannerService _banners;

    public CmsController(IAboutUsService aboutUs, IBannerService banners)
    {
        _aboutUs = aboutUs;
        _banners = banners;
    }

    // ─── About Us ───────────────────────────────────────────────────────────

    /// <summary>Get the About Us page content (public).</summary>
    [HttpGet("about")]
    public async Task<IActionResult> GetAbout() => Ok(await _aboutUs.GetAsync());

    public record UpsertAboutUsRequest(string Content, List<string> WhatsAppNumbers, List<string> Emails, List<CoreValue> CoreValues);

    [HttpPut("about")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpsertAbout([FromBody] UpsertAboutUsRequest req) =>
        Ok(await _aboutUs.UpsertAsync(req.Content, req.WhatsAppNumbers, req.Emails, req.CoreValues));

    // ─── Banners ────────────────────────────────────────────────────────────

    /// <summary>Get all active banners for the homepage (public).</summary>
    [HttpGet("banners")]
    public async Task<IActionResult> GetActiveBanners() => Ok(await _banners.GetActiveAsync());

    /// <summary>Admin: Get all banners including inactive ones.</summary>
    [HttpGet("banners/all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllBanners() => Ok(await _banners.GetAllAsync());

    /// <summary>
    /// Admin: Add a new banner.
    /// Note: Recommended banner dimensions are 1920×400px (landscape JPEG/PNG).
    /// </summary>
    public record CreateBannerRequest(string ImageUrl, string? Link);

    [HttpPost("banners")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateBanner([FromBody] CreateBannerRequest req) =>
        Ok(await _banners.CreateAsync(req.ImageUrl, req.Link));

    [HttpDelete("banners/{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteBanner(string id)
    {
        var result = await _banners.DeleteAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPatch("banners/{id}/toggle")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> ToggleBanner(string id) =>
        Ok(await _banners.ToggleActiveAsync(id));
}
