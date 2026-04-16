namespace SuperKayyem.Application.DTOs.Library;

/// <summary>
/// Represents a purchased story in the user's library.
/// HasReviewed flag indicates if the user has already submitted a review.
/// </summary>
public record LibraryItemResponse(
    string StoryId,
    string Title,
    string CoverImageUrl,
    string Description,
    bool HasReviewed
);
