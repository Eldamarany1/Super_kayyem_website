using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SuperKayyem.Models;

var builder = WebApplication.CreateBuilder(args);

// Add MVC Controllers and Views with camelCase JSON serialization
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Bind MongoDBSettings from configuration
var mongoSettings = builder.Configuration.GetSection("MongoDBSettings").Get<MongoDBSettings>();
builder.Services.Configure<MongoDBSettings>(builder.Configuration.GetSection("MongoDBSettings"));

// Register SuperKayyemDbContext using MongoDB EF Core provider
builder.Services.AddDbContext<SuperKayyemDbContext>(options =>
    options.UseMongoDB(
        mongoSettings?.AtlasURI ?? "",
        mongoSettings?.DatabaseName ?? "SuperKayyemDb"));

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

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Admin}/{action=Index}/{id?}");

app.MapControllers();

app.Run();
