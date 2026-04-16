using MongoDB.Driver;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class AboutUsService : IAboutUsService
{
    private readonly MongoDbContext _db;
    public AboutUsService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<AboutUsConfig>> GetAsync()
    {
        var config = await _db.AboutUsConfigs.Find(_ => true).FirstOrDefaultAsync();
        if (config is null) return ApiResponse<AboutUsConfig>.Fail("About Us content has not been configured yet.");
        return ApiResponse<AboutUsConfig>.Ok(config);
    }

    public async Task<ApiResponse<AboutUsConfig>> UpsertAsync(string content, IEnumerable<string>? whatsAppNumbers, IEnumerable<string>? emails, IEnumerable<CoreValue>? coreValues)
    {
        var existing = await _db.AboutUsConfigs.Find(_ => true).FirstOrDefaultAsync();

        if (existing is null)
        {
            var config = AboutUsConfig.Create(content, whatsAppNumbers, emails, coreValues);
            await _db.AboutUsConfigs.InsertOneAsync(config);
            return ApiResponse<AboutUsConfig>.Ok(config, "About Us content created.");
        }
        else
        {
            existing.UpdateDetails(content, whatsAppNumbers, emails, coreValues);
            await _db.AboutUsConfigs.ReplaceOneAsync(c => c.Id == existing.Id, existing);
            return ApiResponse<AboutUsConfig>.Ok(existing, "About Us content updated.");
        }
    }
}

public class BannerService : IBannerService
{
    private readonly MongoDbContext _db;
    public BannerService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<List<Banner>>> GetActiveAsync()
    {
        var banners = await _db.Banners.Find(b => b.IsActive).ToListAsync();
        return ApiResponse<List<Banner>>.Ok(banners);
    }

    public async Task<ApiResponse<List<Banner>>> GetAllAsync()
    {
        var banners = await _db.Banners.Find(_ => true).ToListAsync();
        return ApiResponse<List<Banner>>.Ok(banners);
    }

    public async Task<ApiResponse<Banner>> CreateAsync(string imageUrl, string? link)
    {
        var banner = Banner.Create(imageUrl, link);
        await _db.Banners.InsertOneAsync(banner);
        return ApiResponse<Banner>.Ok(banner,
            "Banner created. Recommended dimensions: 1920×400px (landscape, high-quality JPEG/PNG).");
    }

    public async Task<ApiResponse> DeleteAsync(string id)
    {
        var result = await _db.Banners.DeleteOneAsync(b => b.Id == id);
        return result.DeletedCount > 0 ? ApiResponse.Ok("Banner deleted.") : ApiResponse.Fail("Banner not found.");
    }

    public async Task<ApiResponse<Banner>> ToggleActiveAsync(string id)
    {
        var banner = await _db.Banners.Find(b => b.Id == id).FirstOrDefaultAsync();
        if (banner is null) return ApiResponse<Banner>.Fail("Banner not found.");
        
        if (banner.IsActive) banner.Deactivate();
        else banner.Activate();

        await _db.Banners.ReplaceOneAsync(b => b.Id == id, banner);
        return ApiResponse<Banner>.Ok(banner, $"Banner is now {(banner.IsActive ? "active" : "inactive")}.");
    }
}
