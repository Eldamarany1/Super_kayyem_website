using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using Serilog;
using SuperKayyem.API.Middleware;
using SuperKayyem.Infrastructure;

// ── Bootstrap Serilog early so startup errors are captured ─────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

Log.Information("Starting SuperKayyem API...");

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ─────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((context, services, config) =>
        config.ReadFrom.Configuration(context.Configuration)
              .ReadFrom.Services(services)
              .Enrich.FromLogContext()
              .WriteTo.Console()
              .WriteTo.File("logs/superkayyem-.log", rollingInterval: RollingInterval.Day));

    // ── Infrastructure (MongoDB, all application services) ───────────────────
    builder.Services.AddInfrastructure(builder.Configuration);

    // ── JWT Authentication ────────────────────────────────────────────────────
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var secretKey = jwtSettings["SecretKey"];

    // Fail fast with a clear message rather than a cryptic BCL exception
    if (string.IsNullOrWhiteSpace(secretKey) || secretKey.Length < 32)
        throw new InvalidOperationException(
            "JWT SecretKey is missing or too short (< 32 chars). " +
            "Set it in appsettings.json or as the ASPNETCORE_JWT__SECRETKEY environment variable.");

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ClockSkew = TimeSpan.Zero
        };

        // Return 401 JSON instead of a redirect to /Account/Login
        options.Events = new JwtBearerEvents
        {
            OnChallenge = ctx =>
            {
                ctx.HandleResponse();
                ctx.Response.StatusCode = 401;
                ctx.Response.ContentType = "application/json";
                return ctx.Response.WriteAsync(
                    "{\"success\":false,\"message\":\"Unauthorized. Please provide a valid token.\"}");
            },
            OnForbidden = ctx =>
            {
                ctx.Response.StatusCode = 403;
                ctx.Response.ContentType = "application/json";
                return ctx.Response.WriteAsync(
                    "{\"success\":false,\"message\":\"Forbidden. You do not have permission.\"}");
            }
        };
    });

    builder.Services.AddAuthorization();

    // ── CORS ─────────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
            policy.WithOrigins(
                    builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                    ?? ["http://localhost:5173", "http://localhost:3000"])
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials());
    });

    // ── Controllers ──────────────────────────────────────────────────────────
    builder.Services.AddControllers()
        .AddJsonOptions(opt =>
        {
            opt.JsonSerializerOptions.Converters.Add(
                new System.Text.Json.Serialization.JsonStringEnumConverter());
        });

    // ── OpenAPI (built-in .NET 10) ───────────────────────────────────────────
    builder.Services.AddOpenApi();

    // ── Build ─────────────────────────────────────────────────────────────────
    var app = builder.Build();

    // ── Middleware Pipeline ───────────────────────────────────────────────────
    app.UseMiddleware<GlobalExceptionMiddleware>();
    app.UseSerilogRequestLogging();

    // Expose OpenAPI in all environments; restrict in production if needed via env var
    app.MapOpenApi(); // Serves /openapi/v1.json

    app.UseHttpsRedirection();
    app.UseCors("AllowFrontend");

    // Serve files from the /uploads directory (cover images, content PDFs, etc.)
    // Ensure the directory exists — PhysicalFileProvider throws if it's missing.
    var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads");
    Directory.CreateDirectory(uploadsPath);
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
        RequestPath = "/uploads"
    });
    app.UseAuthentication();
    app.UseAuthorization();

    // ── Health Check — root endpoint ─────────────────────────────────────────
    app.MapGet("/", () => Results.Ok(new
    {
        status = "API is running",
        version = "1.0",
        timestamp = DateTime.UtcNow,
        docs = "/openapi/v1.json"
    })).WithTags("Health").AllowAnonymous();

    app.MapControllers();

    // ── Database Seeding ─────────────────────────────────────────────────────
    // Automatically create a default Admin account if no admins exist
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<SuperKayyem.Infrastructure.Persistence.MongoDbContext>();
        var adminExists = db.Users.Find(u => u.Role == SuperKayyem.Domain.Enums.UserRole.Admin).Any();
        
        if (!adminExists)
        {
            Log.Information("No Admin account found. Seeding default Admin...");
            var defaultAdmin = SuperKayyem.Domain.Entities.User.Create(
                "System Admin", 
                "admin@superkayyem.com", 
                BCrypt.Net.BCrypt.HashPassword("Admin@123"), 
                null, 
                SuperKayyem.Domain.Enums.UserRole.Admin
            );
            db.Users.InsertOne(defaultAdmin);
            Log.Information("Default Admin created. Email: admin@superkayyem.com | Password: Admin@123");
        }
    }

    Log.Information("SuperKayyem API ready. Health: http://localhost:5080/ | OpenAPI: http://localhost:5080/openapi/v1.json");
    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "SuperKayyem API failed to start.");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
