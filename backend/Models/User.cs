using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ProjectCollaborationPortal.Models
{
    public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }

    // Your MongoDB fields are lowercase: username, password, role
    [BsonElement("username")]
    public string Username { get; set; }

    [BsonElement("password")]
    public string Password { get; set; }

    [BsonElement("role")]
    public string Role { get; set; }
}
}
