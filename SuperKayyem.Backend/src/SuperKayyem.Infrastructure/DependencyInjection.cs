using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Infrastructure.Persistence;
using SuperKayyem.Infrastructure.Services;
using SuperKayyem.Infrastructure.Settings;

namespace SuperKayyem.Infrastructure;

/// <summary>
/// Extension method to register all Infrastructure-layer services.
/// Called from API's Program.cs to keep composition root clean.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Settings (strongly-typed, bound via IOptions)
        services.Configure<MongoDbSettings>(configuration.GetSection("MongoDB"));
        services.Configure<JwtSettings>(configuration.GetSection("Jwt"));
        services.Configure<FileStorageSettings>(configuration.GetSection("FileStorage"));

        // MongoDB Context (singleton — MongoClient is thread-safe)
        services.AddSingleton<MongoDbContext>();

        // File Storage (singleton — no state per-request)
        services.AddSingleton<IFileStorageService, LocalFileStorageService>();

        // Application services
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IStoryService, StoryService>();
        services.AddScoped<IPackageService, PackageService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ITransactionService, TransactionService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddScoped<IAboutUsService, AboutUsService>();
        services.AddScoped<IBannerService, BannerService>();
        services.AddScoped<ILibraryService, LibraryService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDiscountCodeService, DiscountCodeService>();
        services.AddScoped<IPaymentConfigService, PaymentConfigService>();

        return services;
    }
}
