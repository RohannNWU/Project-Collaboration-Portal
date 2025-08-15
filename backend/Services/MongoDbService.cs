using MongoDB.Driver;

public class MongoDbService
{
    private readonly IMongoCollection<User> _users;

    public MongoDbService(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDB"));
        var database = client.GetDatabase("PCP");
        _users = database.GetCollection<User>("User");
    }

    public User GetUser(string username, string password)
    {
        return _users.Find(u => u.Username == username && u.Password == password).FirstOrDefault();
    }
}
