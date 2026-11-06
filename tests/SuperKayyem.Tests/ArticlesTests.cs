using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using SuperKayyem.Controllers;
using SuperKayyem.Data;
using SuperKayyem.Models;
using Xunit;

namespace SuperKayyem.Tests
{
    public class ArticlesTests
    {
        private SuperKayyemDbContext CreateInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<SuperKayyemDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;

            return new SuperKayyemDbContext(options);
        }

        private static ClaimsPrincipal CreateUserPrincipal(string name, string email, string role = "Admin")
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, name),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role)
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            return new ClaimsPrincipal(identity);
        }

        private static void SetupController(Controller controller, ClaimsPrincipal principal)
        {
            var httpContext = new DefaultHttpContext
            {
                User = principal
            };
            var tempData = new TempDataDictionary(httpContext, Mock.Of<ITempDataProvider>());
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
            controller.TempData = tempData;
        }

        // ==========================================
        // Public API Tests (ArticlesController)
        // ==========================================

        [Fact]
        public async Task GetAll_Should_AutoSeed_Four_Articles_When_Empty()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(GetAll_Should_AutoSeed_Four_Articles_When_Empty));
            var controller = new ArticlesController(context);

            // Act
            var result = await controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var articles = Assert.IsAssignableFrom<IEnumerable<Article>>(okResult.Value);
            Assert.Equal(4, articles.Count());

            // Verify ordered descending by PublishedAt
            var list = articles.ToList();
            Assert.True(list[0].PublishedAt >= list[1].PublishedAt);
        }

        [Fact]
        public async Task GetById_Should_Return_Article_When_Found()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(GetById_Should_Return_Article_When_Found));
            var controller = new ArticlesController(context);
            await controller.GetAll(); // seed data

            // Act
            var result = await controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var article = Assert.IsType<Article>(okResult.Value);
            Assert.Equal(1, article.Id);
            Assert.False(string.IsNullOrWhiteSpace(article.Title));
        }

        [Fact]
        public async Task GetById_Should_Return_NotFound_When_Not_Exists_Or_Invalid_Id()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(GetById_Should_Return_NotFound_When_Not_Exists_Or_Invalid_Id));
            var controller = new ArticlesController(context);

            // Act & Assert
            var resZero = await controller.GetById(0);
            Assert.IsType<NotFoundObjectResult>(resZero);

            var resNegative = await controller.GetById(-5);
            Assert.IsType<NotFoundObjectResult>(resNegative);

            var resNotFound = await controller.GetById(9999);
            Assert.IsType<NotFoundObjectResult>(resNotFound);
        }

        // ==========================================
        // Admin MVC Tests (AdminArticlesController)
        // ==========================================

        [Fact]
        public async Task Admin_Create_Should_Populate_Claims_And_Increment_Id()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Admin_Create_Should_Populate_Claims_And_Increment_Id));
            var loggerMock = new Mock<ILogger<AdminArticlesController>>();
            var controller = new AdminArticlesController(context, loggerMock.Object);
            SetupController(controller, CreateUserPrincipal("سارة أحمد", "sara@superkayyem.com", "Admin"));

            var newArticle = new Article
            {
                Title = "مقال جديد حول الانضباط الإيجابي",
                Category = "التربية الإيجابية",
                Introduction = "<p>مقدمة المقال</p>",
                BodyContent = "<p>موضوع المقال</p>",
                Conclusion = "<p>خاتمة المقال</p>"
            };

            // Act
            var result = await controller.Create(newArticle, null);

            // Assert
            var redirect = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminArticlesController.Index), redirect.ActionName);

            // 4 seed articles + 1 new = 5 total
            Assert.Equal(5, await context.Articles.CountAsync());

            var saved = await context.Articles.FirstOrDefaultAsync(a => a.Title == newArticle.Title);
            Assert.NotNull(saved);
            Assert.Equal(5, saved.Id);
            Assert.Equal("سارة أحمد", saved.AuthorName);
            Assert.Equal("sara@superkayyem.com", saved.AuthorEmail);
            Assert.False(string.IsNullOrWhiteSpace(saved.ImageUrl));
        }

        [Fact]
        public async Task Admin_Edit_GET_Should_Allow_Owner_Admin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Admin_Edit_GET_Should_Allow_Owner_Admin));
            context.Articles.Add(new Article
            {
                Id = 10,
                Title = "مقال سارة",
                AuthorName = "سارة أحمد",
                AuthorEmail = "sara@superkayyem.com",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conclusion"
            });
            await context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<AdminArticlesController>>();
            var controller = new AdminArticlesController(context, loggerMock.Object);
            SetupController(controller, CreateUserPrincipal("سارة أحمد", "sara@superkayyem.com", "Admin"));

            // Act
            var result = await controller.Edit(10);

            // Assert
            var viewResult = Assert.IsType<ViewResult>(result);
            var model = Assert.IsType<Article>(viewResult.Model);
            Assert.Equal(10, model.Id);
        }

        [Fact]
        public async Task Admin_Edit_GET_Should_Reject_Non_Owner_Admin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Admin_Edit_GET_Should_Reject_Non_Owner_Admin));
            context.Articles.Add(new Article
            {
                Id = 11,
                Title = "مقال كاتب آخر",
                AuthorName = "أحمد علي",
                AuthorEmail = "ahmed@superkayyem.com",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conclusion"
            });
            await context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<AdminArticlesController>>();
            var controller = new AdminArticlesController(context, loggerMock.Object);
            // Logged in as sara
            SetupController(controller, CreateUserPrincipal("سارة أحمد", "sara@superkayyem.com", "Admin"));

            // Act
            var result = await controller.Edit(11);

            // Assert
            var redirect = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminArticlesController.Index), redirect.ActionName);
            Assert.True(controller.TempData.ContainsKey("ErrorMessage"));
        }

        [Fact]
        public async Task SuperAdmin_Can_Edit_Any_Article()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(SuperAdmin_Can_Edit_Any_Article));
            context.Articles.Add(new Article
            {
                Id = 12,
                Title = "مقال أصلي",
                AuthorName = "أحمد علي",
                AuthorEmail = "ahmed@superkayyem.com",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conclusion"
            });
            await context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<AdminArticlesController>>();
            var controller = new AdminArticlesController(context, loggerMock.Object);
            // Logged in as SuperAdmin
            SetupController(controller, CreateUserPrincipal(AdminUserSeedData.SuperAdminDisplayName, AdminUserSeedData.SuperAdminEmail, "SuperAdmin"));

            var updated = new Article
            {
                Title = "مقال محدث بواسطة السوبر أدمن",
                Category = "تعديل السلوك",
                Introduction = "new intro",
                BodyContent = "new body",
                Conclusion = "new conclusion"
            };

            // Act
            var result = await controller.Edit(12, updated, null);

            // Assert
            var redirect = Assert.IsType<RedirectToActionResult>(result);
            Assert.Equal(nameof(AdminArticlesController.Index), redirect.ActionName);

            var inDb = await context.Articles.FindAsync(12);
            Assert.NotNull(inDb);
            Assert.Equal("مقال محدث بواسطة السوبر أدمن", inDb.Title);
            Assert.Equal("تعديل السلوك", inDb.Category);
        }

        [Fact]
        public async Task Admin_Delete_Should_Reject_Non_Owner_And_Allow_Owner()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Admin_Delete_Should_Reject_Non_Owner_And_Allow_Owner));
            context.Articles.Add(new Article
            {
                Id = 15,
                Title = "مقال للحذف",
                AuthorName = "محمود",
                AuthorEmail = "mahmoud@superkayyem.com",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conclusion"
            });
            await context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<AdminArticlesController>>();

            // 1. Non-owner tries to delete
            var nonOwnerController = new AdminArticlesController(context, loggerMock.Object);
            SetupController(nonOwnerController, CreateUserPrincipal("سارة", "sara@superkayyem.com", "Admin"));
            var rejectResult = await nonOwnerController.Delete(15);

            var redirectReject = Assert.IsType<RedirectToActionResult>(rejectResult);
            Assert.Equal(nameof(AdminArticlesController.Index), redirectReject.ActionName);
            Assert.NotNull(await context.Articles.FindAsync(15)); // Still in DB

            // 2. Owner deletes
            var ownerController = new AdminArticlesController(context, loggerMock.Object);
            SetupController(ownerController, CreateUserPrincipal("محمود", "mahmoud@superkayyem.com", "Admin"));
            var allowResult = await ownerController.Delete(15);

            var redirectAllow = Assert.IsType<RedirectToActionResult>(allowResult);
            Assert.Equal(nameof(AdminArticlesController.Index), redirectAllow.ActionName);
            Assert.Null(await context.Articles.FindAsync(15)); // Successfully deleted
        }

        [Fact]
        public async Task Admin_Should_Be_Rejected_If_Email_Does_Not_Match_Even_If_Name_Matches()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Admin_Should_Be_Rejected_If_Email_Does_Not_Match_Even_If_Name_Matches));
            context.Articles.Add(new Article
            {
                Id = 20,
                Title = "مقال المشرف الأول",
                AuthorName = "مشرف سوبر قيم",
                AuthorEmail = "admin1@superkayyem.com",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conclusion"
            });
            await context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<AdminArticlesController>>();
            var controller = new AdminArticlesController(context, loggerMock.Object);

            // Admin 2 has the exact same name "مشرف سوبر قيم", but a DIFFERENT email "admin2@superkayyem.com"
            SetupController(controller, CreateUserPrincipal("مشرف سوبر قيم", "admin2@superkayyem.com", "Admin"));

            // Act 1: GET Edit
            var getEditResult = await controller.Edit(20);
            var redirectGet = Assert.IsType<RedirectToActionResult>(getEditResult);
            Assert.Equal(nameof(AdminArticlesController.Index), redirectGet.ActionName);
            Assert.True(controller.TempData.ContainsKey("ErrorMessage"));

            // Act 2: POST Edit
            var postEditResult = await controller.Edit(20, new Article { Title = "تعديل غير مصرح" }, null);
            Assert.IsType<ForbidResult>(postEditResult);

            // Act 3: POST Delete
            var deleteResult = await controller.Delete(20);
            var redirectDelete = Assert.IsType<RedirectToActionResult>(deleteResult);
            Assert.Equal(nameof(AdminArticlesController.Index), redirectDelete.ActionName);
            Assert.NotNull(await context.Articles.FindAsync(20)); // Article not deleted
        }

        [Fact]
        public async Task Admin_Edit_POST_Should_Reject_Non_Owner_Admin()
        {
            // Arrange
            using var context = CreateInMemoryContext(nameof(Admin_Edit_POST_Should_Reject_Non_Owner_Admin));
            context.Articles.Add(new Article
            {
                Id = 21,
                Title = "مقال أصلي",
                AuthorName = "سارة أحمد",
                AuthorEmail = "sara@superkayyem.com",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conclusion"
            });
            await context.SaveChangesAsync();

            var loggerMock = new Mock<ILogger<AdminArticlesController>>();
            var controller = new AdminArticlesController(context, loggerMock.Object);
            SetupController(controller, CreateUserPrincipal("أحمد علي", "ahmed@superkayyem.com", "Admin"));

            var updated = new Article
            {
                Title = "محاولة تعديل بدون إذن",
                Introduction = "intro",
                BodyContent = "body",
                Conclusion = "conclusion"
            };

            // Act
            var result = await controller.Edit(21, updated, null);

            // Assert
            Assert.IsType<ForbidResult>(result);
            var inDb = await context.Articles.FindAsync(21);
            Assert.Equal("مقال أصلي", inDb!.Title);
        }
    }
}
