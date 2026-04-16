namespace SuperKayyem.Application.DTOs.Auth;

public record RegisterRequest(
    string FullName,
    string Email,
    string Password,
    string? WhatsAppNumber
);

public record LoginRequest(
    string Email,
    string Password
);

public record AuthResponse(
    string Token,
    string UserId,
    string FullName,
    string Email,
    string Role
);
