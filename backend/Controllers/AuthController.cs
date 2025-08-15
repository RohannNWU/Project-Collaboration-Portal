using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public IActionResult Login([FromBody] UserLoginRequest request)
        {
            // Very simple demo logic (replace with DB check)
            if(request.Username == "admin" && request.Password == "password")
            {
                var token = "your-jwt-token"; // Replace with real JWT generation
                return Ok(new { token });
            }
            return Unauthorized(new { message = "Invalid credentials" });
        }
    }

    public class UserLoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
