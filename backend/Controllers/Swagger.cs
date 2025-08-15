using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class Swagger : ControllerBase
    {
        /// <summary>
        /// Get all items
        /// </summary>
        /// <returns>A list of items</returns>
        /// <response code="200">Returns the list of items</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<IEnumerable<string>> Get()
        {
            return Ok(new[] { "value1", "value2" });
        }

        /// <summary>
        /// Get a specific item by ID
        /// </summary>
        /// <param name="id">The item ID</param>
        /// <returns>The requested item</returns>
        /// <response code="200">Returns the item</response>
        /// <response code="404">If the item is not found</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult<string> Get(int id)
        {
            if (id <= 0)
                return NotFound();
                
            return Ok($"value{id}");
        }
    }
}