using MongoDB.Driver;

public class MongoDbService
{
    private readonly IMongoCollection<User> _users;

    public MongoDbService(IConfiguration config)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDb"));
        var database = client.GetDatabase("PCP"); // change to your DB name
        _users = database.GetCollection<User>("User");   // change to your collection name
    }

    public User GetUser(string username, string password)
    {
        return _users.Find(u => u.Username == username && u.Password == password).FirstOrDefault();
    }
}
