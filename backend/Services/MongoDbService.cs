using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using backend.Models;
using System.Threading.Tasks;

namespace backend.Services
{
    public class MongoDbService
    {
        private readonly IMongoCollection<User> _users;

        public MongoDbService(IConfiguration config)
        {
            var client = new MongoClient(config.GetConnectionString("MongoDB"));
            var dbName = config["MongoDbSettings:DatabaseName"] ?? "PCP";
            var database = client.GetDatabase(dbName);

            var usersCollection = config["MongoDbSettings:UsersCollectionName"] ?? "User";
            _users = database.GetCollection<User>(usersCollection);
        }

        public Task<User> GetByUsernameAsync(string username) =>
            _users.Find(u => u.Username == username).FirstOrDefaultAsync();
    }
}
