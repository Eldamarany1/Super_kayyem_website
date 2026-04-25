namespace SuperKayyem.Application.DTOs.Library;

/// <summary>
/// Represents a purchased story entry in the user's library.
/// HasReviewed indicates whether the user has already submitted a review.
/// </summary>
public record LibraryItemResponse(
    string StoryId,
    string Title,
    string CoverImageUrl,
    string Description,
    bool HasReviewed
);

/// <summary>
/// Richer DTO returned by the dedicated /api/user-library/me endpoint.
/// Includes purchase metadata in addition to story details.
/// </summary>
public record UserOwnedStoryResponseDto(
    string   LibraryItemId,   // UserLibraryItem.Id — unique per ownership record
    string   StoryId,
    string   Title,
    string   CoverImageUrl,
    string   Description,
    string   ValueLearned,
    string   TargetAgeGroup,
    decimal  Price,
    int?     PageCount,
    DateTime PurchaseDate,
    string   PaymentMethod,
    bool     HasReviewed
);
