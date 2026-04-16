using SuperKayyem.Domain.Enums;

namespace SuperKayyem.Application.DTOs.Stories;

public record CreateStoryRequest(
    string Title,
    string CoverImageUrl,
    string Description,
    string ValueLearned,
    string TargetAgeGroup,
    BookType BookType,
    decimal Price,
    string? ContentUrl
);

public record UpdateStoryRequest(
    string? Title,
    string? CoverImageUrl,
    string? Description,
    string? ValueLearned,
    string? TargetAgeGroup,
    BookType? BookType,
    decimal? Price,
    PublicationStatus? PublicationStatus,
    string? ContentUrl
);

public record StoryResponse(
    string Id,
    string Title,
    string CoverImageUrl,
    string Description,
    string ValueLearned,
    string TargetAgeGroup,
    BookType BookType,
    decimal Price,
    PublicationStatus PublicationStatus,
    double AverageRating,
    int ReviewCount,
    DateTime CreatedAt
);
