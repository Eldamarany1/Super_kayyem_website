using SuperKayyem.Application.DTOs.Auth;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
}
