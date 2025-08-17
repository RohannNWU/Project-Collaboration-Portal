using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using backend.Models;
using System;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;

        public LoginController(IMongoDatabase database)
        {
            _users = database.GetCollection<User>("User");
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                    return BadRequest(new { success = false, message = "Username and password are required" });

                var filter = Builders<User>.Filter.Eq(u => u.Username, request.Username) &
                             Builders<User>.Filter.Eq(u => u.Password, request.Password);

                var user = await _users.Find(filter).FirstOrDefaultAsync();

                if (user != null)
                    return Ok(new { success = true, username = user.Username, role = user.Role });

                return Unauthorized(new { success = false, message = "Invalid username or password" });
            }
            catch (Exception ex)
            {
                // Always return JSON even if MongoDB connection fails
                return StatusCode(500, new { success = false, message = "Server error: " + ex.Message });
            }
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
