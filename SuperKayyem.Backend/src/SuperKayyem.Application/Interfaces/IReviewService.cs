using SuperKayyem.Application.DTOs.Reviews;
using SuperKayyem.Domain.Common;

namespace SuperKayyem.Application.Interfaces;

public interface IReviewService
{
    Task<ApiResponse<List<ReviewResponse>>> GetByStoryIdAsync(string storyId);
    Task<ApiResponse<ReviewResponse>> SubmitReviewAsync(string userId, string userName, SubmitReviewRequest request);
    Task<ApiResponse> HideReviewAsync(string reviewId);
    Task<ApiResponse> UnhideReviewAsync(string reviewId);
    Task<ApiResponse> SoftDeleteReviewAsync(string reviewId);
}
