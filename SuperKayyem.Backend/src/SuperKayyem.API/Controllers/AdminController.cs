using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Entities;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAnalyticsService _analytics;
    private readonly IUserService _users;
    private readonly IDiscountCodeService _discounts;

    public AdminController(IAnalyticsService analytics, IUserService users, IDiscountCodeService discounts)
    {
        _analytics = analytics;
        _users = users;
        _discounts = discounts;
    }

    // ─── Analytics ──────────────────────────────────────────────────────────

    /// <summary>
    /// Dashboard analytics: monthly active users, sales count, revenue, and top-selling stories.
    /// Powered by MongoDB Aggregation.
    /// </summary>
    [HttpGet("analytics")]
    public async Task<IActionResult> GetAnalytics() => Ok(await _analytics.GetDashboardAnalyticsAsync());

    // ─── User Management ────────────────────────────────────────────────────

    [HttpPost("users/{userId}/block")]
    public async Task<IActionResult> BlockUser(string userId) => Ok(await _users.BlockUserAsync(userId));

    [HttpPost("users/{userId}/unblock")]
    public async Task<IActionResult> UnblockUser(string userId) => Ok(await _users.UnblockUserAsync(userId));

    /// <summary>
    /// Export a clean list of all user emails and WhatsApp numbers
    /// for external bulk-messaging campaigns.
    /// </summary>
    [HttpGet("users/notification-list")]
    public async Task<IActionResult> GetNotificationList() => Ok(await _users.GetNotificationListAsync());

    // ─── Discount Codes ─────────────────────────────────────────────────────

    [HttpGet("discounts")]
    public async Task<IActionResult> GetDiscounts() => Ok(await _discounts.GetAllAsync());

    public record CreateDiscountRequest(string CodeString, SuperKayyem.Domain.Enums.DiscountType DiscountType, decimal Value);

    [HttpPost("discounts")]
    public async Task<IActionResult> CreateDiscount([FromBody] CreateDiscountRequest req) =>
        Ok(await _discounts.CreateAsync(req.CodeString, req.DiscountType, req.Value));

    [HttpPatch("discounts/{id}/toggle")]
    public async Task<IActionResult> ToggleDiscount(string id) =>
        Ok(await _discounts.ToggleActiveAsync(id));
}
