using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Application.DTOs.Auth;
using SuperKayyem.Application.Interfaces;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Register a new user account.</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _auth.RegisterAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    /// <summary>Login and receive a JWT token.</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _auth.LoginAsync(request);
        return result.Success ? Ok(result) : Unauthorized(result);
    }
}
