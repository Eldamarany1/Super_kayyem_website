using MongoDB.Driver;
using SuperKayyem.Application.DTOs.Packages;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class PackageService : IPackageService
{
    private readonly MongoDbContext _db;

    public PackageService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<List<PackageResponse>>> GetAllAsync()
    {
        var packages = await _db.Packages.Find(_ => true).ToListAsync();
        return ApiResponse<List<PackageResponse>>.Ok(packages.Select(Map).ToList());
    }

    public async Task<ApiResponse<PackageResponse>> GetByIdAsync(string id)
    {
        var pkg = await _db.Packages.Find(p => p.Id == id).FirstOrDefaultAsync();
        return pkg is null ? ApiResponse<PackageResponse>.Fail("Package not found.") : ApiResponse<PackageResponse>.Ok(Map(pkg));
    }

    public async Task<ApiResponse<PackageResponse>> CreateAsync(CreatePackageRequest request)
    {
        var pkg = Package.Create(request.Name, request.CoverImageUrl, request.DiscountedPrice);
        foreach (var id in request.StoryIds)
        {
            pkg.AddStory(id);
        }
        await _db.Packages.InsertOneAsync(pkg);
        return ApiResponse<PackageResponse>.Ok(Map(pkg), "Package created.");
    }

    public async Task<ApiResponse<PackageResponse>> UpdateAsync(string id, UpdatePackageRequest request)
    {
        var pkg = await _db.Packages.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (pkg is null) return ApiResponse<PackageResponse>.Fail("Package not found.");

        pkg.UpdateDetails(
            request.Name ?? pkg.Name,
            request.CoverImageUrl ?? pkg.CoverImageUrl,
            request.DiscountedPrice ?? pkg.DiscountedPrice
        );

        if (request.StoryIds is not null)
        {
            // Remove missing
            foreach (var existingId in pkg.StoryIds.ToList())
                if (!request.StoryIds.Contains(existingId)) pkg.RemoveStory(existingId);
            
            // Add new
            foreach (var newId in request.StoryIds)
                if (!pkg.StoryIds.Contains(newId)) pkg.AddStory(newId);
        }

        await _db.Packages.ReplaceOneAsync(p => p.Id == id, pkg);
        return ApiResponse<PackageResponse>.Ok(Map(pkg!), "Package updated.");
    }

    public async Task<ApiResponse> DeleteAsync(string id)
    {
        var result = await _db.Packages.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0 ? ApiResponse.Ok("Package deleted.") : ApiResponse.Fail("Package not found.");
    }

    private static PackageResponse Map(Package p) =>
        new(p.Id, p.Name, p.CoverImageUrl, p.DiscountedPrice, p.StoryIds.ToList(), p.CreatedAt);
}
