using SuperKayyem.Application.DTOs.Stories;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.Application.Interfaces;

public interface IStoryService
{
    Task<ApiResponse<List<StoryResponse>>> GetAllAsync(PublicationStatus? statusFilter = null);
    Task<ApiResponse<StoryResponse>> GetByIdAsync(string id);
    Task<ApiResponse<StoryResponse>> CreateAsync(CreateStoryRequest request);
    Task<ApiResponse<StoryResponse>> UpdateAsync(string id, UpdateStoryRequest request);
    Task<ApiResponse> DeleteAsync(string id);
    Task<ApiResponse<StoryResponse>> PublishAsync(string id);
    Task<ApiResponse<StoryResponse>> CancelAsync(string id);
}
