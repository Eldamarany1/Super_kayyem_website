namespace SuperKayyem.Application.DTOs.Packages;

public record CreatePackageRequest(
    string Name,
    string CoverImageUrl,
    decimal DiscountedPrice,
    List<string> StoryIds
);

public record UpdatePackageRequest(
    string? Name,
    string? CoverImageUrl,
    decimal? DiscountedPrice,
    List<string>? StoryIds
);

public record PackageResponse(
    string Id,
    string Name,
    string CoverImageUrl,
    decimal DiscountedPrice,
    List<string> StoryIds,
    DateTime CreatedAt
);
