# Super Kayyem — MongoDB & Auth Scaffolding Templates

This folder contains inactive (commented-out) scaffolding code for adding a MongoDB persistence layer and JWT-based authentication to the Super Kayyem backend.

The active application currently operates in **in-memory demo mode**, serving seed data without any external database dependencies so it runs and builds cleanly out-of-the-box.

---

## Contents

| File | Description |
|------|-------------|
| `IRepository.cs` | Generic asynchronous repository interface (`IRepository<T>`) |
| `MongoRepository.cs` | MongoDB generic repository implementation with CRUD operations |
| `MongoDbContext.cs` | Database context managing MongoDB client and collection accessors |
| `IAuthService.cs` | Authentication service contract (login, registration, tokens) |
| `AuthService.cs` | JWT generation, PBKDF2 password hashing, and authentication logic |

---

## How to Activate MongoDB

### Step 1: Install NuGet Packages
Uncomment the `MongoDB.Driver` package reference in `server/SuperKayyem.csproj` or run:
```bash
dotnet add package MongoDB.Driver
```

### Step 2: Configure Connection String in `appsettings.json`
Update the `MongoDb` section in `server/appsettings.json` (or `appsettings.Development.json`) with your MongoDB connection string:
```json
"MongoDb": {
  "ConnectionString": "mongodb://localhost:27017",
  "DatabaseName": "SuperKayyemDb"
}
```

### Step 3: Uncomment Code Files
1. In `MongoDbContext.cs`, uncomment the class definition.
2. In `IRepository.cs`, uncomment the interface definition.
3. In `MongoRepository.cs`, uncomment the generic repository implementation.

### Step 4: Register in Dependency Injection (`Program.cs`)
Add the following service registrations to `server/Program.cs`:
```csharp
using SuperKayyem.Templates;

// Register MongoDB Context
builder.Services.AddSingleton<MongoDbContext>();

// Register generic repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(MongoRepository<>));
```

---

## How to Activate JWT Authentication

### Step 1: Install NuGet Packages
Uncomment the JWT authentication package in `server/SuperKayyem.csproj` or run:
```bash
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

### Step 2: Configure JWT Settings in `appsettings.json`
Add JWT configuration to `server/appsettings.json`:
```json
"Jwt": {
  "Key": "YourStrongSecretKeyHere_AtLeast32BytesLong!",
  "Issuer": "SuperKayyem",
  "Audience": "SuperKayyemApp"
}
```

### Step 3: Uncomment Auth Files
1. In `IAuthService.cs`, uncomment the records and interface definition.
2. In `AuthService.cs`, uncomment the implementation.

### Step 4: Configure Authentication in `Program.cs`
Add the authentication scheme and middleware to `server/Program.cs`:
```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<IAuthService, AuthService>();

// In pipeline (between UseRouting and MapControllers):
app.UseAuthentication();
app.UseAuthorization();
```
