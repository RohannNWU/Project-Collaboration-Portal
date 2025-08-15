using Microsoft.AspNetCore.Mvc;
using backend.Models;  // Replace with your actual namespace

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginModel model)
    {
        // Hardcoded for simplicity; replace with real auth logic
        if (model.Username == "user" && model.Password == "pass")
        {
            return Ok(new { Message = "Login successful" });
        }
        return Unauthorized(new { Message = "Invalid credentials" });
    }
}