namespace SuperKayyem.Templates;

/*
// ============================================================================
// TEMPLATE: Authentication Service Implementation with JWT & Password Hashing
// TODO: Uncomment when authentication is activated.
// Prerequisites:
//   1. Install Microsoft.AspNetCore.Authentication.JwtBearer:
//      dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
//   2. Configure "Jwt:Key", "Jwt:Issuer", "Jwt:Audience" in appsettings.json.
//   3. Register IAuthService in Program.cs.
// ============================================================================

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request)
    {
        // TEMPLATE: Query user from repository, verify password, and generate token
        await Task.CompletedTask;
        return new AuthResult(false, string.Empty, "Authentication service is in template mode.");
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request)
    {
        // TEMPLATE: Validate unique email, hash password, save user, and generate token
        await Task.CompletedTask;
        return new AuthResult(false, string.Empty, "Registration service is in template mode.");
    }

    public string GenerateJwtToken(string userId, string email, string role)
    {
        var secretKey = _configuration["Jwt:Key"] ?? "SuperKayyemDefaultSecretKey1234567890!@#$";
        var issuer = _configuration["Jwt:Issuer"] ?? "SuperKayyem";
        var audience = _configuration["Jwt:Audience"] ?? "SuperKayyemApp";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations: 100000,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: 32
        );
        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        var parts = passwordHash.Split('.');
        if (parts.Length != 2) return false;

        byte[] salt = Convert.FromBase64String(parts[0]);
        byte[] hash = Convert.FromBase64String(parts[1]);

        byte[] checkHash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations: 100000,
            hashAlgorithm: HashAlgorithmName.SHA256,
            outputLength: 32
        );

        return CryptographicOperations.FixedTimeEquals(hash, checkHash);
    }
}
*/
