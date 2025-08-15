using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProtectedController : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public IActionResult GetProtectedData()
        {
            var username = User.Claims.FirstOrDefault(c => c.Type == "username")?.Value ?? "User";
            return Ok(new { username, message = "This is a protected endpoint!" });
        }
    }
}
