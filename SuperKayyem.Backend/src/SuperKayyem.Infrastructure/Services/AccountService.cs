using MongoDB.Driver;
using SuperKayyem.Application.DTOs.Account;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

/// <summary>
/// Handles self-service account operations for an authenticated (non-admin) user.
/// All methods require a valid userId derived from the JWT claims in the controller.
/// </summary>
public class AccountService : IAccountService
{
    private readonly MongoDbContext _db;

    public AccountService(MongoDbContext db) => _db = db;

    // ── Helper: map entity → response DTO ────────────────────────────────────
    private static UserProfileResponse ToDto(Domain.Entities.User user) =>
        new(
            user.Id,
            user.FullName,
            user.Email,
            user.WhatsAppNumber,
            user.Children.Select(c => new ChildProfileDto(c.Name, c.Age, c.Gender ?? "Boy"))
        );

    // ── GET profile ───────────────────────────────────────────────────────────
    public async Task<ApiResponse<UserProfileResponse>> GetProfileAsync(string userId)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null)
            return ApiResponse<UserProfileResponse>.Fail("User not found.");

        return ApiResponse<UserProfileResponse>.Ok(ToDto(user));
    }

    // ── UPDATE profile ────────────────────────────────────────────────────────
    public async Task<ApiResponse<UserProfileResponse>> UpdateProfileAsync(string userId, UpdateProfileRequest request)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null)
            return ApiResponse<UserProfileResponse>.Fail("User not found.");

        user.UpdateProfile(request.FullName, request.WhatsAppNumber);
        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);

        return ApiResponse<UserProfileResponse>.Ok(ToDto(user), "Profile updated successfully.");
    }

    // ── ADD child ─────────────────────────────────────────────────────────────
    public async Task<ApiResponse<UserProfileResponse>> AddChildAsync(string userId, AddChildRequest request)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null)
            return ApiResponse<UserProfileResponse>.Fail("User not found.");

        user.AddChild(request.Name, request.Age, request.Gender);
        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);

        return ApiResponse<UserProfileResponse>.Ok(ToDto(user), "Child added successfully.");
    }

    // ── REMOVE child ──────────────────────────────────────────────────────────
    public async Task<ApiResponse<UserProfileResponse>> RemoveChildAsync(string userId, RemoveChildRequest request)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null)
            return ApiResponse<UserProfileResponse>.Fail("User not found.");

        var removed = user.RemoveChild(request.Name, request.Age);
        if (!removed)
            return ApiResponse<UserProfileResponse>.Fail("Child profile not found.");

        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);

        return ApiResponse<UserProfileResponse>.Ok(ToDto(user), "Child removed successfully.");
    }
}
