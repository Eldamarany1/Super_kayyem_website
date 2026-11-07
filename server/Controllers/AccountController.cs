// ============================================================
// AccountController.cs — Customer account management (Razor MVC Views)
// Default route: /Account/AccountList
// Used to display, update, and delete customer accounts via Razor views.
// ============================================================

namespace SuperKayyem.Controllers;

using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore; // Required for ToListAsync, FirstOrDefaultAsync...
using SuperKayyem.Data;              // Required for AccountSeedData
using SuperKayyem.Models;            // Required for Account, Child, and SuperKayyemDbContext
using Account = SuperKayyem.Models.Account;

/// <summary>
/// Controller for managing customer accounts and children profiles via Razor views.
/// </summary>
// Inherits from Controller (not ControllerBase) because it returns Razor Views
[Authorize(Roles = "SuperAdmin,Admin")]
public class AccountController : Controller
{
    // _mongoDbContext: Access to the MongoDB database
    private readonly SuperKayyemDbContext _mongoDbContext;

    // _logger: Logs events and warnings in the application log
    private readonly ILogger<AccountController> _logger;

    // _cloudinary: Cloudinary client for uploading profile pictures
    private readonly Cloudinary _cloudinary;

    // Constructor: ASP.NET injects SuperKayyemDbContext, ILogger, and Cloudinary automatically via Dependency Injection
    public AccountController(SuperKayyemDbContext mongoDbContext, ILogger<AccountController> logger, Cloudinary cloudinary)
    {
        _mongoDbContext = mongoDbContext;
        _logger = logger;
        _cloudinary = cloudinary;
    }

    public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (User.IsInRole("SuperAdmin"))
        {
            try
            {
                ViewBag.PendingRequestsCount = await _mongoDbContext.AdminUsers.CountAsync(u => u.Status == "Pending");
            }
            catch
            {
                // Fallback if db is not reachable
            }
        }
        await next();
    }

    /// <summary>
    /// Displays the default accounts overview by redirecting to the account list view.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Index(CancellationToken ct = default)
    {
        // Task.Yield(): Keeps the method truly async even if it does not await a long operation
        await Task.Yield();

        // Redirect to AccountList action in the same Controller
        // nameof(AccountList): Type-safe way to reference the action name instead of a hardcoded string
        return RedirectToAction(nameof(AccountList));
    }

    /// <summary>
    /// Displays the list of all customer accounts fetched asynchronously from MongoDB.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> AccountList(CancellationToken ct = default)
    {
        // Fetch all customer accounts from MongoDB asynchronously
        var accounts = await _mongoDbContext.Accounts.ToListAsync(ct);

        // If the database is empty, seed it automatically from sample data
        if (!accounts.Any())
        {
            _logger.LogInformation("Accounts collection is empty. Seeding initial accounts from AccountSeedData");
            var seedAccounts = AccountSeedData.Accounts;
            await _mongoDbContext.Accounts.AddRangeAsync(seedAccounts, ct);
            await _mongoDbContext.SaveChangesAsync(ct);
            accounts = seedAccounts;
        }

        // Migrate/ensure existing accounts have OwnedStoryIds
        bool needsSave = false;
        foreach (var acc in accounts)
        {
            if (acc.OwnedStoryIds == null || !acc.OwnedStoryIds.Any())
            {
                acc.OwnedStoryIds = [1, 2, 3];
                needsSave = true;
            }
        }
        if (needsSave)
        {
            await _mongoDbContext.SaveChangesAsync(ct);
        }

        // Pass the list to Razor view Views/Account/AccountList.cshtml
        return View(accounts);
    }

    /// <summary>
    /// Displays the form for creating a new account.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Create()
    {
        // Task.Yield(): Keeps the method async
        await Task.Yield();

        // Pass an empty model to the create account page
        return View(new Account());
    }

    /// <summary>
    /// Saves the new account to MongoDB asynchronously.
    /// Uploads profile picture to Cloudinary if file is provided.
    /// </summary>
    // [HttpPost]: Handles form submission
    // [ValidateAntiForgeryToken]: Protects the form against CSRF attacks
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(Account model, IFormFile? avatarFile, CancellationToken ct = default)
    {
        // Remove Password validation from ModelState because it is a hidden/optional field on create
        ModelState.Remove(nameof(model.Password));

        // Validate model fields before saving
        if (!ModelState.IsValid)
        {
            return View(model); // Re-display the form with validation error messages
        }

        // Calculate the next ID automatically
        var anyAccounts = await _mongoDbContext.Accounts.AnyAsync(ct);
        int nextId = anyAccounts ? (await _mongoDbContext.Accounts.MaxAsync(a => a.Id, ct)) + 1 : 1;
        model.Id = nextId;

        // Set a default password if not provided
        if (string.IsNullOrWhiteSpace(model.Password))
        {
            model.Password = "password123";
        }

        // Initialize the children and owned stories lists if null
        model.Children ??= [];
        model.OwnedStoryIds ??= [1, 2, 3];

        // Upload profile picture to Cloudinary if a file was provided
        if (avatarFile != null && avatarFile.Length > 0)
        {
            using var stream = avatarFile.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(avatarFile.FileName, stream),
                Folder = "super_kayyem/avatars"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            model.ProfilePictureUrl = uploadResult.SecureUrl.ToString();
        }

        // Set creation timestamp
        model.CreatedAt = DateTime.UtcNow;

        // Save the new account to MongoDB
        await _mongoDbContext.Accounts.AddAsync(model, ct);
        await _mongoDbContext.SaveChangesAsync(ct);

        _logger.LogInformation("Account '{FirstName} {LastName}' (ID: {Id}) created.", model.FirstName, model.LastName, model.Id);

        return RedirectToAction(nameof(AccountList));
    }

    /// <summary>
    /// Displays the detailed profile of a single customer account by its identifier.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Read(int id, CancellationToken ct = default)
    {
        // Fetch the account by ID — FirstOrDefaultAsync returns null if not found
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            _logger.LogWarning("Account with ID {AccountId} not found.", id);
            return NotFound(); // HTTP 404
        }

        return View(account); // Opens Views/Account/Read.cshtml
    }

    /// <summary>
    /// Displays the edit form populated with current account data.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Update(int id, CancellationToken ct = default)
    {
        // Fetch the account to populate the edit form with current data
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            _logger.LogWarning("Account with ID {AccountId} not found for edit.", id);
            return NotFound();
        }

        return View(account); // Opens Views/Account/Update.cshtml with account data
    }

    /// <summary>
    /// Saves the modified account details back to MongoDB asynchronously.
    /// Uploads new profile picture to Cloudinary if file is provided.
    /// </summary>
    // [HttpPost]: Handles edit form submission
    // [ValidateAntiForgeryToken]: Protects the form against CSRF attacks
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Update(int? id, Account model, IFormFile? avatarFile, CancellationToken ct = default)
    {
        int targetId = (id.HasValue && id.Value > 0) ? id.Value : model.Id;

        // Remove Password from ModelState so it doesn't fail if empty
        ModelState.Remove(nameof(model.Password));

        // Validate remaining fields before saving
        if (!ModelState.IsValid)
        {
            return View(model); // Re-display the form with validation error messages
        }

        // Fetch the existing account from MongoDB to update it
        var existingAccount = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == targetId, ct);
        if (existingAccount == null)
        {
            return NotFound();
        }

        // Apply changes to the existing account
        existingAccount.FirstName = model.FirstName;
        existingAccount.LastName = model.LastName;
        existingAccount.Email = model.Email;
        existingAccount.DateOfBirth = model.DateOfBirth;
        existingAccount.Gender = model.Gender;

        // Update password if provided
        if (!string.IsNullOrWhiteSpace(model.Password))
        {
            existingAccount.Password = model.Password.Trim();
        }

        // Upload new profile picture to Cloudinary if provided
        if (avatarFile != null && avatarFile.Length > 0)
        {
            using var stream = avatarFile.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(avatarFile.FileName, stream),
                Folder = "super_kayyem/avatars"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            existingAccount.ProfilePictureUrl = uploadResult.SecureUrl.ToString();
        }
        else if (!string.IsNullOrWhiteSpace(model.ProfilePictureUrl))
        {
            existingAccount.ProfilePictureUrl = model.ProfilePictureUrl;
        }

        // Update children list only if sent — prevents deleting the list if not provided
        if (model.Children != null)
        {
            if (existingAccount.Children == null)
            {
                existingAccount.Children = new List<Child>(model.Children);
            }
            else
            {
                existingAccount.Children.Clear();
                existingAccount.Children.AddRange(model.Children);
            }
        }

        // Mark the account as updated
        existingAccount.IsUpdated = true;
        existingAccount.UpdatedAt = DateTime.UtcNow;

        // Save modifications to MongoDB
        await _mongoDbContext.SaveChangesAsync(ct);
        _logger.LogInformation("Account with ID {AccountId} successfully updated.", model.Id);

        return RedirectToAction(nameof(AccountList));
    }

    /// <summary>
    /// Displays the confirmation page for deleting an account.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Delete(int id, CancellationToken ct = default)
    {
        // Fetch the account to show its details on the delete confirmation page
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account == null)
        {
            _logger.LogWarning("Account with ID {AccountId} not found for deletion.", id);
            return NotFound();
        }

        return View(account); // Opens Views/Account/Delete.cshtml
    }

    /// <summary>
    /// Performs the actual deletion of the specified account from MongoDB asynchronously.
    /// </summary>
    // [HttpPost, ActionName("Delete")]: Maps this method to POST on /Account/Delete
    // ActionName is required to distinguish from the Delete [HttpGet] action with the same name
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteConfirmed(int id, CancellationToken ct = default)
    {
        // Fetch the account to verify it exists before deleting
        var account = await _mongoDbContext.Accounts.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (account != null)
        {
            // Mark the record for deletion in DbContext
            _mongoDbContext.Accounts.Remove(account);

            // Execute the actual deletion in MongoDB
            await _mongoDbContext.SaveChangesAsync(ct);
            _logger.LogInformation("Account with ID {AccountId} deleted.", id);
        }

        // Redirect to account list after deletion
        return RedirectToAction(nameof(AccountList));
    }
}
