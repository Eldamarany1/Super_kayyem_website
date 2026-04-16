using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
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

    // ── Infrastructure (MongoDB, JWT, all services) ──────────────────────────
    builder.Services.AddInfrastructure(builder.Configuration);

    // ── JWT Authentication ────────────────────────────────────────────────────
    var jwtSettings = builder.Configuration.GetSection("Jwt");
    var secretKey = jwtSettings["SecretKey"]!;

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

    if (app.Environment.IsDevelopment())
    {
        // Exposes /openapi/v1.json — can be used with Scalar, Swagger UI, etc.
        app.MapOpenApi();
    }

    app.UseHttpsRedirection();
    app.UseCors("AllowFrontend");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    Log.Information("SuperKayyem API ready. OpenAPI doc: http://localhost:5000/openapi/v1.json");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "SuperKayyem API failed to start.");
}
finally
{
    Log.CloseAndFlush();
}
