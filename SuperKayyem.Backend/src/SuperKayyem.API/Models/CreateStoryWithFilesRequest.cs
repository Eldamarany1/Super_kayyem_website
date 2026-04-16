using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SuperKayyem.Domain.Enums;

namespace SuperKayyem.API.Models;

/// <summary>
/// Multipart/form-data request DTO for creating a story with file uploads.
/// Lives in the API project (not Application) because it depends on IFormFile
/// which is part of the ASP.NET web framework, not the domain.
/// </summary>
public record CreateStoryWithFilesRequest(
    [FromForm] string Title,
    [FromForm] string Description,
    [FromForm] string ValueLearned,
    [FromForm] string TargetAgeGroup,
    [FromForm] BookType BookType,
    [FromForm] decimal Price,
    IFormFile? CoverImage,
    [FromForm] string? CoverImageUrl,
    IFormFile? ContentFile,
    [FromForm] string? ContentUrl
);
