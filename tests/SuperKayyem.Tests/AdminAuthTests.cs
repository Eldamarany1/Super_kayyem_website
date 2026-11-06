using System.Reflection;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using SuperKayyem.Controllers;
using SuperKayyem.Data;
using SuperKayyem.Models;
using SuperKayyem.ViewModels;
using Xunit;

namespace SuperKayyem.Tests
{
    public class AdminAuthTests
    {
        private SuperKayyemDbContext CreateInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<SuperKayyemDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            return new SuperKayyemDbContext(options);
        }

        private static (ControllerContext controllerContext, TempDataDictionary tempData) CreateMockContext(ClaimsPrincipal? principal = null)
        {
            var services = new ServiceCollection();
            services.AddMvc();

            var authServiceMock = new Mock<IAuthenticationService>();
            authServiceMock
                .Setup(a => a.SignInAsync(It.IsAny<HttpContext>(), It.IsAny<string>(), It.IsAny<ClaimsPrincipal>(), It.IsAny<AuthenticationProperties>()))
                .Returns(Task.CompletedTask);
            authServiceMock
                .Setup(a => a.SignOutAsync(It.IsAny<HttpContext>(), It.IsAny<string>(), It.IsAny<AuthenticationProperties>()))
                .Returns(Task.CompletedTask);

            services.AddSingleton(authServiceMock.Object);

            var serviceProvider = services.BuildServiceProvider();

            var httpContext = new DefaultHttpContext
            {
                RequestServices = serviceProvider
            };

            if (principal != null)
            {
                httpContext.User = principal;
            }

            var urlHelperMock = new Mock<IUrlHelper>();
            urlHelperMock.Setup(u => u.IsLocalUrl(It.IsAny<string>())).Returns(true);

            var urlHelperFactoryMock = new Mock<IUrlHelperFactory>();
            urlHelperFactoryMock.Setup(f => f.GetUrlHelper(It.IsAny<ActionContext>())).Returns(urlHelperMock.Object);

            var tempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>());

            var controllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };

            return (controllerContext, tempData);
        }

        private static void SetupController(Controller controller, ClaimsPrincipal? principal = null)
        {
            var (context, tempData) = CreateMockContext(principal);
            controller.ControllerContext = context;
            controller.TempData = tempData;

            var urlHelperMock = new Mock<IUrlHelper>();
            urlHelperMock.Setup(u => u.Action(It.IsAny<UrlActionContext>())).Returns("/Admin/Index");
            urlHelperMock.Setup(u => u.IsLocalUrl(It.IsAny<string>())).Returns(true);
            controller.Url = urlHelperMock.Object;
        }

        [Fact]
        public async Task Seeder_Should_Create_SuperAdmin_When_Database_Is_Empty()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Seeder_Should_Create_SuperAdmin_When_Database_Is_Empty));

            // Act
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);

            // Assert
            var leader = await context.AdminUsers.FirstOrDefaultAsync(u => u.Email == AdminUserSeedData.SuperAdminEmail);
            Assert.NotNull(leader);
            Assert.Equal("SuperAdmin", leader.Role);
            Assert.Equal("Approved", leader.Status);
            Assert.Equal(AdminUserSeedData.SuperAdminPassword, leader.Password);
            Assert.Equal(1, leader.Id);
        }

        [Fact]
        public async Task Seeder_Should_Restore_Role_And_Status_If_Modified()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Seeder_Should_Restore_Role_And_Status_If_Modified));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);

            var leader = await context.AdminUsers.FirstAsync(u => u.Email == AdminUserSeedData.SuperAdminEmail);
            leader.Role = "Admin";
            leader.Status = "Revoked";
            await context.SaveChangesAsync();

            // Act
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);

            // Assert
            var refreshed = await context.AdminUsers.FirstAsync(u => u.Email == AdminUserSeedData.SuperAdminEmail);
            Assert.Equal("SuperAdmin", refreshed.Role);
            Assert.Equal("Approved", refreshed.Status);
        }

        [Fact]
        public async Task JoinTeam_Should_Create_Pending_AdminUser_And_Redirect()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(JoinTeam_Should_Create_Pending_AdminUser_And_Redirect));
            var controller = new AdminAuthController(context);
            SetupController(controller);

            var model = new JoinTeamViewModel
            {
                FullName = "مطور جديد",
                Email = "developer@superkayyem.com",
                Password = "Password123!",
                ConfirmPassword = "Password123!"
            };

            // Act
            var result = await controller.JoinTeam(model);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminAuthController.Login), redirectResult.ActionName);

            var createdUser = await context.AdminUsers.FirstOrDefaultAsync(u => u.Email == "developer@superkayyem.com");
            Assert.NotNull(createdUser);
            Assert.Equal("مطور جديد", createdUser.FullName);
            Assert.Equal("Admin", createdUser.Role);
            Assert.Equal("Pending", createdUser.Status);
            Assert.NotNull(controller.TempData["SuccessRequestMessage"]);
        }

        [Fact]
        public async Task JoinTeam_Should_Return_View_When_ModelState_Is_Invalid()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(JoinTeam_Should_Return_View_When_ModelState_Is_Invalid));
            var controller = new AdminAuthController(context);
            SetupController(controller);
            controller.ModelState.AddModelError("FullName", "الاسم الكامل مطلوب");

            var model = new JoinTeamViewModel();

            // Act
            var result = await controller.JoinTeam(model);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.False(controller.ModelState.IsValid);
        }

        [Fact]
        public async Task JoinTeam_Should_Reject_Duplicate_Email()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(JoinTeam_Should_Reject_Duplicate_Email));
            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Seed initial request
            context.AdminUsers.Add(new AdminUser
            {
                Id = 10,
                FullName = "مستخدم سابق",
                Email = "existing@example.com",
                Password = "SecretPassword1",
                Role = "Admin",
                Status = "Pending"
            });
            await context.SaveChangesAsync();

            var model = new JoinTeamViewModel
            {
                FullName = "مستخدم جديد بنفس البريد",
                Email = "existing@example.com",
                Password = "NewPassword123",
                ConfirmPassword = "NewPassword123"
            };

            // Act
            var result = await controller.JoinTeam(model);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(controller.ViewData["WarningMessage"]);
        }

        [Fact]
        public async Task Login_Should_Return_View_When_ModelState_Is_Invalid()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_Should_Return_View_When_ModelState_Is_Invalid));
            var controller = new AdminAuthController(context);
            SetupController(controller);
            controller.ModelState.AddModelError("Email", "بريد إلكتروني غير صالح");

            var model = new AdminLoginViewModel();

            // Act
            var result = await controller.Login(model);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.False(controller.ModelState.IsValid);
        }

        [Fact]
        public async Task Login_Should_Reject_Wrong_Password()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_Should_Reject_Wrong_Password));
            var controller = new AdminAuthController(context);
            SetupController(controller);

            var model = new AdminLoginViewModel
            {
                Email = AdminUserSeedData.SuperAdminEmail,
                Password = "WrongPassword999"
            };

            // Act
            var result = await controller.Login(model);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(controller.ViewData["ErrorMessage"]);
        }

        [Fact]
        public async Task Login_Should_Reject_Pending_Status()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_Should_Reject_Pending_Status));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 2,
                FullName = "عضو معلق",
                Email = "pending@example.com",
                Password = "Pass12345",
                Role = "Admin",
                Status = "Pending"
            });
            await context.SaveChangesAsync();

            var controller = new AdminAuthController(context);
            SetupController(controller);

            var model = new AdminLoginViewModel
            {
                Email = "pending@example.com",
                Password = "Pass12345"
            };

            // Act
            var result = await controller.Login(model);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(controller.ViewData["WarningMessage"]);
        }

        [Fact]
        public async Task Login_Should_Reject_Revoked_Status()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_Should_Reject_Revoked_Status));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 3,
                FullName = "عضو مسحوب الصلاحية",
                Email = "revoked@example.com",
                Password = "Pass12345",
                Role = "Admin",
                Status = "Revoked"
            });
            await context.SaveChangesAsync();

            var controller = new AdminAuthController(context);
            SetupController(controller);

            var model = new AdminLoginViewModel
            {
                Email = "revoked@example.com",
                Password = "Pass12345"
            };

            // Act
            var result = await controller.Login(model);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(controller.ViewData["ErrorMessage"]);
            Assert.Contains("إيقاف صلاحية", controller.ViewData["ErrorMessage"]?.ToString() ?? "");
        }

        [Fact]
        public async Task Login_Should_Reject_Rejected_Status()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_Should_Reject_Rejected_Status));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 4,
                FullName = "عضو مرفوض",
                Email = "rejected@example.com",
                Password = "Pass12345",
                Role = "Admin",
                Status = "Rejected"
            });
            await context.SaveChangesAsync();

            var controller = new AdminAuthController(context);
            SetupController(controller);

            var model = new AdminLoginViewModel
            {
                Email = "rejected@example.com",
                Password = "Pass12345"
            };

            // Act
            var result = await controller.Login(model);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.NotNull(controller.ViewData["ErrorMessage"]);
            Assert.Contains("تم رفض", controller.ViewData["ErrorMessage"]?.ToString() ?? "");
        }

        [Fact]
        public async Task Login_Should_Allow_Approved_SuperAdmin_And_Redirect()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_Should_Allow_Approved_SuperAdmin_And_Redirect));
            var controller = new AdminAuthController(context);
            SetupController(controller);

            var model = new AdminLoginViewModel
            {
                Email = AdminUserSeedData.SuperAdminEmail,
                Password = AdminUserSeedData.SuperAdminPassword
            };

            // Act
            var result = await controller.Login(model);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("Index", redirectResult.ActionName);
            Assert.Equal("Admin", redirectResult.ControllerName);
        }

        [Fact]
        public async Task Authenticated_User_Visiting_Login_Or_JoinTeam_Should_Redirect_To_Admin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Authenticated_User_Visiting_Login_Or_JoinTeam_Should_Redirect_To_Admin));
            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "Leader"),
                new Claim(ClaimTypes.Role, "SuperAdmin")
            }, CookieAuthenticationDefaults.AuthenticationScheme));

            var controller = new AdminAuthController(context);
            SetupController(controller, principal);

            // Act
            var loginResult = await controller.Login();
            var joinResult = controller.JoinTeam();

            // Assert
            var loginRedirect = Assert.IsType<RedirectToActionResult>(loginResult);
            Assert.Equal("Index", loginRedirect.ActionName);
            Assert.Equal("Admin", loginRedirect.ControllerName);

            var joinRedirect = Assert.IsType<RedirectToActionResult>(joinResult);
            Assert.Equal("Index", joinRedirect.ActionName);
            Assert.Equal("Admin", joinRedirect.ControllerName);
        }

        [Fact]
        public async Task Logout_Should_SignOut_And_Redirect_To_Login()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Logout_Should_SignOut_And_Redirect_To_Login));
            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Act
            var result = await controller.Logout();

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminAuthController.Login), redirectResult.ActionName);
        }

        [Fact]
        public void AccessDenied_Should_Return_View()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AccessDenied_Should_Return_View));
            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Act
            var result = controller.AccessDenied();

            // Assert
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public async Task AdminController_SuperAdmin_Actions_Should_Approve_Reject_Revoke_And_Restore()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_SuperAdmin_Actions_Should_Approve_Reject_Revoke_And_Restore));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 10,
                FullName = "متقدم للطلب",
                Email = "applicant@example.com",
                Password = "Pass123",
                Role = "Admin",
                Status = "Pending"
            });
            await context.SaveChangesAsync();

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>(), null!);
            SetupController(controller);

            // 1. Approve
            var approveResult = await controller.ApproveRequest(10);
            var approvedUser = await context.AdminUsers.FirstAsync(u => u.Id == 10);
            Assert.Equal("Approved", approvedUser.Status);
            Assert.NotNull(approvedUser.ReviewedAt);

            // 2. Revoke
            var revokeResult = await controller.RevokeAccess(10);
            var revokedUser = await context.AdminUsers.FirstAsync(u => u.Id == 10);
            Assert.Equal("Revoked", revokedUser.Status);

            // 3. Restore
            var restoreResult = await controller.RestoreAccess(10);
            var restoredUser = await context.AdminUsers.FirstAsync(u => u.Id == 10);
            Assert.Equal("Approved", restoredUser.Status);

            // 4. Reject
            restoredUser.Status = "Pending";
            await context.SaveChangesAsync();
            var rejectResult = await controller.RejectRequest(10);
            var rejectedUser = await context.AdminUsers.FirstAsync(u => u.Id == 10);
            Assert.Equal("Rejected", rejectedUser.Status);
        }

        [Fact]
        public async Task AdminController_TeamRequests_Should_Return_All_Users_And_Set_Badge()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_TeamRequests_Should_Return_All_Users_And_Set_Badge));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 20,
                FullName = "مستخدم معلق 1",
                Email = "pending1@example.com",
                Password = "P1",
                Role = "Admin",
                Status = "Pending"
            });
            context.AdminUsers.Add(new AdminUser
            {
                Id = 21,
                FullName = "مستخدم معلق 2",
                Email = "pending2@example.com",
                Password = "P2",
                Role = "Admin",
                Status = "Pending"
            });
            await context.SaveChangesAsync();

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>(), null!);
            SetupController(controller);

            // Act
            var result = await controller.TeamRequests();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsAssignableFrom<IEnumerable<AdminUser>>(viewResult.Model);
            Assert.Contains(model, u => u.Id == 20);
            Assert.Contains(model, u => u.Id == 21);
            Assert.Equal(2, controller.ViewBag.PendingRequestsCount);
        }

        [Fact]
        public async Task AdminController_Should_Not_Allow_Revoking_SuperAdmin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_Should_Not_Allow_Revoking_SuperAdmin));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);
            var superAdmin = await context.AdminUsers.FirstAsync(u => u.Role == "SuperAdmin");

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>(), null!);
            SetupController(controller);

            // Act - try to revoke SuperAdmin
            await controller.RevokeAccess(superAdmin.Id);

            // Assert - SuperAdmin status remains Approved
            var checkAdmin = await context.AdminUsers.FirstAsync(u => u.Id == superAdmin.Id);
            Assert.Equal("Approved", checkAdmin.Status);
            Assert.Equal("SuperAdmin", checkAdmin.Role);
        }

        [Fact]
        public async Task OnActionExecutionAsync_Should_Populate_PendingRequestsCount_For_SuperAdmin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(OnActionExecutionAsync_Should_Populate_PendingRequestsCount_For_SuperAdmin));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 30,
                FullName = "معلق",
                Email = "pend@example.com",
                Password = "p",
                Role = "Admin",
                Status = "Pending"
            });
            await context.SaveChangesAsync();

            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "Leader"),
                new Claim(ClaimTypes.Role, "SuperAdmin")
            }, CookieAuthenticationDefaults.AuthenticationScheme));

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>(), null!);
            SetupController(controller, principal);

            var actionContext = new ActionContext(controller.HttpContext, new RouteData(), new ActionDescriptor());
            var executingContext = new ActionExecutingContext(actionContext, new List<IFilterMetadata>(), new Dictionary<string, object?>(), controller);

            // Act
            await controller.OnActionExecutionAsync(executingContext, () => Task.FromResult(new ActionExecutedContext(actionContext, new List<IFilterMetadata>(), controller)));

            // Assert
            Assert.Equal(1, controller.ViewBag.PendingRequestsCount);
        }

        [Fact]
        public void Controller_Authorization_Attributes_Must_Be_Properly_Configured()
        {
            // 1. AdminController class Authorize
            var adminAuthAttr = typeof(AdminController).GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(adminAuthAttr);
            Assert.Equal("SuperAdmin,Admin", adminAuthAttr.Roles);

            // 2. AccountController class Authorize
            var accountAuthAttr = typeof(AccountController).GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(accountAuthAttr);
            Assert.Equal("SuperAdmin,Admin", accountAuthAttr.Roles);

            // 3. SuperAdmin exclusive actions in AdminController
            var teamRequestsAttr = typeof(AdminController).GetMethod(nameof(AdminController.TeamRequests))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(teamRequestsAttr);
            Assert.Equal("SuperAdmin", teamRequestsAttr.Roles);

            var approveAttr = typeof(AdminController).GetMethod(nameof(AdminController.ApproveRequest))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(approveAttr);
            Assert.Equal("SuperAdmin", approveAttr.Roles);

            var revokeAttr = typeof(AdminController).GetMethod(nameof(AdminController.RevokeAccess))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(revokeAttr);
            Assert.Equal("SuperAdmin", revokeAttr.Roles);

            // 4. API controllers must NOT have Authorize attribute (to keep public React frontend working!)
            var storiesApiAuthAttr = typeof(StoriesController).GetCustomAttribute<AuthorizeAttribute>();
            Assert.Null(storiesApiAuthAttr);

            var accountsApiAuthAttr = typeof(AccountsController).GetCustomAttribute<AuthorizeAttribute>();
            Assert.Null(accountsApiAuthAttr);
        }

        [Fact]
        public async Task Seeder_Should_Update_Password_And_Name_When_Changed_In_Code()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Seeder_Should_Update_Password_And_Name_When_Changed_In_Code));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 1,
                FullName = "Old Display Name",
                Email = AdminUserSeedData.SuperAdminEmail,
                Password = "OldPassword999",
                Role = "SuperAdmin",
                Status = "Approved"
            });
            await context.SaveChangesAsync();

            // Act
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);

            // Assert - credentials synchronized to constants
            var refreshed = await context.AdminUsers.FirstAsync(u => u.Email == AdminUserSeedData.SuperAdminEmail);
            Assert.Equal(AdminUserSeedData.SuperAdminPassword, refreshed.Password);
            Assert.Equal(AdminUserSeedData.SuperAdminDisplayName, refreshed.FullName);
        }

        [Fact]
        public async Task Login_GET_Should_SignOut_When_Active_User_Is_Revoked()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_GET_Should_SignOut_When_Active_User_Is_Revoked));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 99,
                FullName = "مشرف تم سحب صلاحيته",
                Email = "revoked_member@example.com",
                Password = "P",
                Role = "Admin",
                Status = "Revoked"
            });
            await context.SaveChangesAsync();

            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "99"),
                new Claim(ClaimTypes.Name, "Revoked Member"),
                new Claim(ClaimTypes.Role, "Admin")
            }, CookieAuthenticationDefaults.AuthenticationScheme));

            var controller = new AdminAuthController(context);
            SetupController(controller, principal);

            // Act
            var result = await controller.Login();

            // Assert - returns View instead of redirecting to /Admin/Index
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public void JoinTeam_GET_Should_SignOut_When_Active_User_Is_Revoked()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(JoinTeam_GET_Should_SignOut_When_Active_User_Is_Revoked));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 98,
                FullName = "مشرف ملغى",
                Email = "revoked_member2@example.com",
                Password = "P",
                Role = "Admin",
                Status = "Revoked"
            });
            context.SaveChanges();

            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "98"),
                new Claim(ClaimTypes.Name, "Revoked Member 2"),
                new Claim(ClaimTypes.Role, "Admin")
            }, CookieAuthenticationDefaults.AuthenticationScheme));

            var controller = new AdminAuthController(context);
            SetupController(controller, principal);

            // Act
            var result = controller.JoinTeam();

            // Assert - returns View instead of redirecting to /Admin/Index
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public async Task AdminController_RevokeAccess_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_RevokeAccess_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);
            var superAdmin = await context.AdminUsers.FirstAsync(u => u.Role == "SuperAdmin");

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>(), null!);
            SetupController(controller);

            // Act
            var result = await controller.RevokeAccess(superAdmin.Id);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminController.TeamRequests), redirectResult.ActionName);
            Assert.NotNull(controller.TempData["ErrorMessage"]);
            Assert.Contains("لا يمكن سحب صلاحية قائد الفريق", controller.TempData["ErrorMessage"]?.ToString() ?? "");
        }

        [Fact]
        public async Task AdminController_RejectRequest_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_RejectRequest_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);
            var superAdmin = await context.AdminUsers.FirstAsync(u => u.Role == "SuperAdmin");

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>(), null!);
            SetupController(controller);

            // Act
            var result = await controller.RejectRequest(superAdmin.Id);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminController.TeamRequests), redirectResult.ActionName);
            Assert.NotNull(controller.TempData["ErrorMessage"]);
            Assert.Contains("لا يمكن رفض حساب قائد الفريق", controller.TempData["ErrorMessage"]?.ToString() ?? "");
        }

        [Fact]
        public void AccessDenied_GET_Should_Return_View_When_Unauthenticated()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AccessDenied_GET_Should_Return_View_When_Unauthenticated));
            var controller = new AdminAuthController(context);
            SetupController(controller); // Unauthenticated context

            // Act
            var result = controller.AccessDenied();

            // Assert
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public void AccessDenied_GET_Should_Return_View_When_Authenticated()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AccessDenied_GET_Should_Return_View_When_Authenticated));
            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, "Member"),
                new Claim(ClaimTypes.Role, "Admin")
            }, CookieAuthenticationDefaults.AuthenticationScheme));

            var controller = new AdminAuthController(context);
            SetupController(controller, principal);

            // Act
            var result = controller.AccessDenied();

            // Assert
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public async Task LogoutGet_Should_SignOut_And_Redirect_To_Login()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(LogoutGet_Should_SignOut_And_Redirect_To_Login));
            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Act
            var result = await controller.LogoutGet();

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminAuthController.Login), redirectResult.ActionName);
        }

        [Fact]
        public async Task Login_POST_Should_Not_Redirect_To_AdminAuth_ReturnUrl()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_POST_Should_Not_Redirect_To_AdminAuth_ReturnUrl));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);

            var controller = new AdminAuthController(context);
            SetupController(controller);

            var model = new AdminLoginViewModel
            {
                Email = AdminUserSeedData.SuperAdminEmail,
                Password = AdminUserSeedData.SuperAdminPassword
            };

            // Act - circular returnUrl pointing to /AdminAuth/Login
            var result = await controller.Login(model, returnUrl: "/AdminAuth/Login");

            // Assert - redirects to /Admin/Index, avoiding circular redirect
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal("Index", redirectResult.ActionName);
            Assert.Equal("Admin", redirectResult.ControllerName);
        }
    }
}
