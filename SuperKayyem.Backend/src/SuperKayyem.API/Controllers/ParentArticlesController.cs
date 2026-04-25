using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using SuperKayyem.Application.DTOs;
using SuperKayyem.Domain.Common;
using SuperKayyem.Domain.Entities;
using SuperKayyem.Infrastructure.Persistence;

namespace SuperKayyem.API.Controllers;

[ApiController]
[Route("api/parent-articles")]
public class ParentArticlesController : ControllerBase
{
    private readonly MongoDbContext _context;

    public ParentArticlesController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var isAdmin = User.IsInRole("Admin");
        var filter = isAdmin 
            ? Builders<ParentArticle>.Filter.Empty 
            : Builders<ParentArticle>.Filter.Eq(x => x.IsPublished, true);

        var articles = await _context.ParentArticles.Find(filter).ToListAsync();

        var dtos = articles.Select(a => new ParentArticleDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            CoverImageUrl = a.CoverImageUrl,
            IsPublished = a.IsPublished,
            CreatedAt = a.CreatedAt,
            UpdatedAt = a.UpdatedAt
        }).ToList();

        return Ok(ApiResponse<List<ParentArticleDto>>.Ok(dtos));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var article = await _context.ParentArticles.Find(a => a.Id == id).FirstOrDefaultAsync();
        if (article == null)
            return NotFound(ApiResponse.Fail("Article not found."));

        var isAdmin = User.IsInRole("Admin");
        if (!article.IsPublished && !isAdmin)
            return Forbid();

        var dto = new ParentArticleDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            CoverImageUrl = article.CoverImageUrl,
            IsPublished = article.IsPublished,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt
        };

        return Ok(ApiResponse<ParentArticleDto>.Ok(dto));
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateParentArticleDto request)
    {
        var article = ParentArticle.Create(request.Title, request.Content, request.CoverImageUrl);
        if (request.IsPublished)
        {
            article.Publish();
        }

        await _context.ParentArticles.InsertOneAsync(article);

        var dto = new ParentArticleDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            CoverImageUrl = article.CoverImageUrl,
            IsPublished = article.IsPublished,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = article.Id }, ApiResponse<ParentArticleDto>.Ok(dto));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateParentArticleDto request)
    {
        var article = await _context.ParentArticles.Find(a => a.Id == id).FirstOrDefaultAsync();
        if (article == null)
            return NotFound(ApiResponse.Fail("Article not found."));

        article.Update(request.Title, request.Content, request.CoverImageUrl, request.IsPublished);
        
        await _context.ParentArticles.ReplaceOneAsync(a => a.Id == id, article);

        var dto = new ParentArticleDto
        {
            Id = article.Id,
            Title = article.Title,
            Content = article.Content,
            CoverImageUrl = article.CoverImageUrl,
            IsPublished = article.IsPublished,
            CreatedAt = article.CreatedAt,
            UpdatedAt = article.UpdatedAt
        };

        return Ok(ApiResponse<ParentArticleDto>.Ok(dto));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var result = await _context.ParentArticles.DeleteOneAsync(a => a.Id == id);
        if (result.DeletedCount == 0)
            return NotFound(ApiResponse.Fail("Article not found."));

        return Ok(ApiResponse.Ok("Article deleted successfully."));
    }
}
