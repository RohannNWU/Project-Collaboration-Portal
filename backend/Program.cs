using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;


var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();

// CORS: allow your React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("https://wonderful-rock-091893c03.1.azurestaticapps.net")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// JWT Authentication
var key = Encoding.UTF8.GetBytes("YourSuperSecretKey123!"); // replace with a strong secret
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false, // set true if you have a domain
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key)
    };
});

var app = builder.Build();

// Middleware
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Simple login endpoint
app.MapPost("/api/auth/login", (UserLoginRequest request) =>
{
    // Demo user validation - replace with DB check
    if (request.Username == "admin" && request.Password == "password")
    {
        // generate JWT
        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new System.Security.Claims.ClaimsIdentity(new[]
            {
                new System.Security.Claims.Claim("username", request.Username)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        var jwt = tokenHandler.WriteToken(token);

        return Results.Ok(new { token = jwt });
    }
    return Results.Unauthorized();
});

app.MapGet("/api/protected", [Microsoft.AspNetCore.Authorization.Authorize] (System.Security.Claims.ClaimsPrincipal user) =>
{
    var username = user.Identity?.Name ?? "User";
    return Results.Ok(new { username });
});

app.Run();

// DTO for login request
public record UserLoginRequest(string Username, string Password);
