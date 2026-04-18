using SuperKayyem.Domain.Entities;

namespace SuperKayyem.Application.DTOs.Account;

/// <summary>Response DTO for the current user's profile (GET /api/account/me).</summary>
public record UserProfileResponse(
    string Id,
    string FullName,
    string Email,
    string? WhatsAppNumber,
    IEnumerable<ChildProfileDto> Children
);

/// <summary>A single child in the user's profile.</summary>
public record ChildProfileDto(string Name, int Age, string Gender);

/// <summary>Request DTO for updating the parent's own profile (PUT /api/account/update).</summary>
public record UpdateProfileRequest(
    string FullName,
    string? WhatsAppNumber
);

/// <summary>Request DTO for adding a child (POST /api/account/children).</summary>
public record AddChildRequest(string Name, int Age, string Gender);

/// <summary>Request DTO for removing a child (DELETE /api/account/children).</summary>
public record RemoveChildRequest(string Name, int Age);
