using MongoDB.Driver;
using SuperKayyem.Application.DTOs.Library;
using SuperKayyem.Application.DTOs.Payment;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class LibraryService : ILibraryService
{
    private readonly MongoDbContext _db;
    public LibraryService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<List<LibraryItemResponse>>> GetUserLibraryAsync(string userId)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null) return ApiResponse<List<LibraryItemResponse>>.Fail("User not found.");

        if (user.PurchasedStoryIds.Count == 0)
            return ApiResponse<List<LibraryItemResponse>>.Ok(new List<LibraryItemResponse>());

        var stories = await _db.Stories
            .Find(s => user.PurchasedStoryIds.Contains(s.Id))
            .ToListAsync();

        var userReviews = await _db.Reviews
            .Find(r => r.UserId == userId && !r.IsDeleted)
            .ToListAsync();

        var reviewedStoryIds = userReviews.Select(r => r.StoryId).ToHashSet();

        var items = stories.Select(s => new LibraryItemResponse(
            s.Id, s.Title, s.CoverImageUrl, s.Description,
            reviewedStoryIds.Contains(s.Id)
        )).ToList();

        return ApiResponse<List<LibraryItemResponse>>.Ok(items);
    }
}

/// <summary>
/// Handles the richer owned-story pipeline used by /api/user-library/me
/// and the instant online-payment purchase recording flow.
/// </summary>
public class UserLibraryService : IUserLibraryService
{
    private readonly MongoDbContext _db;
    public UserLibraryService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<List<Application.DTOs.Library.UserOwnedStoryResponseDto>>> GetOwnedStoriesAsync(string userId)
    {
        // Fetch ownership records for this user
        var libraryItems = await _db.UserLibraryItems
            .Find(li => li.UserId == userId)
            .SortByDescending(li => li.PurchaseDate)
            .ToListAsync();

        if (libraryItems.Count == 0)
            return ApiResponse<List<Application.DTOs.Library.UserOwnedStoryResponseDto>>.Ok(
                new List<Application.DTOs.Library.UserOwnedStoryResponseDto>());

        // Fetch all stories in one round-trip
        var storyIds = libraryItems.Select(li => li.StoryId).Distinct().ToList();
        var stories  = await _db.Stories
            .Find(s => storyIds.Contains(s.Id))
            .ToListAsync();
        var storyMap = stories.ToDictionary(s => s.Id);

        // Fetch reviews for HasReviewed flag
        var reviews = await _db.Reviews
            .Find(r => r.UserId == userId && !r.IsDeleted)
            .ToListAsync();
        var reviewedIds = reviews.Select(r => r.StoryId).ToHashSet();

        var result = libraryItems
            .Where(li => storyMap.ContainsKey(li.StoryId))   // guard against orphans
            .Select(li =>
            {
                var s = storyMap[li.StoryId];
                return new Application.DTOs.Library.UserOwnedStoryResponseDto(
                    LibraryItemId:  li.Id,
                    StoryId:        s.Id,
                    Title:          s.Title,
                    CoverImageUrl:  s.CoverImageUrl,
                    Description:    s.Description,
                    ValueLearned:   s.ValueLearned,
                    TargetAgeGroup: s.TargetAgeGroup,
                    Price:          s.Price,
                    PageCount:      null,        // extend Story entity if needed
                    PurchaseDate:   li.PurchaseDate,
                    PaymentMethod:  li.PaymentMethod,
                    HasReviewed:    reviewedIds.Contains(s.Id)
                );
            })
            .ToList();

        return ApiResponse<List<Application.DTOs.Library.UserOwnedStoryResponseDto>>.Ok(result);
    }

    public async Task<ApiResponse> RecordPurchaseAsync(
        string userId, IEnumerable<string> storyIds, string paymentMethod)
    {
        if (string.IsNullOrWhiteSpace(userId))
            return ApiResponse.Fail("UserId is required.");

        var ids = storyIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();
        if (ids.Count == 0)
            return ApiResponse.Fail("No story IDs provided.");

        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null) return ApiResponse.Fail("User not found.");

        // Determine which stories are truly new (not already owned)
        var existingOwnership = await _db.UserLibraryItems
            .Find(li => li.UserId == userId && ids.Contains(li.StoryId))
            .ToListAsync();
        var alreadyOwnedIds = existingOwnership.Select(li => li.StoryId).ToHashSet();

        var newIds = ids.Where(id => !alreadyOwnedIds.Contains(id)).ToList();
        if (newIds.Count == 0)
            return ApiResponse.Ok("All stories already owned — no changes made.");

        // Insert ownership records
        var newItems = newIds
            .Select(id => UserLibraryItem.Create(userId, id, paymentMethod))
            .ToList();
        await _db.UserLibraryItems.InsertManyAsync(newItems);

        // Keep User.PurchasedStoryIds in sync for backwards-compat
        foreach (var id in newIds) user.GrantStoryAccess(id);
        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);

        return ApiResponse.Ok($"{newIds.Count} story/-ies added to library.");
    }
}


public class UserService : IUserService
{
    private readonly MongoDbContext _db;
    public UserService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse> BlockUserAsync(string userId)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null) return ApiResponse.Fail("User not found.");

        user.Block();
        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);
        return ApiResponse.Ok("User blocked.");
    }

    public async Task<ApiResponse> UnblockUserAsync(string userId)
    {
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null) return ApiResponse.Fail("User not found.");

        user.Unblock();
        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);
        return ApiResponse.Ok("User unblocked.");
    }

    public async Task<ApiResponse<List<NotificationContactDto>>> GetNotificationListAsync()
    {
        var users = await _db.Users
            .Find(u => u.Role == Domain.Enums.UserRole.User)
            .ToListAsync();

        var contacts = users.Select(u => new NotificationContactDto(u.FullName, u.Email, u.WhatsAppNumber)).ToList();
        return ApiResponse<List<NotificationContactDto>>.Ok(contacts, $"{contacts.Count} contacts exported.");
    }
}

public class DiscountCodeService : IDiscountCodeService
{
    private readonly MongoDbContext _db;
    public DiscountCodeService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<Domain.Entities.DiscountCode>> CreateAsync(string codeString, Domain.Enums.DiscountType discountType, decimal value)
    {
        var code = Domain.Entities.DiscountCode.Create(codeString, discountType, value);
        await _db.DiscountCodes.InsertOneAsync(code);
        return ApiResponse<Domain.Entities.DiscountCode>.Ok(code, "Discount code created.");
    }

    public async Task<ApiResponse<List<Domain.Entities.DiscountCode>>> GetAllAsync()
    {
        var codes = await _db.DiscountCodes.Find(_ => true).ToListAsync();
        return ApiResponse<List<Domain.Entities.DiscountCode>>.Ok(codes);
    }

    public async Task<ApiResponse> ToggleActiveAsync(string id)
    {
        var code = await _db.DiscountCodes.Find(c => c.Id == id).FirstOrDefaultAsync();
        if (code is null) return ApiResponse.Fail("Discount code not found.");
        
        if (code.IsActive) code.Deactivate();
        else code.Activate();

        await _db.DiscountCodes.ReplaceOneAsync(c => c.Id == id, code);
        return ApiResponse.Ok($"Discount code is now {(code.IsActive ? "active" : "inactive")}.");
    }

    public async Task<ApiResponse<decimal>> ValidateCodeAsync(string codeString, decimal originalPrice)
    {
        var code = await _db.DiscountCodes
            .Find(c => c.CodeString == codeString && c.IsActive)
            .FirstOrDefaultAsync();

        if (code is null) return ApiResponse<decimal>.Fail("Invalid or inactive discount code.");

        var finalPrice = code.DiscountType == Domain.Enums.DiscountType.Percentage
            ? originalPrice * (1 - code.Value / 100)
            : Math.Max(0, originalPrice - code.Value);

        return ApiResponse<decimal>.Ok(finalPrice, $"Code applied. New price: {finalPrice:C}");
    }
}

public class PaymentConfigService : IPaymentConfigService
{
    public Task<ApiResponse<PaymentConfigDto>> GetPaymentConfigAsync()
        => Task.FromResult(ApiResponse<PaymentConfigDto>.Ok(
            PaymentConfigDto.Default,
            "Payment configuration retrieved."
        ));
}
