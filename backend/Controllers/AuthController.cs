using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly MongoDbService _mongoService;

        // Inject MongoDbService via constructor
        public AuthController(MongoDbService mongoService)
        {
            _mongoService = mongoService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] User model)
        {
            // Look up the user in MongoDB
            var user = _mongoService.GetUser(model.Username, model.Password);

            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid username or password" });
            }

            return Ok(new { Message = "Login successful" });
        }
    }
}
