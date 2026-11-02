namespace SuperKayyem.Controllers;

using System.Text.Json;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;
using Account = SuperKayyem.Models.Account;

/// <summary>
/// REST API controller for customer account operations (authentication, profile management, story ownership).
/// Exposed at /api/accounts for the React client.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AccountsController : ControllerBase
{
    private readonly SuperKayyemDbContext _context;
    private readonly ILogger<AccountsController> _logger;
    private readonly Cloudinary _cloudinary;

    public AccountsController(SuperKayyemDbContext context, ILogger<AccountsController> logger, Cloudinary cloudinary)
    {
        _context = context;
        _logger = logger;
        _cloudinary = cloudinary;
    }

    /// <summary>
    /// Registers a new customer account from the client-side multi-step registration flow.
    /// Supports Cloudinary profile picture upload and preset avatar selection.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromForm] string firstName,
        [FromForm] string lastName,
        [FromForm] string email,
        [FromForm] string password,
        [FromForm] DateTime? dateOfBirth,
        [FromForm] string? gender,
        [FromForm] string? childrenJson,
        [FromForm] string? avatarUrl,
        IFormFile? avatarFile,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(firstName) || string.IsNullOrWhiteSpace(lastName) ||
            string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return BadRequest(new { error = "جميع البيانات الأساسية مطلوبة (الاسم، البريد الإلكتروني، كلمة المرور)" });
        }

        var normalizedEmail = email.Trim().ToLowerInvariant();

        // Check if an account with this email already exists
        var emailExists = await _context.Accounts.AnyAsync(a => a.Email.ToLower() == normalizedEmail, ct);
        if (emailExists)
        {
            return BadRequest(new { error = "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول أو استخدام بريد آخر." });
        }

        // Calculate next ID
        var anyAccounts = await _context.Accounts.AnyAsync(ct);
        int nextId = anyAccounts ? (await _context.Accounts.MaxAsync(a => a.Id, ct)) + 1 : 1;

        // Deserialize children if provided as JSON string
        var childrenList = new List<Child>();
        if (!string.IsNullOrWhiteSpace(childrenJson))
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsed = JsonSerializer.Deserialize<List<Child>>(childrenJson, options);
                if (parsed != null)
                {
                    int childIdCounter = nextId * 100 + 1;
                    foreach (var child in parsed)
                    {
                        if (!string.IsNullOrWhiteSpace(child.Name))
                        {
                            child.Id = childIdCounter++;
                            childrenList.Add(child);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse children JSON in registration");
            }
        }

        string? finalProfilePictureUrl = null;

        // Upload custom avatar file to Cloudinary if provided
        if (avatarFile != null && avatarFile.Length > 0)
        {
            using var stream = avatarFile.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(avatarFile.FileName, stream),
                Folder = "super_kayyem/avatars"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            finalProfilePictureUrl = uploadResult.SecureUrl.ToString();
        }
        else if (!string.IsNullOrWhiteSpace(avatarUrl))
        {
            finalProfilePictureUrl = avatarUrl.Trim();
        }

        var newAccount = new Account
        {
            Id = nextId,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Email = normalizedEmail,
            Password = password,
            DateOfBirth = dateOfBirth ?? DateTime.UtcNow.AddYears(-30),
            Gender = string.IsNullOrWhiteSpace(gender) ? "ذكر" : gender.Trim(),
            ProfilePictureUrl = finalProfilePictureUrl,
            OwnedStoryIds = [1, 2, 3], // Grant default access to first 3 stories upon signup
            Children = childrenList,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Accounts.AddAsync(newAccount, ct);
        await _context.SaveChangesAsync(ct);

        _logger.LogInformation("New account registered via API: {Email} (ID: {Id})", newAccount.Email, newAccount.Id);

        return Ok(new
        {
            success = true,
            message = "تم إنشاء الحساب بنجاح",
            account = newAccount
        });
    }

    /// <summary>
    /// Authenticates a customer by email and password.
    /// Auto-seeds sample accounts if the database is currently empty.
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto, CancellationToken ct = default)
    {
        if (loginDto == null || string.IsNullOrWhiteSpace(loginDto.Email) || string.IsNullOrWhiteSpace(loginDto.Password))
        {
            return BadRequest(new { error = "البريد الإلكتروني وكلمة المرور مطلوبان" });
        }

        var normalizedEmail = loginDto.Email.Trim().ToLowerInvariant();

        // Check if database needs initial seeding
        var any = await _context.Accounts.AnyAsync(ct);
        if (!any)
        {
            _logger.LogInformation("Database empty on login: seeding accounts from AccountSeedData");
            await _context.Accounts.AddRangeAsync(AccountSeedData.Accounts, ct);
            await _context.SaveChangesAsync(ct);
        }

        var account = await _context.Accounts.FirstOrDefaultAsync(
            a => a.Email.ToLower() == normalizedEmail && a.Password == loginDto.Password, ct);

        if (account == null)
        {
            return Unauthorized(new { error = "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
        }

        // Ensure OwnedStoryIds is initialized
        if (account.OwnedStoryIds == null || !account.OwnedStoryIds.Any())
        {
            account.OwnedStoryIds = [1, 2, 3];
            await _context.SaveChangesAsync(ct);
        }

        _logger.LogInformation("Customer logged in: {Email} (ID: {Id})", account.Email, account.Id);

        return Ok(account);
    }

    /// <summary>
    /// Fetches the current customer account details by ID to keep the client session fresh with DB changes.
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken ct = default)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            return NotFound(new { error = "الحساب غير موجود" });
        }

        return Ok(account);
    }

    /// <summary>
    /// Updates customer account profile information from the client-side profile editor.
    /// Supports updating personal details, children list, and changing profile picture via Cloudinary.
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(
        int id,
        [FromForm] string? firstName,
        [FromForm] string? lastName,
        [FromForm] string? email,
        [FromForm] DateTime? dateOfBirth,
        [FromForm] string? gender,
        [FromForm] string? childrenJson,
        [FromForm] string? avatarUrl,
        IFormFile? avatarFile,
        CancellationToken ct = default)
    {
        var existing = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (existing == null)
        {
            return NotFound(new { error = "الحساب غير موجود" });
        }

        if (!string.IsNullOrWhiteSpace(firstName)) existing.FirstName = firstName.Trim();
        if (!string.IsNullOrWhiteSpace(lastName)) existing.LastName = lastName.Trim();
        if (!string.IsNullOrWhiteSpace(email)) existing.Email = email.Trim().ToLowerInvariant();
        if (dateOfBirth.HasValue) existing.DateOfBirth = dateOfBirth.Value;
        if (!string.IsNullOrWhiteSpace(gender)) existing.Gender = gender.Trim();

        // Upload new profile picture if provided
        if (avatarFile != null && avatarFile.Length > 0)
        {
            using var stream = avatarFile.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(avatarFile.FileName, stream),
                Folder = "super_kayyem/avatars"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            existing.ProfilePictureUrl = uploadResult.SecureUrl.ToString();
        }
        else if (!string.IsNullOrWhiteSpace(avatarUrl))
        {
            existing.ProfilePictureUrl = avatarUrl.Trim();
        }

        // Update children list if provided
        if (!string.IsNullOrWhiteSpace(childrenJson))
        {
            try
            {
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var parsed = JsonSerializer.Deserialize<List<Child>>(childrenJson, options);
                if (parsed != null)
                {
                    existing.Children.Clear();
                    int childIdCounter = id * 100 + 1;
                    foreach (var child in parsed)
                    {
                        if (!string.IsNullOrWhiteSpace(child.Name))
                        {
                            child.Id = child.Id > 0 ? child.Id : childIdCounter++;
                            existing.Children.Add(child);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to parse children JSON in profile update");
            }
        }

        existing.IsUpdated = true;
        existing.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);
        _logger.LogInformation("Profile updated via API for ID {Id}", id);

        return Ok(existing);
    }

    /// <summary>
    /// Adds a story to the user's owned stories list ("Add to My Library").
    /// </summary>
    [HttpPost("{id}/own-story/{storyId}")]
    public async Task<IActionResult> OwnStory(int id, int storyId, CancellationToken ct = default)
    {
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            return NotFound(new { error = "الحساب غير موجود" });
        }

        account.OwnedStoryIds ??= [];
        if (!account.OwnedStoryIds.Contains(storyId))
        {
            account.OwnedStoryIds.Add(storyId);
            account.IsUpdated = true;
            account.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(ct);
            _logger.LogInformation("Story {StoryId} added to owned list for user {Id}", storyId, id);
        }

        return Ok(new
        {
            success = true,
            ownedStoryIds = account.OwnedStoryIds,
            message = "تمت إضافة القصة إلى مكتبتك بنجاح"
        });
    }
}

public class LoginDto
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
