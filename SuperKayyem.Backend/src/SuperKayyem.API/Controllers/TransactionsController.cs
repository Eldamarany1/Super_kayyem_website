using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.DTOs.Transactions;
using SuperKayyem.Application.Interfaces;
using System.Security.Claims;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactions;
    public TransactionsController(ITransactionService transactions) => _transactions = transactions;

    /// <summary>
    /// User submits a new transaction with a receipt screenshot URL.
    /// This initiates the PendingVerification workflow.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransactionRequest request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        var result = await _transactions.CreateAsync(userId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Admin: Get all pending transactions awaiting review.</summary>
    [HttpGet("pending")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPending() => Ok(await _transactions.GetPendingAsync());

    /// <summary>Admin: Get all transactions (any status).</summary>
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll() => Ok(await _transactions.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetById(string id)
    {
        var result = await _transactions.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Admin: Approve a transaction — grants user access to the story/package
    /// and logs the revenue into monthly statistics.
    /// </summary>
    [HttpPatch("{id}/approve")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Approve(string id, [FromBody] ReviewTransactionRequest request)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        var result = await _transactions.ApproveAsync(id, adminId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Admin: Reject a transaction with an optional note.</summary>
    [HttpPatch("{id}/reject")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reject(string id, [FromBody] ReviewTransactionRequest request)
    {
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)!;
        var result = await _transactions.RejectAsync(id, adminId, request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Retrieve payment instructions (InstaPay/Vodafone Cash) for the checkout flow.</summary>
    [HttpGet("payment-config")]
    [AllowAnonymous]
    public IActionResult GetPaymentConfig()
        => Ok(SuperKayyem.Domain.Common.ApiResponse<SuperKayyem.Application.DTOs.Payment.PaymentConfigDto>
            .Ok(SuperKayyem.Application.DTOs.Payment.PaymentConfigDto.Default));
}
