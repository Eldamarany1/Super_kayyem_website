using SuperKayyem.Application.DTOs.Account;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Application.Interfaces;

/// <summary>
/// Service for managing the authenticated user's own account profile and children.
/// Operates on the caller's own userId extracted from the JWT — not admin operations.
/// </summary>
public interface IAccountService
{
    /// <summary>Fetch the authenticated user's profile, including children.</summary>
    Task<ApiResponse<UserProfileResponse>> GetProfileAsync(string userId);

    /// <summary>Update the authenticated user's editable profile fields (name, WhatsApp).</summary>
    Task<ApiResponse<UserProfileResponse>> UpdateProfileAsync(string userId, UpdateProfileRequest request);

    /// <summary>Add a child to the authenticated user's profile.</summary>
    Task<ApiResponse<UserProfileResponse>> AddChildAsync(string userId, AddChildRequest request);

    /// <summary>Remove a child from the authenticated user's profile.</summary>
    Task<ApiResponse<UserProfileResponse>> RemoveChildAsync(string userId, RemoveChildRequest request);
}
