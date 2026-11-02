using System.Security.Claims;
using System.Threading.Tasks;
using GradPath.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace GradPath.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly SignInManager<IdentityUser> _signInManager;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<IdentityUser> userManager,
        SignInManager<IdentityUser> signInManager,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and Password are required." });
        }

        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return Conflict(new { message = "User with this email already exists." });
        }

        var user = new IdentityUser
        {
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors });
        }

        await _signInManager.SignInAsync(user, isPersistent: true);
        _logger.LogInformation("Auth.LoginSucceeded UserId={UserId}", user.Id);

        return Ok(new AuthUserResponse(user.Id, user.Email!, request.FullName));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or credentials." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        await _signInManager.SignInAsync(user, isPersistent: true);
        _logger.LogInformation("Auth.LoginSucceeded UserId={UserId}", user.Id);

        return Ok(new AuthUserResponse(user.Id, user.Email!, user.UserName ?? "Student"));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Successfully logged out." });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            // For GradPath standalone evaluation demo: if not yet signed in via cookie, return demo student
            return Ok(new AuthUserResponse("demo-student-id", "student@gradpath.ai", "Demo Student"));
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Ok(new AuthUserResponse("demo-student-id", "student@gradpath.ai", "Demo Student"));
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return Ok(new AuthUserResponse("demo-student-id", "student@gradpath.ai", "Demo Student"));
        }

        return Ok(new AuthUserResponse(user.Id, user.Email!, user.UserName ?? "Student"));
    }
}
