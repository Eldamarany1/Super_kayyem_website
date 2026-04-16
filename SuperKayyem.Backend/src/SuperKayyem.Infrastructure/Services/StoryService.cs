using MongoDB.Driver;
using SuperKayyem.Application.DTOs.Stories;
using SuperKayyem.Application.Interfaces;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Domain.Enums;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.Infrastructure.Services;

public class StoryService : IStoryService
{
    private readonly MongoDbContext _db;

    public StoryService(MongoDbContext db)
    {
        _db = db;
    }

    public async Task<ApiResponse<List<StoryResponse>>> GetAllAsync(PublicationStatus? statusFilter = null)
    {
        var filter = statusFilter.HasValue
            ? Builders<Story>.Filter.Eq(s => s.PublicationStatus, statusFilter.Value)
            : Builders<Story>.Filter.Empty;

        var stories = await _db.Stories.Find(filter).ToListAsync();
        var responses = new List<StoryResponse>();

        foreach (var story in stories)
        {
            var (avg, count) = await GetReviewStatsAsync(story.Id);
            responses.Add(MapToResponse(story, avg, count));
        }

        return ApiResponse<List<StoryResponse>>.Ok(responses);
    }

    public async Task<ApiResponse<StoryResponse>> GetByIdAsync(string id)
    {
        var story = await _db.Stories.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (story is null) return ApiResponse<StoryResponse>.Fail("Story not found.");
        var (avg, count) = await GetReviewStatsAsync(story.Id);
        return ApiResponse<StoryResponse>.Ok(MapToResponse(story, avg, count));
    }

    public async Task<ApiResponse<StoryResponse>> CreateAsync(CreateStoryRequest request)
    {
        var story = Story.Create(
            request.Title,
            request.CoverImageUrl,
            request.Description,
            request.ValueLearned,
            request.TargetAgeGroup,
            request.BookType,
            request.Price
        );
        if (!string.IsNullOrWhiteSpace(request.ContentUrl))
        {
            story.SetContent(request.ContentUrl);
        }

        await _db.Stories.InsertOneAsync(story);
        return ApiResponse<StoryResponse>.Ok(MapToResponse(story, 0, 0), "Story created.");
    }

    public async Task<ApiResponse<StoryResponse>> UpdateAsync(string id, UpdateStoryRequest request)
    {
        var story = await _db.Stories.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (story is null) return ApiResponse<StoryResponse>.Fail("Story not found.");

        story.UpdateDetails(
            request.Title ?? story.Title,
            request.CoverImageUrl ?? story.CoverImageUrl,
            request.Description ?? story.Description,
            request.ValueLearned ?? story.ValueLearned,
            request.TargetAgeGroup ?? story.TargetAgeGroup,
            request.Price ?? story.Price
        );

        if (request.ContentUrl is not null) story.SetContent(request.ContentUrl);
        
        // Note: PublicationStatus should be handled by Publish/Cancel methods if strictly adhering to DDD, but for patch support we keep it here if requested
        if (request.PublicationStatus == PublicationStatus.Published) story.Publish();
        else if (request.PublicationStatus == PublicationStatus.Cancelled) story.Cancel();

        await _db.Stories.ReplaceOneAsync(s => s.Id == id, story);
        story = await _db.Stories.Find(s => s.Id == id).FirstOrDefaultAsync();
        var (avg, count) = await GetReviewStatsAsync(id);
        return ApiResponse<StoryResponse>.Ok(MapToResponse(story!, avg, count), "Story updated.");
    }

    public async Task<ApiResponse> DeleteAsync(string id)
    {
        var result = await _db.Stories.DeleteOneAsync(s => s.Id == id);
        return result.DeletedCount > 0 ? ApiResponse.Ok("Story deleted.") : ApiResponse.Fail("Story not found.");
    }

    public async Task<ApiResponse<StoryResponse>> PublishAsync(string id)
    {
        var story = await _db.Stories.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (story is null) return ApiResponse<StoryResponse>.Fail("Story not found.");
        
        story.Publish();
        await _db.Stories.ReplaceOneAsync(s => s.Id == id, story);
        return await GetByIdAsync(id);
    }

    public async Task<ApiResponse<StoryResponse>> CancelAsync(string id)
    {
        var story = await _db.Stories.Find(s => s.Id == id).FirstOrDefaultAsync();
        if (story is null) return ApiResponse<StoryResponse>.Fail("Story not found.");
        
        story.Cancel();
        await _db.Stories.ReplaceOneAsync(s => s.Id == id, story);
        return await GetByIdAsync(id);
    }

    private async Task<(double avg, int count)> GetReviewStatsAsync(string storyId)
    {
        var reviews = await _db.Reviews
            .Find(r => r.StoryId == storyId && !r.IsHidden && !r.IsDeleted)
            .ToListAsync();

        if (reviews.Count == 0) return (0, 0);
        return (reviews.Average(r => r.Rating), reviews.Count);
    }

    private static StoryResponse MapToResponse(Story story, double avgRating, int reviewCount)
        => new(
            story.Id, story.Title, story.CoverImageUrl, story.Description,
            story.ValueLearned, story.TargetAgeGroup, story.BookType,
            story.Price, story.PublicationStatus, avgRating, reviewCount, story.CreatedAt
        );
}
