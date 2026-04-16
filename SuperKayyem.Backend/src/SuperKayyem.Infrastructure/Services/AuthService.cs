using MongoDB.Driver;
using SuperKayyem.Application.DTOs.Auth;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly MongoDbContext _db;
    private readonly IJwtService _jwt;

    public AuthService(MongoDbContext db, IJwtService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        var existing = await _db.Users
            .Find(u => u.Email == request.Email.ToLower())
            .FirstOrDefaultAsync();

        if (existing is not null)
            return ApiResponse<AuthResponse>.Fail("An account with this email already exists.");

        var user = User.Create(
            request.FullName,
            request.Email,
            BCrypt.Net.BCrypt.HashPassword(request.Password),
            request.WhatsAppNumber
        );

        await _db.Users.InsertOneAsync(user);

        var token = _jwt.GenerateToken(user);
        return ApiResponse<AuthResponse>.Ok(
            new AuthResponse(token, user.Id, user.FullName, user.Email, user.Role.ToString()),
            "Registration successful."
        );
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await _db.Users
            .Find(u => u.Email == request.Email.ToLower())
            .FirstOrDefaultAsync();

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return ApiResponse<AuthResponse>.Fail("Invalid email or password.");

        if (user.IsBlocked)
            return ApiResponse<AuthResponse>.Fail("Your account has been suspended. Please contact support.");

        var token = _jwt.GenerateToken(user);
        return ApiResponse<AuthResponse>.Ok(
            new AuthResponse(token, user.Id, user.FullName, user.Email, user.Role.ToString()),
            "Login successful."
        );
    }
}
