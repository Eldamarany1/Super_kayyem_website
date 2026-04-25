using SuperKayyem.Application.DTOs.Analytics;
using SuperKayyem.Application.DTOs.Library;
using SuperKayyem.Application.DTOs.Payment;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;

namespace SuperKayyem.Application.Interfaces;

public interface IAnalyticsService
{
    Task<ApiResponse<DashboardAnalytics>> GetDashboardAnalyticsAsync();
}

public interface IAboutUsService
{
    Task<ApiResponse<AboutUsConfig>> GetAsync();
    Task<ApiResponse<AboutUsConfig>> UpsertAsync(string content, IEnumerable<string>? whatsAppNumbers, IEnumerable<string>? emails, IEnumerable<CoreValue>? coreValues);
}

public interface IBannerService
{
    Task<ApiResponse<List<Banner>>> GetActiveAsync();
    Task<ApiResponse<List<Banner>>> GetAllAsync();
    Task<ApiResponse<Banner>> CreateAsync(string imageUrl, string? link);
    Task<ApiResponse> DeleteAsync(string id);
    Task<ApiResponse<Banner>> ToggleActiveAsync(string id);
}

public record NotificationContactDto(string FullName, string Email, string? WhatsAppNumber);

public interface IUserService
{
    Task<ApiResponse> BlockUserAsync(string userId);
    Task<ApiResponse> UnblockUserAsync(string userId);
    Task<ApiResponse<List<NotificationContactDto>>> GetNotificationListAsync();
}

public interface ILibraryService
{
    Task<ApiResponse<List<LibraryItemResponse>>> GetUserLibraryAsync(string userId);
}

public interface IUserLibraryService
{
    /// <summary>
    /// Returns the rich list of owned stories for the given user,
    /// joining UserLibraryItems with Stories and Reviews collections.
    /// </summary>
    Task<ApiResponse<List<DTOs.Library.UserOwnedStoryResponseDto>>> GetOwnedStoriesAsync(string userId);

    /// <summary>
    /// Records ownership of one or more stories instantly (online payment flow).
    /// Also writes to User.PurchasedStoryIds for backwards-compat with LibraryService.
    /// </summary>
    Task<ApiResponse> RecordPurchaseAsync(string userId, IEnumerable<string> storyIds, string paymentMethod);
}

public interface IDiscountCodeService
{
    Task<ApiResponse<Domain.Entities.DiscountCode>> CreateAsync(string codeString, Domain.Enums.DiscountType discountType, decimal value);
    Task<ApiResponse<List<Domain.Entities.DiscountCode>>> GetAllAsync();
    Task<ApiResponse> ToggleActiveAsync(string id);
    Task<ApiResponse<decimal>> ValidateCodeAsync(string codeString, decimal originalPrice);
}

public interface IJwtService
{
    string GenerateToken(User user);
}

public interface IPaymentConfigService
{
    Task<ApiResponse<PaymentConfigDto>> GetPaymentConfigAsync();
}
