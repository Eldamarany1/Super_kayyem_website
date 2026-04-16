using SuperKayyem.Application.DTOs.Packages;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Application.Interfaces;

public interface IPackageService
{
    Task<ApiResponse<List<PackageResponse>>> GetAllAsync();
    Task<ApiResponse<PackageResponse>> GetByIdAsync(string id);
    Task<ApiResponse<PackageResponse>> CreateAsync(CreatePackageRequest request);
    Task<ApiResponse<PackageResponse>> UpdateAsync(string id, UpdatePackageRequest request);
    Task<ApiResponse> DeleteAsync(string id);
}
