using System.ComponentModel.DataAnnotations;

namespace SuperKayyem.Application.DTOs.Reviews;

public record SubmitReviewRequest(
    string StoryId,
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5 stars.")]
    int Rating,
    string Comment
);

public record ReviewResponse(
    string Id,
    string StoryId,
    string UserId,
    string UserName,
    int Rating,
    string Comment,
    bool IsHidden,
    DateTime CreatedAt
);
