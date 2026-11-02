using System;
using System.IO;
using GradPath.Api.Domain;
using GradPath.Api.Infrastructure;
using GradPath.Api.Services;
using GradPath.Api.Strategies;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;

// 1. Mandatory Serilog Configuration (Section 4)
Directory.CreateDirectory("logs");
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Module", "GradPath-Discovery-Matching")
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File("logs/gradpath-log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

try
{
    Log.Information("Starting GradPath Web API host...");

    var builder = WebApplication.CreateBuilder(args);
    builder.Host.UseSerilog();

    // 2. Database & Identity Configuration
    var dbPath = Path.Combine(AppContext.BaseDirectory, "gradpath.db");
    builder.Services.AddDbContext<GradPathDbContext>(options =>
        options.UseSqlite($"Data Source={dbPath}"));

    builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
    {
        options.Password.RequireDigit = false;
        options.Password.RequiredLength = 6;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
    })
    .AddEntityFrameworkStores<GradPathDbContext>()
    .AddDefaultTokenProviders();

    builder.Services.ConfigureApplicationCookie(options =>
    {
        options.Cookie.Name = "GradPath.Auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
        options.Events.OnRedirectToLogin = context =>
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return System.Threading.Tasks.Task.CompletedTask;
        };
    });

    // 3. CORS Configuration for React SPA (Vite)
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowViteFrontend", policy =>
        {
            policy.SetIsOriginAllowed(origin => true) // Localhost Vite ports (5173, 5174, etc.)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    // 4. Register Mandatory Design Patterns & Domain Services
    // Core use case: eligibility, research-fit ranking, and lead approval.
    builder.Services.AddScoped<IMatchScoringStrategy, WeightedResearchFitStrategy>();
    builder.Services.AddScoped<IEligibilityEngine, EligibilityEngine>();
    builder.Services.AddScoped<IMatchingService, MatchingService>();
    builder.Services.AddScoped<ILeadApprovalService, LeadApprovalService>();

    builder.Services.AddControllers()
        .AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        });
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();

    var app = builder.Build();

    // 5. Database Auto-Migration & Seed Initialization
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        var db = services.GetRequiredService<GradPathDbContext>();
        var userMgr = services.GetRequiredService<UserManager<IdentityUser>>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        await SeedDataInitializer.InitializeAsync(db, userMgr, logger);
    }

    // 6. HTTP Pipeline
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseCors("AllowViteFrontend");
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
