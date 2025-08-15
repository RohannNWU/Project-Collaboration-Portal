using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] User model, [FromServices] MongoDbService mongoService)
    {
        var user = mongoService.GetUser(model.Username, model.Password);

        if (user == null)
        {
            return Unauthorized(new { Message = "Invalid username or password" });
        }

        return Ok(new { Message = "Login successful" });
    }
}