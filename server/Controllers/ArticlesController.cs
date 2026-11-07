using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;

namespace SuperKayyem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ArticlesController : ControllerBase
    {
        private readonly SuperKayyemDbContext _context;

        public ArticlesController(SuperKayyemDbContext context)
        {
            _context = context;
        }

        // GET: api/articles
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct = default)
        {
            if (!await _context.Articles.AnyAsync(ct))
            {
                var seedArticles = ArticleSeedData.GetInitialArticles();
                await _context.Articles.AddRangeAsync(seedArticles, ct);
                await _context.SaveChangesAsync(ct);
            }

            var articles = await _context.Articles
                .OrderByDescending(a => a.PublishedAt)
                .ThenByDescending(a => a.Id)
                .AsNoTracking()
                .ToListAsync(ct);

            return Ok(articles);
        }

        // GET: api/articles/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken ct = default)
        {
            if (id <= 0)
            {
                return NotFound(new { error = "Article not found" });
            }

            var article = await _context.Articles
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == id, ct);

            if (article == null)
            {
                return NotFound(new { error = "Article not found" });
            }

            return Ok(article);
        }
    }
}
