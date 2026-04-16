using MongoDB.Driver;
using SuperKayyem.Application.DTOs.Reviews;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class ReviewService : IReviewService
{
    private readonly MongoDbContext _db;

    public ReviewService(MongoDbContext db) => _db = db;

    public async Task<ApiResponse<List<ReviewResponse>>> GetByStoryIdAsync(string storyId)
    {
        var reviews = await _db.Reviews
            .Find(r => r.StoryId == storyId && !r.IsDeleted && !r.IsHidden)
            .SortByDescending(r => r.CreatedAt)
            .ToListAsync();

        return ApiResponse<List<ReviewResponse>>.Ok(reviews.Select(Map).ToList());
    }

    public async Task<ApiResponse<ReviewResponse>> SubmitReviewAsync(string userId, string userName, SubmitReviewRequest request)
    {
        // Validate purchased
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user is null || !user.PurchasedStoryIds.Contains(request.StoryId))
            return ApiResponse<ReviewResponse>.Fail("You can only review stories you have purchased.");

        // Validate rating range
        if (request.Rating < 1 || request.Rating > 5)
            return ApiResponse<ReviewResponse>.Fail("Rating must be between 1 and 5.");

        // Prevent duplicate reviews
        var existing = await _db.Reviews
            .Find(r => r.StoryId == request.StoryId && r.UserId == userId && !r.IsDeleted)
            .FirstOrDefaultAsync();

        if (existing is not null)
            return ApiResponse<ReviewResponse>.Fail("You have already reviewed this story.");

        var review = Review.Create(
            request.StoryId,
            userId,
            userName,
            request.Rating,
            request.Comment
        );

        await _db.Reviews.InsertOneAsync(review);
        return ApiResponse<ReviewResponse>.Ok(Map(review), "Review submitted.");
    }

    public async Task<ApiResponse> HideReviewAsync(string reviewId)
    {
        var review = await _db.Reviews.Find(r => r.Id == reviewId).FirstOrDefaultAsync();
        if (review is null) return ApiResponse.Fail("Review not found.");
        
        review.Hide();
        await _db.Reviews.ReplaceOneAsync(r => r.Id == reviewId, review);
        return ApiResponse.Ok("Review hidden.");
    }

    public async Task<ApiResponse> UnhideReviewAsync(string reviewId)
    {
        var review = await _db.Reviews.Find(r => r.Id == reviewId).FirstOrDefaultAsync();
        if (review is null) return ApiResponse.Fail("Review not found.");
        
        review.Unhide();
        await _db.Reviews.ReplaceOneAsync(r => r.Id == reviewId, review);
        return ApiResponse.Ok("Review restored.");
    }

    public async Task<ApiResponse> SoftDeleteReviewAsync(string reviewId)
    {
        var review = await _db.Reviews.Find(r => r.Id == reviewId).FirstOrDefaultAsync();
        if (review is null) return ApiResponse.Fail("Review not found.");
        
        review.SoftDelete();
        await _db.Reviews.ReplaceOneAsync(r => r.Id == reviewId, review);
        return ApiResponse.Ok("Review deleted.");
    }

    private static ReviewResponse Map(Review r) =>
        new(r.Id, r.StoryId, r.UserId, r.UserName, r.Rating, r.Comment, r.IsHidden, r.CreatedAt);
}
