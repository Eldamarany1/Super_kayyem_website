using System.Text.Json;
using SuperKayyem.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers with camelCase JSON property naming
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// Configure CORS for frontend clients (Vite dev server, local preview)
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

// Register Application Services
builder.Services.AddSingleton<IStoryService, StoryService>();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseStaticFiles();

app.UseRouting();

app.UseCors("AllowFrontend");

app.MapControllers();

app.Run();
