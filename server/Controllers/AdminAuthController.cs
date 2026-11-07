using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;
using SuperKayyem.ViewModels;

namespace SuperKayyem.Controllers
{
    public class AdminAuthController : Controller
    {
        private readonly SuperKayyemDbContext _context;

        public AdminAuthController(SuperKayyemDbContext context)
        {
            _context = context;
        }

        // GET: /AdminAuth/Login
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> Login(string? returnUrl = null, CancellationToken ct = default)
        {
            // If already logged in, verify status is still Approved in DB
            if (User.Identity is { IsAuthenticated: true })
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                int.TryParse(userIdStr, out int userId);

                try
                {
                    var user = await _context.AdminUsers.AsNoTracking()
                        .FirstOrDefaultAsync(u => (userId > 0 && u.Id == userId) || 
                                                  (!string.IsNullOrEmpty(email) && u.Email != null && u.Email.ToLower() == email.ToLower()), ct);

                    if (user != null && user.Status != "Approved")
                    {
                        // Account explicitly revoked or removed; clear auth cookie
                        await HttpContext.SignOutAsync("AdminCookie");
                    }
                    else
                    {
                        return RedirectToAction("Index", "Admin");
                    }
                }
                catch
                {
                    return RedirectToAction("Index", "Admin");
                }
            }

            await AdminUserSeedData.EnsureSuperAdminSeededAsync(_context, ct);
            ViewData["ReturnUrl"] = returnUrl;
            return View(new AdminLoginViewModel());
        }

        // POST: /AdminAuth/Login
        [AllowAnonymous]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login(AdminLoginViewModel model, string? returnUrl = null, CancellationToken ct = default)
        {
            ViewData["ReturnUrl"] = returnUrl;

            if (!ModelState.IsValid)
            {
                return View(model);
            }

            await AdminUserSeedData.EnsureSuperAdminSeededAsync(_context, ct);

            var normalizedEmail = model.Email.Trim().ToLowerInvariant();
            var adminUser = await _context.AdminUsers
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == normalizedEmail, ct);

            if (adminUser == null || adminUser.Password != model.Password)
            {
                ViewData["ErrorMessage"] = "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب غير مسجل.";
                return View(model);
            }

            if (adminUser.Status == "Pending")
            {
                ViewData["WarningMessage"] = "⏳ طلب انضمامك قيد المراجعة حالياً بانتظار موافقة قائد الفريق (Admin Leader).";
                return View(model);
            }

            if (adminUser.Status == "Rejected")
            {
                ViewData["ErrorMessage"] = "❌ عذراً، تم رفض طلب انضمام هذا الحساب إلى لوحة التحكم.";
                return View(model);
            }

            if (adminUser.Status == "Revoked")
            {
                ViewData["ErrorMessage"] = "🔒 تم إيقاف صلاحية الدخول لهذا الحساب مؤقتاً من قبل قائد الفريق.";
                return View(model);
            }

            if (adminUser.Status != "Approved")
            {
                ViewData["ErrorMessage"] = "غير مصرح لهذا الحساب بالدخول.";
                return View(model);
            }

            // Build claims & sign in
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, adminUser.Id.ToString()),
                new Claim(ClaimTypes.Name, adminUser.FullName),
                new Claim(ClaimTypes.Email, adminUser.Email),
                new Claim(ClaimTypes.Role, adminUser.Role)
            };

            var identity = new ClaimsIdentity(claims, "AdminCookie");
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                "AdminCookie",
                principal,
                new AuthenticationProperties { IsPersistent = true });

            if (!string.IsNullOrWhiteSpace(returnUrl) && 
                Url.IsLocalUrl(returnUrl) && 
                !returnUrl.StartsWith("/AdminAuth", StringComparison.OrdinalIgnoreCase))
            {
                return Redirect(returnUrl);
            }

            return RedirectToAction("Index", "Admin");
        }

        // GET: /AdminAuth/JoinTeam
        [AllowAnonymous]
        [HttpGet]
        public IActionResult JoinTeam()
        {
            if (User.Identity is { IsAuthenticated: true })
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdStr, out int userId))
                {
                    var user = _context.AdminUsers.AsNoTracking().FirstOrDefault(u => u.Id == userId);
                    if (user != null && user.Status == "Approved")
                    {
                        return RedirectToAction("Index", "Admin");
                    }

                    HttpContext.SignOutAsync("AdminCookie").GetAwaiter().GetResult();
                }
                else
                {
                    return RedirectToAction("Index", "Admin");
                }
            }

            return View(new JoinTeamViewModel());
        }

        // POST: /AdminAuth/JoinTeam
        [AllowAnonymous]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> JoinTeam(JoinTeamViewModel model, CancellationToken ct = default)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            await AdminUserSeedData.EnsureSuperAdminSeededAsync(_context, ct);

            var normalizedEmail = model.Email.Trim().ToLowerInvariant();
            var existingUser = await _context.AdminUsers
                .FirstOrDefaultAsync(u => u.Email != null && u.Email.ToLower() == normalizedEmail, ct);

            if (existingUser != null)
            {
                if (existingUser.Status == "Pending")
                {
                    ViewData["WarningMessage"] = "هذا البريد الإلكتروني لديه طلب انضمام قيد المراجعة بالفعل.";
                }
                else if (existingUser.Status == "Approved")
                {
                    ViewData["WarningMessage"] = "هذا البريد الإلكتروني مسجل ومفعل بالفعل! يمكنك تسجيل الدخول مباشرة.";
                }
                else
                {
                    ViewData["ErrorMessage"] = "هذا البريد الإلكتروني مسجل مسبقاً وتم إيقاف أو رفض صلاحيته. تواصل مع الـ Admin Leader.";
                }
                return View(model);
            }

            bool hasUsers = await _context.AdminUsers.AnyAsync(ct);
            int nextId = hasUsers ? (await _context.AdminUsers.MaxAsync(u => u.Id, ct)) + 1 : 1;

            var newRequest = new AdminUser
            {
                Id = nextId,
                FullName = model.FullName.Trim(),
                Email = model.Email.Trim().ToLowerInvariant(),
                Password = model.Password,
                Role = "Admin",
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };

            await _context.AdminUsers.AddAsync(newRequest, ct);
            await _context.SaveChangesAsync(ct);

            TempData["SuccessRequestMessage"] = "✅ تم إرسال طلب انضمامك بنجاح إلى قائد الفريق (Admin Leader)! ستتمكن من تسجيل الدخول فور قبول الطلب.";
            return RedirectToAction(nameof(Login));
        }

        // POST: /AdminAuth/Logout
        [AllowAnonymous]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync("AdminCookie");
            return RedirectToAction(nameof(Login));
        }

        // GET: /AdminAuth/Logout (fallback)
        [AllowAnonymous]
        [HttpGet]
        public async Task<IActionResult> LogoutGet()
        {
            await HttpContext.SignOutAsync("AdminCookie");
            return RedirectToAction(nameof(Login));
        }

        // GET: /AdminAuth/AccessDenied
        [AllowAnonymous]
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }

        public override async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            if (User.IsInRole("SuperAdmin"))
            {
                try
                {
                    ViewBag.PendingRequestsCount = await _context.AdminUsers.CountAsync(u => u.Status == "Pending");
                }
                catch
                {
                    // Fallback
                }
            }
            await base.OnActionExecutionAsync(context, next);
        }

        // =====================================================================
        // SUPER ADMIN EXCLUSIVE: TEAM & ACCESS REQUESTS MANAGEMENT
        // =====================================================================

        // GET: /AdminAuth/TeamRequests
        [HttpGet]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> TeamRequests(CancellationToken ct = default)
        {
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(_context, ct);

            var allUsers = await _context.AdminUsers
                .OrderByDescending(u => u.RequestedAt)
                .AsNoTracking()
                .ToListAsync(ct);

            ViewBag.PendingRequestsCount = allUsers.Count(u => u.Status == "Pending");
            return View(allUsers);
        }

        // POST: /AdminAuth/ApproveRequest
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ApproveRequest(int id, CancellationToken ct = default)
        {
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Id == id, ct);
            if (user != null && user.Role != "SuperAdmin")
            {
                user.Status = "Approved";
                user.ReviewedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(ct);
                TempData["SuccessMessage"] = $"تم قبول طلب ({user.FullName}) ومنحه صلاحية الدخول للوحة التحكم.";
            }
            return RedirectToAction(nameof(TeamRequests));
        }

        // POST: /AdminAuth/RejectRequest
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RejectRequest(int id, CancellationToken ct = default)
        {
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Id == id, ct);
            if (user != null)
            {
                if (user.Role == "SuperAdmin")
                {
                    TempData["ErrorMessage"] = "لا يمكن رفض حساب قائد الفريق (SuperAdmin).";
                }
                else
                {
                    user.Status = "Rejected";
                    user.ReviewedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync(ct);
                    TempData["SuccessMessage"] = $"تم رفض طلب الانضمام الخاص بـ ({user.FullName}).";
                }
            }
            return RedirectToAction(nameof(TeamRequests));
        }

        // POST: /AdminAuth/RevokeAccess
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RevokeAccess(int id, CancellationToken ct = default)
        {
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Id == id, ct);
            if (user != null)
            {
                if (user.Role == "SuperAdmin")
                {
                    TempData["ErrorMessage"] = "لا يمكن سحب صلاحية قائد الفريق (SuperAdmin).";
                }
                else
                {
                    user.Status = "Revoked";
                    user.ReviewedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync(ct);
                    TempData["SuccessMessage"] = $"تم سحب صلاحية الدخول من ({user.FullName}) بنجاح.";
                }
            }
            return RedirectToAction(nameof(TeamRequests));
        }

        // POST: /AdminAuth/RestoreAccess
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RestoreAccess(int id, CancellationToken ct = default)
        {
            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Id == id, ct);
            if (user != null && user.Role != "SuperAdmin")
            {
                user.Status = "Approved";
                user.ReviewedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync(ct);
                TempData["SuccessMessage"] = $"تمت إعادة تفعيل صلاحية الدخول لـ ({user.FullName}) بنجاح.";
            }
            return RedirectToAction(nameof(TeamRequests));
        }

        // POST: /AdminAuth/UpdateAdminPassword
        [HttpPost]
        [Authorize(Roles = "SuperAdmin")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateAdminPassword(int id, string newPassword, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Trim().Length < 6)
            {
                TempData["ErrorMessage"] = "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.";
                return RedirectToAction(nameof(TeamRequests));
            }

            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Id == id, ct);
            if (user == null)
            {
                TempData["ErrorMessage"] = "لم يتم العثور على المشرف المطلوب.";
                return RedirectToAction(nameof(TeamRequests));
            }

            user.Password = newPassword.Trim();
            await _context.SaveChangesAsync(ct);

            TempData["SuccessMessage"] = $"تم تحديث كلمة المرور للحساب ({user.FullName}) بنجاح.";
            return RedirectToAction(nameof(TeamRequests));
        }

        // GET: /AdminAuth/Profile
        [HttpGet]
        [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
        public async Task<IActionResult> Profile(CancellationToken ct = default)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int userId))
            {
                return RedirectToAction(nameof(Login));
            }

            var user = await _context.AdminUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
            if (user == null)
            {
                return RedirectToAction(nameof(Login));
            }

            var model = new AdminProfileViewModel
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role,
                Status = user.Status,
                Password = user.Password
            };

            return View(model);
        }

        // POST: /AdminAuth/Profile
        [HttpPost]
        [Authorize(Roles = "SuperAdmin,Admin", AuthenticationSchemes = "AdminCookie")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Profile(AdminProfileViewModel model, CancellationToken ct = default)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdStr, out int currentUserId))
            {
                return RedirectToAction(nameof(Login));
            }

            var user = await _context.AdminUsers.FirstOrDefaultAsync(u => u.Id == currentUserId, ct);
            if (user == null)
            {
                return RedirectToAction(nameof(Login));
            }

            if (!ModelState.IsValid)
            {
                model.Role = user.Role;
                model.Status = user.Status;
                return View(model);
            }

            user.FullName = model.FullName.Trim();

            // SuperAdmin can change email as well
            if (User.IsInRole("SuperAdmin") && !string.IsNullOrWhiteSpace(model.Email))
            {
                var normalizedEmail = model.Email.Trim().ToLowerInvariant();
                var emailTaken = await _context.AdminUsers.AnyAsync(u => u.Id != currentUserId && u.Email != null && u.Email.ToLower() == normalizedEmail, ct);
                if (emailTaken)
                {
                    ModelState.AddModelError(nameof(model.Email), "هذا البريد الإلكتروني مستخدم بالفعل من قبل مشرف آخر.");
                    model.Role = user.Role;
                    model.Status = user.Status;
                    return View(model);
                }
                user.Email = normalizedEmail;
            }

            // Update password if provided
            if (!string.IsNullOrWhiteSpace(model.Password))
            {
                if (model.Password.Trim().Length < 6)
                {
                    ModelState.AddModelError(nameof(model.Password), "كلمة المرور يجب ألا تقل عن 6 أحرف.");
                    model.Role = user.Role;
                    model.Status = user.Status;
                    return View(model);
                }
                user.Password = model.Password.Trim();
            }

            await _context.SaveChangesAsync(ct);

            // Re-sign in with updated claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };
            var identity = new ClaimsIdentity(claims, "AdminCookie");
            var principal = new ClaimsPrincipal(identity);
            await HttpContext.SignInAsync("AdminCookie", principal, new AuthenticationProperties { IsPersistent = true });

            TempData["SuccessMessage"] = "تم تحديث بيانات الملف الشخصي بنجاح.";
            model.Role = user.Role;
            model.Status = user.Status;
            model.Password = user.Password;
            return View(model);
        }
    }
}
