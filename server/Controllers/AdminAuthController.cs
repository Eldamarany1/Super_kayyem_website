using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Data;
using SuperKayyem.Models;
using SuperKayyem.ViewModels;

namespace SuperKayyem.Controllers
{
    [AllowAnonymous]
    public class AdminAuthController : Controller
    {
        private readonly SuperKayyemDbContext _context;

        public AdminAuthController(SuperKayyemDbContext context)
        {
            _context = context;
        }

        // GET: /AdminAuth/Login
        [HttpGet]
        public async Task<IActionResult> Login(string? returnUrl = null, CancellationToken ct = default)
        {
            // If already logged in, verify status is still Approved in DB
            if (User.Identity is { IsAuthenticated: true })
            {
                var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (int.TryParse(userIdStr, out int userId))
                {
                    var user = await _context.AdminUsers.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, ct);
                    if (user != null && user.Status == "Approved")
                    {
                        return RedirectToAction("Index", "Admin");
                    }

                    // Account revoked or removed; clear auth cookie
                    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                }
                else
                {
                    return RedirectToAction("Index", "Admin");
                }
            }

            await AdminUserSeedData.EnsureSuperAdminSeededAsync(_context, ct);
            ViewData["ReturnUrl"] = returnUrl;
            return View(new AdminLoginViewModel());
        }

        // POST: /AdminAuth/Login
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

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
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

                    HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme).GetAwaiter().GetResult();
                }
                else
                {
                    return RedirectToAction("Index", "Admin");
                }
            }

            return View(new JoinTeamViewModel());
        }

        // POST: /AdminAuth/JoinTeam
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
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction(nameof(Login));
        }

        // GET: /AdminAuth/Logout (fallback)
        [HttpGet]
        public async Task<IActionResult> LogoutGet()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction(nameof(Login));
        }

        // GET: /AdminAuth/AccessDenied
        [HttpGet]
        public IActionResult AccessDenied()
        {
            return View();
        }
    }
}
