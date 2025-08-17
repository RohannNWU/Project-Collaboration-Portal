using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using MongoDB.Bson.Serialization.Attributes;
using backend.Models;
using System;
using System.Threading.Tasks;
using MongoDB.Bson;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;

        public LoginController(IMongoDatabase database)
        {
            // Diagnostic: log the database and collection names
            Console.WriteLine("Database: " + database.DatabaseNamespace.DatabaseName);
            Console.WriteLine("Collection: User");

            _users = database.GetCollection<User>("User");
        }

        [HttpPost]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
                    return BadRequest(new { success = false, message = "Username and password are required" });

                // Build filter
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

    // Request model
    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    // User model
    public class User
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("username")]
        public string Username { get; set; }

        [BsonElement("password")]
        public string Password { get; set; }

        [BsonElement("role")]
        public string Role { get; set; }
    }
}
