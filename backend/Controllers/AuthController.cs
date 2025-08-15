using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ProjectCollaborationPortal.DTOs;
using ProjectCollaborationPortal.Models;
using ProjectCollaborationPortal.Services;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ProjectCollaborationPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbService _mongo;
        private readonly IConfiguration _config;

        public AuthController(MongoDbService mongo, IConfiguration config)
        {
            _mongo = mongo;
            _config = config;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (req == null || string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { Message = "Username and password are required." });

            // 1) Pull the user from MongoDB by username
            var user = await _mongo.GetByUsernameAsync(req.Username);
            if (user == null)
                return Unauthorized(new { Message = "Invalid username or password" });

            // 2) Compare password
            // Plain-text version (matches your current DB):
            if (user.Password != req.Password)
                return Unauthorized(new { Message = "Invalid username or password" });

            // (Hashed version shown later below)
            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.Password))
                return Unauthorized(new { Message = "Invalid username or password" });

            // 3) Issue JWT
            var token = GenerateJwt(user, out DateTime expiresUtc);

            var response = new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role,
                ExpiresAtUtc = expiresUtc
            };

            return Ok(response);
        }

        // Example protected endpoint to test the token
        [Authorize]
        [HttpGet("me")]
        public IActionResult Me()
        {
            var username = User.FindFirstValue(JwtRegisteredClaimNames.UniqueName) 
                           ?? User.Identity?.Name;
            var role = User.FindFirstValue(ClaimTypes.Role) ?? "user";
            return Ok(new { Username = username, Role = role });
        }

        private string GenerateJwt(User user, out DateTime expiresUtc)
        {
            var jwt = _config.GetSection("Jwt");
            var keyBytes = Encoding.UTF8.GetBytes(jwt["Key"]);
            var creds = new SigningCredentials(new SymmetricSecurityKey(keyBytes), SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username ?? string.Empty),
                new Claim(ClaimTypes.Role, user.Role ?? "user")
            };

            var hours = int.TryParse(jwt["ExpiresHours"], out var h) ? h : 8;
            var token = new JwtSecurityToken(
                issuer: jwt["Issuer"],
                audience: jwt["Audience"],
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddHours(hours),
                signingCredentials: creds
            );

            expiresUtc = token.ValidTo;
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
