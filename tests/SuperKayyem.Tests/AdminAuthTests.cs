using System.ComponentModel.DataAnnotations;
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
        public async Task Login_Should_SignIn_Specifically_To_AdminCookie_Scheme_And_Not_Duplicate()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Login_Should_SignIn_Specifically_To_AdminCookie_Scheme_And_Not_Duplicate));
            var authServiceMock = new Mock<IAuthenticationService>();
            authServiceMock
                .Setup(a => a.SignInAsync(It.IsAny<HttpContext>(), It.IsAny<string>(), It.IsAny<ClaimsPrincipal>(), It.IsAny<AuthenticationProperties>()))
                .Returns(Task.CompletedTask);

            var services = new ServiceCollection();
            services.AddMvc();
            services.AddSingleton(authServiceMock.Object);
            var serviceProvider = services.BuildServiceProvider();

            var httpContext = new DefaultHttpContext
            {
                RequestServices = serviceProvider
            };

            var controller = new AdminAuthController(context);
            controller.ControllerContext = new ControllerContext { HttpContext = httpContext };
            controller.TempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>());
            var urlHelperMock = new Mock<IUrlHelper>();
            urlHelperMock.Setup(u => u.IsLocalUrl(It.IsAny<string>())).Returns(true);
            controller.Url = urlHelperMock.Object;

            var model = new AdminLoginViewModel
            {
                Email = AdminUserSeedData.SuperAdminEmail,
                Password = AdminUserSeedData.SuperAdminPassword
            };

            // Act
            var result = await controller.Login(model);

            // Assert
            Assert.IsType<RedirectToActionResult>(result);
            authServiceMock.Verify(a => a.SignInAsync(It.IsAny<HttpContext>(), "AdminCookie", It.IsAny<ClaimsPrincipal>(), It.IsAny<AuthenticationProperties>()), Times.Once);
            authServiceMock.Verify(a => a.SignInAsync(It.IsAny<HttpContext>(), CookieAuthenticationDefaults.AuthenticationScheme, It.IsAny<ClaimsPrincipal>(), It.IsAny<AuthenticationProperties>()), Times.Never);
        }

        [Fact]
        public async Task Test_Create_ModelBinding_From_FormData()
        {
            using var context = CreateInMemoryContext(nameof(Test_Create_ModelBinding_From_FormData));
            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            // Test if ExtractPagesFromForm or story.Pages works
            var story = new Story
            {
                Title = "قصة تجريبية",
                Category = "الصدق",
                TargetAge = 6,
                Price = 25m,
                Description = "وصف تجريبي"
            };

            // If story.Pages was empty, simulate what happens in controller
            var formCollection = new FormCollection(new Dictionary<string, Microsoft.Extensions.Primitives.StringValues>
            {
                { "Pages[0].PageNum", "1" },
                { "Pages[0].Headline", "عنوان" },
                { "Pages[0].HasSeparator", "true" },
                { "Pages[0].Content", "محتوى الصفحة الأولى" }
            });

            controller.ControllerContext.HttpContext.Request.Form = formCollection;

            var result = await controller.Create(story, "editor", null, null, null);
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(StoriesController.Index), redirectResult.ActionName);

            var savedInDb = await context.Stories.FirstOrDefaultAsync(s => s.Title == "قصة تجريبية");
            Assert.NotNull(savedInDb);
            Assert.Equal(1, savedInDb.PageCount);
            Assert.Single(savedInDb.Pages);
            Assert.Equal("محتوى الصفحة الأولى", savedInDb.Pages[0].Content);
            Assert.Equal("/images/covers/story1.svg", savedInDb.CoverImage);
        }

        [Fact]
        public async Task Test_Real_Mongo_Story_Save()
        {
            var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "..", "server", "appsettings.json");
            if (!File.Exists(jsonPath)) return;
            var json = await File.ReadAllTextAsync(jsonPath);
            using var doc = System.Text.Json.JsonDocument.Parse(json);
            var uri = doc.RootElement.GetProperty("MongoDBSettings").GetProperty("AtlasURI").GetString();
            var dbName = doc.RootElement.GetProperty("MongoDBSettings").GetProperty("DatabaseName").GetString();

            if (string.IsNullOrEmpty(uri)) return;

            var options = new DbContextOptionsBuilder<SuperKayyemDbContext>()
                .UseMongoDB(uri, dbName ?? "SuperKayyemDb")
                .Options;

            using var db = new SuperKayyemDbContext(options);

            var stories = await db.Stories.AsNoTracking().Take(5).ToListAsync();
            Assert.NotNull(stories);

            int nextId = (await db.Stories.MaxAsync(s => (int?)s.Id) ?? 0) + 1;
            var testStory = new Story
            {
                Id = nextId,
                Title = "قصة فحص MongoDB",
                Category = "الصدق",
                TargetAge = 7,
                Price = 15m,
                Description = "قصة فحص",
                CoverImage = "/images/covers/story1.svg",
                Pages = new List<StoryPageItem>
                {
                    new StoryPageItem { PageNum = 1, Headline = "ع 1", HasSeparator = true, Content = "نص صفحة فحص" }
                }
            };

            await db.Stories.AddAsync(testStory);
            await db.SaveChangesAsync();

            // Clean up
            db.Stories.Remove(testStory);
            await db.SaveChangesAsync();
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
        public async Task AdminAuthController_SuperAdmin_Actions_Should_Approve_Reject_Revoke_And_Restore()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_SuperAdmin_Actions_Should_Approve_Reject_Revoke_And_Restore));
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

            var controller = new AdminAuthController(context);
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
        public async Task AdminAuthController_TeamRequests_Should_Return_All_Users_And_Set_Badge()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_TeamRequests_Should_Return_All_Users_And_Set_Badge));
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

            var controller = new AdminAuthController(context);
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
        public async Task AdminAuthController_Should_Not_Allow_Revoking_SuperAdmin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_Should_Not_Allow_Revoking_SuperAdmin));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);
            var superAdmin = await context.AdminUsers.FirstAsync(u => u.Role == "SuperAdmin");

            var controller = new AdminAuthController(context);
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

            // 3. SuperAdmin exclusive actions in AdminAuthController
            var teamRequestsAttr = typeof(AdminAuthController).GetMethod(nameof(AdminAuthController.TeamRequests))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(teamRequestsAttr);
            Assert.Equal("SuperAdmin", teamRequestsAttr.Roles);

            var approveAttr = typeof(AdminAuthController).GetMethod(nameof(AdminAuthController.ApproveRequest))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(approveAttr);
            Assert.Equal("SuperAdmin", approveAttr.Roles);

            var revokeAttr = typeof(AdminAuthController).GetMethod(nameof(AdminAuthController.RevokeAccess))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(revokeAttr);
            Assert.Equal("SuperAdmin", revokeAttr.Roles);

            var updatePassAttr = typeof(AdminAuthController).GetMethod(nameof(AdminAuthController.UpdateAdminPassword))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(updatePassAttr);
            Assert.Equal("SuperAdmin", updatePassAttr.Roles);

            // 4. AdminCookie AuthenticationSchemes enforcement
            var profileAttr = typeof(AdminAuthController).GetMethod(nameof(AdminAuthController.Profile), new[] { typeof(CancellationToken) })?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(profileAttr);
            Assert.Equal("AdminCookie", profileAttr.AuthenticationSchemes);

            var storiesIndexAttr = typeof(StoriesController).GetMethod(nameof(StoriesController.Index))?.GetCustomAttribute<AuthorizeAttribute>();
            Assert.NotNull(storiesIndexAttr);
            Assert.Equal("AdminCookie", storiesIndexAttr.AuthenticationSchemes);

            // 5. API controllers must NOT have Authorize attribute (to keep public React frontend working!)
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
        public async Task AdminAuthController_RevokeAccess_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_RevokeAccess_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);
            var superAdmin = await context.AdminUsers.FirstAsync(u => u.Role == "SuperAdmin");

            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Act
            var result = await controller.RevokeAccess(superAdmin.Id);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminAuthController.TeamRequests), redirectResult.ActionName);
            Assert.NotNull(controller.TempData["ErrorMessage"]);
            Assert.Contains("لا يمكن سحب صلاحية قائد الفريق", controller.TempData["ErrorMessage"]?.ToString() ?? "");
        }

        [Fact]
        public async Task AdminAuthController_RejectRequest_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_RejectRequest_Should_Set_ErrorMessage_When_Target_Is_SuperAdmin));
            await AdminUserSeedData.EnsureSuperAdminSeededAsync(context);
            var superAdmin = await context.AdminUsers.FirstAsync(u => u.Role == "SuperAdmin");

            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Act
            var result = await controller.RejectRequest(superAdmin.Id);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminAuthController.TeamRequests), redirectResult.ActionName);
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

        [Fact]
        public async Task AdminController_Index_Should_Return_AdminDashboardViewModel_With_Accurate_Counts()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_Index_Should_Return_AdminDashboardViewModel_With_Accurate_Counts));
            
            // Seed Stories
            context.Stories.Add(new Story { Id = 1, Title = "قصة 1", TargetAge = 5, Price = 30m, Category = "التعاون" });
            context.Stories.Add(new Story { Id = 2, Title = "قصة 2", TargetAge = 7, Price = 40m, Category = "الشجاعة", PdfUrl = "https://example.com/story.pdf" });
            context.Stories.Add(new Story { Id = 3, Title = "قصة 3", TargetAge = 9, Price = 50m, Category = "الصدق" });

            // Seed Articles
            context.Articles.Add(new Article
            {
                Id = 1,
                Title = "مقال 1",
                AuthorName = "المشرف الأول",
                AuthorEmail = "admin1@example.com",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conc"
            });

            // Seed Accounts with Children
            context.Accounts.Add(new Account
            {
                Id = 1,
                FirstName = "علي",
                LastName = "حسن",
                Email = "ali@example.com",
                Password = "pass",
                Gender = "ذكر",
                Children = new List<Child>
                {
                    new Child { Id = 101, Name = "سالم", Age = 5, Gender = "ذكر" },
                    new Child { Id = 102, Name = "ريم", Age = 7, Gender = "أنثى" }
                }
            });

            // Seed Admin Users
            context.AdminUsers.Add(new AdminUser
            {
                Id = 10,
                FullName = "المشرف الأول",
                Email = "admin1@example.com",
                Password = "P1",
                Role = "Admin",
                Status = "Approved"
            });
            context.AdminUsers.Add(new AdminUser
            {
                Id = 11,
                FullName = "متقدم جديد",
                Email = "pending@example.com",
                Password = "P2",
                Role = "Admin",
                Status = "Pending"
            });

            await context.SaveChangesAsync();

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>());
            SetupController(controller);

            // Act
            var result = await controller.Index();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsType<AdminDashboardViewModel>(viewResult.Model);

            Assert.Equal(3, model.TotalStories);
            Assert.Equal(1, model.TotalArticles);
            Assert.Equal(1, model.TotalAccounts);
            Assert.Equal(2, model.TotalChildren);
            Assert.True(model.TotalApprovedAdmins >= 1);
            Assert.Equal(1, model.PendingAdminRequests);

            Assert.Equal(3, model.AgeGroupDistributions.Count);
            var group46 = model.AgeGroupDistributions.First(g => g.AgeGroup == "4-6");
            Assert.Equal(1, group46.StoriesCount);
            Assert.Equal(1, group46.ChildrenCount);

            var group68 = model.AgeGroupDistributions.First(g => g.AgeGroup == "6-8");
            Assert.Equal(1, group68.StoriesCount);
            Assert.Equal(1, group68.ChildrenCount);

            var group810 = model.AgeGroupDistributions.First(g => g.AgeGroup == "8-10");
            Assert.Equal(1, group810.StoriesCount);
            Assert.Equal(0, group810.ChildrenCount);

            Assert.NotEmpty(model.RecentStories);
            Assert.NotEmpty(model.AdminArticleStats);
        }

        [Fact]
        public async Task StoriesController_Should_Serve_Both_Public_Api_And_Mvc_Views()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(StoriesController_Should_Serve_Both_Public_Api_And_Mvc_Views));
            context.Stories.Add(new Story
            {
                Id = 1,
                Title = "قصة تجريبية",
                Category = "الصدق",
                TargetAge = 6,
                Price = 25m,
                PdfUrl = "https://example.com/test.pdf"
            });
            await context.SaveChangesAsync();

            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            // 1. Test Public API GetAll
            var apiGetAll = await controller.GetAll();
            var okResult = Assert.IsType<OkObjectResult>(apiGetAll.Result);
            var apiStories = Assert.IsAssignableFrom<IEnumerable<Story>>(okResult.Value);
            Assert.Single(apiStories);

            // 2. Test Public API GetById
            var apiGetById = await controller.GetById(1);
            var okByIdResult = Assert.IsType<OkObjectResult>(apiGetById);
            var singleStory = Assert.IsType<Story>(okByIdResult.Value);
            Assert.Equal(1, singleStory.Id);

            // 3. Test MVC View Index
            var mvcIndex = await controller.Index();
            var viewResult = Assert.IsType<ViewResult>(mvcIndex);
            var mvcStories = Assert.IsAssignableFrom<IEnumerable<Story>>(viewResult.Model);
            Assert.Single(mvcStories);

            // 4. Test MVC View Create in Editor Mode
            var newEditorStory = new Story
            {
                Title = "قصة بالمحرر",
                Category = "التعاون",
                TargetAge = 5,
                Price = 30m,
                Pages = new List<StoryPageItem>
                {
                    new StoryPageItem { Headline = "مقدمة", HasSeparator = true, Content = "نص الصفحة الأولى" },
                    new StoryPageItem { Headline = "نهاية", HasSeparator = false, Content = "نص الصفحة الثانية" }
                }
            };
            var createResult = await controller.Create(newEditorStory, "editor", null, null, null);
            var redirectCreate = Assert.IsType<RedirectToActionResult>(createResult);
            Assert.Equal(nameof(StoriesController.Index), redirectCreate.ActionName);

            var createdInDb = await context.Stories.FirstOrDefaultAsync(s => s.Title == "قصة بالمحرر");
            Assert.NotNull(createdInDb);
            Assert.Null(createdInDb.PdfUrl);
            Assert.Equal(2, createdInDb.PageCount);
            Assert.Equal(2, createdInDb.Pages.Count);
            Assert.Equal(1, createdInDb.Pages[0].PageNum);
            Assert.Equal(2, createdInDb.Pages[1].PageNum);
        }

        [Fact]
        public async Task AdminAuthController_SuperAdmin_Should_Update_Any_Admin_Password()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_SuperAdmin_Should_Update_Any_Admin_Password));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 30,
                FullName = "مشرف المستهدف",
                Email = "target@example.com",
                Password = "OldPassword1",
                Role = "Admin",
                Status = "Approved"
            });
            await context.SaveChangesAsync();

            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Act - SuperAdmin updates password of admin #30
            var result = await controller.UpdateAdminPassword(30, "BrandNewPassword123");

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminAuthController.TeamRequests), redirectResult.ActionName);

            var updatedUser = await context.AdminUsers.FirstAsync(u => u.Id == 30);
            Assert.Equal("BrandNewPassword123", updatedUser.Password);
            Assert.NotNull(controller.TempData["SuccessMessage"]);
        }

        [Fact]
        public async Task AdminAuthController_Profile_Should_Allow_Admin_To_Update_Own_Password()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_Profile_Should_Allow_Admin_To_Update_Own_Password));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 55,
                FullName = "مشرف عادي",
                Email = "regular@example.com",
                Password = "OldPassword2",
                Role = "Admin",
                Status = "Approved"
            });
            await context.SaveChangesAsync();

            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "55"),
                new Claim(ClaimTypes.Name, "مشرف عادي"),
                new Claim(ClaimTypes.Email, "regular@example.com"),
                new Claim(ClaimTypes.Role, "Admin")
            }, CookieAuthenticationDefaults.AuthenticationScheme));

            var controller = new AdminAuthController(context);
            SetupController(controller, principal);

            // 1. GET Profile
            var getProfileResult = await controller.Profile();
            var viewResult = Assert.IsType<ViewResult>(getProfileResult);
            var profileModel = Assert.IsType<AdminProfileViewModel>(viewResult.Model);
            Assert.Equal(55, profileModel.Id);
            Assert.Equal("OldPassword2", profileModel.Password);

            // 2. POST Profile with new password and updated name
            var updateModel = new AdminProfileViewModel
            {
                Id = 55,
                FullName = "مشرف عادي محدث",
                Email = "regular@example.com",
                Password = "SuperSecureNewPassword456"
            };

            var postProfileResult = await controller.Profile(updateModel);
            var postViewResult = Assert.IsType<ViewResult>(postProfileResult);
            var resultModel = Assert.IsType<AdminProfileViewModel>(postViewResult.Model);

            var userInDb = await context.AdminUsers.FirstAsync(u => u.Id == 55);
            Assert.Equal("مشرف عادي محدث", userInDb.FullName);
            Assert.Equal("SuperSecureNewPassword456", userInDb.Password);
        }

        [Fact]
        public async Task AccountController_Update_Should_Save_Password_When_Provided()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AccountController_Update_Should_Save_Password_When_Provided));
            context.Accounts.Add(new Account
            {
                Id = 77,
                FirstName = "محمد",
                LastName = "خالد",
                Email = "mohamed@example.com",
                Password = "OriginalPassword777",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "ذكر"
            });
            await context.SaveChangesAsync();

            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new AccountController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AccountController>>(), cloudinary);
            SetupController(controller);

            var updatedModel = new Account
            {
                Id = 77,
                FirstName = "محمد",
                LastName = "خالد",
                Email = "mohamed@example.com",
                DateOfBirth = new DateTime(1990, 1, 1),
                Gender = "ذكر",
                Password = "NewUpdatedPassword888"
            };

            // Act
            var result = await controller.Update(77, updatedModel, null);

            // Assert
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AccountController.AccountList), redirectResult.ActionName);

            var accountInDb = await context.Accounts.FirstAsync(a => a.Id == 77);
            Assert.Equal("NewUpdatedPassword888", accountInDb.Password);
        }

        [Fact]
        public async Task StoriesController_Create_Should_Reject_When_ContentMode_Missing_Or_Invalid()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(StoriesController_Create_Should_Reject_When_ContentMode_Missing_Or_Invalid));
            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            var story = new Story { Title = "قصة بدون نمط" };

            // Act 1: empty contentMode
            var resultEmpty = await controller.Create(story, "", null, null, null);
            var viewResult = Assert.IsType<ViewResult>(resultEmpty);
            Assert.False(controller.ModelState.IsValid);
            Assert.True(controller.ModelState.ContainsKey("ContentMode"));

            // Act 2: editor mode with 0 pages
            controller.ModelState.Clear();
            var resultNoPages = await controller.Create(story, "editor", null, null, null);
            var viewResult2 = Assert.IsType<ViewResult>(resultNoPages);
            Assert.False(controller.ModelState.IsValid);
            Assert.True(controller.ModelState.ContainsKey("Pages"));
        }

        [Fact]
        public async Task StoriesController_Delete_And_DeleteConfirmed_Should_Remove_Story()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(StoriesController_Delete_And_DeleteConfirmed_Should_Remove_Story));
            context.Stories.Add(new Story { Id = 88, Title = "قصة للحذف", Price = 20m, Category = "التعاون" });
            await context.SaveChangesAsync();

            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            // 1. GET Delete
            var getDelete = await controller.Delete(88);
            var viewResult = Assert.IsType<ViewResult>(getDelete);
            var storyModel = Assert.IsType<Story>(viewResult.Model);
            Assert.Equal(88, storyModel.Id);

            // 2. POST DeleteConfirmed
            var postDelete = await controller.DeleteConfirmed(88);
            var redirectResult = Assert.IsType<RedirectToActionResult>(postDelete);
            Assert.Equal(nameof(StoriesController.Index), redirectResult.ActionName);

            var inDb = await context.Stories.FirstOrDefaultAsync(s => s.Id == 88);
            Assert.Null(inDb);
        }

        [Fact]
        public async Task AdminAuthController_Profile_Should_Prevent_Regular_Admin_From_Changing_Email()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_Profile_Should_Prevent_Regular_Admin_From_Changing_Email));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 60,
                FullName = "مشرف منتظم",
                Email = "fixed@example.com",
                Password = "Pass",
                Role = "Admin",
                Status = "Approved"
            });
            await context.SaveChangesAsync();

            // Principal with Admin role (NOT SuperAdmin)
            var principal = new ClaimsPrincipal(new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, "60"),
                new Claim(ClaimTypes.Name, "مشرف منتظم"),
                new Claim(ClaimTypes.Email, "fixed@example.com"),
                new Claim(ClaimTypes.Role, "Admin")
            }, CookieAuthenticationDefaults.AuthenticationScheme));

            var controller = new AdminAuthController(context);
            SetupController(controller, principal);

            var model = new AdminProfileViewModel
            {
                Id = 60,
                FullName = "مشرف منتظم جديد",
                Email = "hacked_email@example.com",
                Password = "NewPass123"
            };

            // Act
            await controller.Profile(model);

            // Assert: Email in DB was NOT changed because user is not SuperAdmin
            var userInDb = await context.AdminUsers.FirstAsync(u => u.Id == 60);
            Assert.Equal("fixed@example.com", userInDb.Email);
            Assert.Equal("مشرف منتظم جديد", userInDb.FullName);
            Assert.Equal("NewPass123", userInDb.Password);
        }

        [Fact]
        public async Task StoriesController_Edit_Should_Reject_When_Editor_Mode_Has_Zero_Pages()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(StoriesController_Edit_Should_Reject_When_Editor_Mode_Has_Zero_Pages));
            context.Stories.Add(new Story
            {
                Id = 101,
                Title = "قصة للتعديل",
                Category = "الصدق",
                TargetAge = 6,
                Price = 25m,
                Pages = new List<StoryPageItem>
                {
                    new StoryPageItem { PageNum = 1, Content = "محتوى أصلي" }
                }
            });
            await context.SaveChangesAsync();

            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            var editStory = new Story
            {
                Id = 101,
                Title = "قصة للتعديل",
                Category = "الصدق",
                TargetAge = 6,
                Price = 25m,
                Pages = new List<StoryPageItem>() // Empty pages
            };

            // Act
            var result = await controller.Edit(101, editStory, "editor", null, null, null);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.False(controller.ModelState.IsValid);
            Assert.True(controller.ModelState.ContainsKey("Pages"));
        }

        [Fact]
        public async Task StoriesController_Create_And_Edit_Should_Reject_Page_With_Image_Exceeding_160_Chars()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(StoriesController_Create_And_Edit_Should_Reject_Page_With_Image_Exceeding_160_Chars));
            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            var invalidStory = new Story
            {
                Title = "قصة نصها طويل مع صورة",
                Category = "الشجاعة",
                TargetAge = 7,
                Price = 30m,
                Pages = new List<StoryPageItem>
                {
                    new StoryPageItem
                    {
                        PageNum = 1,
                        IllustrationUrl = "https://example.com/illustration.png",
                        // 170 characters (> 160 safe limit)
                        Content = new string('أ', 170)
                    }
                }
            };

            // Act
            var result = await controller.Create(invalidStory, "editor", null, null, null);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            Assert.False(controller.ModelState.IsValid);
            Assert.True(controller.ModelState.ContainsKey("Pages[0].Content"));
        }

        [Fact]
        public async Task AdminAuthController_UpdateAdminPassword_Should_Reject_Short_Password()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminAuthController_UpdateAdminPassword_Should_Reject_Short_Password));
            context.AdminUsers.Add(new AdminUser
            {
                Id = 88,
                FullName = "مشرف كلمة مرور قصيرة",
                Email = "short@example.com",
                Password = "ExistingPassword123",
                Role = "Admin",
                Status = "Approved"
            });
            await context.SaveChangesAsync();

            var controller = new AdminAuthController(context);
            SetupController(controller);

            // Act: try setting password shorter than 6 chars
            var result = await controller.UpdateAdminPassword(88, "12345");

            // Assert: Redirects to TeamRequests with ErrorMessage, password NOT changed in DB
            var redirectResult = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminAuthController.TeamRequests), redirectResult.ActionName);
            Assert.NotNull(controller.TempData["ErrorMessage"]);

            var userInDb = await context.AdminUsers.FirstAsync(u => u.Id == 88);
            Assert.Equal("ExistingPassword123", userInDb.Password);
        }

        [Fact]
        public async Task StoriesController_RateStory_Should_Add_Rating_And_Calculate_Average()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(StoriesController_RateStory_Should_Add_Rating_And_Calculate_Average));
            context.Stories.Add(new Story
            {
                Id = 50,
                Title = "قصة تقييم",
                Category = "الصدق",
                Price = 20m,
                Pages = new List<StoryPageItem> { new() { PageNum = 1, Content = "صفحة" } }
            });
            context.Accounts.Add(new SuperKayyem.Models.Account
            {
                Id = 10,
                FirstName = "أحمد",
                LastName = "محمود",
                Email = "ahmed@example.com",
                Password = "hashedpassword",
                Gender = "ذكر",
                OwnedStoryIds = new List<int>()
            });
            await context.SaveChangesAsync();

            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            // Act 1: Initial rating of 5 stars
            var result1 = await controller.RateStory(50, new RateStoryDto { AccountId = 10, Rating = 5 });
            var okResult1 = Assert.IsType<OkObjectResult>(result1);
            using (var doc1 = System.Text.Json.JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(okResult1.Value)))
            {
                Assert.Equal(5.0, doc1.RootElement.GetProperty("rating").GetDouble());
                Assert.Equal(1, doc1.RootElement.GetProperty("ratingsCount").GetInt32());
            }

            // Verify account now owns story
            var account = await context.Accounts.FirstAsync(a => a.Id == 10);
            Assert.Contains(50, account.OwnedStoryIds!);

            // Act 2: Update existing rating to 4 stars
            var result2 = await controller.RateStory(50, new RateStoryDto { AccountId = 10, Score = 4 });
            var okResult2 = Assert.IsType<OkObjectResult>(result2);
            using (var doc2 = System.Text.Json.JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(okResult2.Value)))
            {
                Assert.Equal(4.0, doc2.RootElement.GetProperty("rating").GetDouble());
                Assert.Equal(1, doc2.RootElement.GetProperty("ratingsCount").GetInt32());
            }

            // Act 3: Another account rates 2 stars
            var result3 = await controller.RateStory(50, new RateStoryDto { AccountId = 20, Score = 2 });
            var okResult3 = Assert.IsType<OkObjectResult>(result3);
            using (var doc3 = System.Text.Json.JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(okResult3.Value)))
            {
                Assert.Equal(3.0, doc3.RootElement.GetProperty("rating").GetDouble());
                Assert.Equal(2, doc3.RootElement.GetProperty("ratingsCount").GetInt32());
            }

            var storyInDb = await context.Stories.FirstAsync(s => s.Id == 50);
            Assert.Equal(3.0, storyInDb.Rating);
            Assert.Equal(2, storyInDb.Ratings.Count);
        }

        [Fact]
        public async Task StoriesController_RateStory_Should_Reject_Invalid_Scores()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(StoriesController_RateStory_Should_Reject_Invalid_Scores));
            context.Stories.Add(new Story { Id = 60, Title = "قصة فحص" });
            await context.SaveChangesAsync();

            var cloudinary = new CloudinaryDotNet.Cloudinary(new CloudinaryDotNet.Account("test", "test", "test"));
            var controller = new StoriesController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<StoriesController>>(), cloudinary);
            SetupController(controller);

            // Act & Assert: score 0
            var res0 = await controller.RateStory(60, new RateStoryDto { AccountId = 1, Rating = 0 });
            Assert.IsType<BadRequestObjectResult>(res0);

            // Act & Assert: score 6
            var res6 = await controller.RateStory(60, new RateStoryDto { AccountId = 1, Rating = 6 });
            Assert.IsType<BadRequestObjectResult>(res6);

            // Act & Assert: null DTO
            var resNull = await controller.RateStory(60, null);
            Assert.IsType<BadRequestObjectResult>(resNull);

            // Act & Assert: non-existent story
            var resMissing = await controller.RateStory(999, new RateStoryDto { AccountId = 1, Rating = 4 });
            Assert.IsType<NotFoundObjectResult>(resMissing);
        }

        [Fact]
        public async Task AdminController_Index_Should_Populate_Analytics_And_Sales()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_Index_Should_Populate_Analytics_And_Sales));
            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>());
            SetupController(controller);

            // Act
            var result = await controller.Index();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsType<AdminDashboardViewModel>(viewResult.Model);

            Assert.NotNull(model.Analytics);
            Assert.NotNull(model.Analytics.MonthlySalesChart);
            Assert.NotEmpty(model.Analytics.MonthlySalesChart.Labels);
            Assert.NotEmpty(model.Analytics.MonthlySalesChart.StoriesSoldCounts);
            Assert.True(model.Analytics.MonthlySalesChart.CurrentMonthTotalSalesCount > 0);
            Assert.True(model.Analytics.MonthlySalesChart.CurrentMonthTotalRevenue >= 0);

            Assert.NotNull(model.Analytics.CategoryPieChart);
            Assert.NotEmpty(model.Analytics.CategoryPieChart.Labels);
            Assert.NotEmpty(model.Analytics.CategoryPieChart.Counts);

            Assert.NotNull(model.Analytics.AgeGroupComparisonChart);
            Assert.NotEmpty(model.Analytics.AgeGroupComparisonChart.Labels);
            Assert.NotEmpty(model.Analytics.AgeGroupComparisonChart.StoryCounts);
            Assert.NotEmpty(model.Analytics.AgeGroupComparisonChart.ChildCounts);

            Assert.NotNull(model.Analytics.ChildrenInterestsChart);
            Assert.NotEmpty(model.Analytics.ChildrenInterestsChart.Labels);

            Assert.NotNull(model.StoryCurrentMonthSalesCount);
            Assert.NotEmpty(model.AllStories);
            Assert.NotEmpty(model.AllArticles);
        }

        [Fact]
        public async Task AdminController_AnalyticsData_Should_Return_Valid_Json()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_AnalyticsData_Should_Return_Valid_Json));
            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>());
            SetupController(controller);

            // Act
            var result = await controller.AnalyticsData();

            // Assert
            var jsonResult = Assert.IsType<JsonResult>(result);
            var dto = Assert.IsType<DashboardAnalyticsDto>(jsonResult.Value);

            Assert.NotNull(dto.MonthlySalesChart);
            Assert.NotEmpty(dto.MonthlySalesChart.Labels);
            Assert.True(dto.MonthlySalesChart.CurrentMonthTotalSalesCount > 0);

            Assert.NotNull(dto.CategoryPieChart);
            Assert.NotEmpty(dto.CategoryPieChart.Labels);

            Assert.NotNull(dto.AgeGroupComparisonChart);
            Assert.NotEmpty(dto.AgeGroupComparisonChart.Labels);

            Assert.NotNull(dto.ChildrenInterestsChart);
            Assert.NotEmpty(dto.ChildrenInterestsChart.Labels);

            Assert.False(string.IsNullOrWhiteSpace(dto.LastUpdatedFormatted));
        }

        [Fact]
        public async Task AdminController_Index_Should_Handle_Legacy_Accounts_Without_Interests_Or_PurchasedStories()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(AdminController_Index_Should_Handle_Legacy_Accounts_Without_Interests_Or_PurchasedStories));

            // Add legacy account representing MongoDB documents before Interests and PurchasedStories were added
            var legacyAccount = new Account
            {
                Id = 99,
                FirstName = "أحمد",
                LastName = "محمود",
                Email = "legacy@example.com",
                Password = "hash",
                Gender = "ذكر",
                PurchasedStories = null,
                Children = new List<Child>
                {
                    new Child { Id = 901, Name = "كريم", Age = 6, Gender = "ذكر", Interests = null }
                }
            };
            context.Accounts.Add(legacyAccount);
            context.Stories.Add(new Story { Id = 10, Title = "قصة تجريبية", TargetAge = 6, Price = 25m, Category = "الصدق" });
            await context.SaveChangesAsync();

            var controller = new AdminController(context, Mock.Of<Microsoft.Extensions.Logging.ILogger<AdminController>>());
            SetupController(controller);

            // Act: Should execute without throwing InvalidOperationException
            var result = await controller.Index();

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsType<AdminDashboardViewModel>(viewResult.Model);

            Assert.Equal(1, model.TotalAccounts);
            Assert.Equal(1, model.TotalChildren);
            Assert.NotNull(model.Analytics);
            Assert.NotNull(model.Analytics.ChildrenInterestsChart);
            Assert.NotNull(model.Analytics.MonthlySalesChart);
        }
    }
}
