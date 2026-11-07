using System.Security.Claims;
using System.Text.Json;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Models;

var builder = WebApplication.CreateBuilder(args);

// Add MVC Controllers and Views with camelCase JSON serialization
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Register Cloudinary as a singleton via DI
var cloudinaryAccount = new CloudinaryDotNet.Account(
    builder.Configuration["Cloudinary:CloudName"],
    builder.Configuration["Cloudinary:ApiKey"],
    builder.Configuration["Cloudinary:ApiSecret"]);
builder.Services.AddSingleton(new Cloudinary(cloudinaryAccount));

// Bind MongoDBSettings from configuration
var mongoSettings = builder.Configuration.GetSection("MongoDBSettings").Get<MongoDBSettings>();
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDBSettings"));

// Register SuperKayyemDbContext using MongoDB EF Core provider
builder.Services.AddDbContext<SuperKayyemDbContext>(options =>
    options.UseMongoDB(
        mongoSettings?.AtlasURI ?? "",
        mongoSettings?.DatabaseName ?? "SuperKayyemDb"));

// Cookie Authentication for Admin Panel
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = "AdminCookie";
    options.DefaultAuthenticateScheme = "AdminCookie";
    options.DefaultChallengeScheme = "AdminCookie";
    options.DefaultSignInScheme = "AdminCookie";
    options.DefaultSignOutScheme = "AdminCookie";
})
.AddCookie("AdminCookie", options =>
{
    options.Cookie.Name = "SuperKayyem.AdminAuth";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Lax;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
    options.LoginPath = "/AdminAuth/Login";
    options.AccessDeniedPath = "/AdminAuth/AccessDenied";
    options.ExpireTimeSpan = TimeSpan.FromHours(12);
    options.SlidingExpiration = true;
    options.Events = new CookieAuthenticationEvents
    {
        OnValidatePrincipal = async context =>
        {
            try
            {
                var userIdStr = context.Principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var email = context.Principal?.FindFirst(ClaimTypes.Email)?.Value;

                if (!int.TryParse(userIdStr, out int userId) && string.IsNullOrEmpty(email))
                {
                    if (context.Principal?.IsInRole("SuperAdmin") == true)
                    {
                        return;
                    }

                    context.RejectPrincipal();
                    await context.HttpContext.SignOutAsync("AdminCookie");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<SuperKayyemDbContext>();
                var user = await db.AdminUsers.AsNoTracking()
                    .FirstOrDefaultAsync(u => (userId > 0 && u.Id == userId) || 
                                              (!string.IsNullOrEmpty(email) && u.Email != null && u.Email.ToLower() == email.ToLower()));

                // If user was explicitly found and is revoked, rejected, or pending, reject the cookie
                if (user != null && user.Status != "Approved")
                {
                    context.RejectPrincipal();
                    await context.HttpContext.SignOutAsync("AdminCookie");
                }
            }
            catch
            {
                // Never reject on transient DB lookup errors
            }
        }
    };
});

builder.Services.AddAuthorization();

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173",
                  "http://localhost:3000",
                  "http://localhost:5080"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Admin/Error");
    app.UseHsts();
}

app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=AdminAuth}/{action=Login}/{id?}");

app.Run();
