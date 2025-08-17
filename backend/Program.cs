using MongoDB.Driver;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Security.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Read MongoDB connection info from App Settings / Environment
var mongoConnectionString = builder.Configuration.GetConnectionString("MongoDb")
                            ?? Environment.GetEnvironmentVariable("MongoDb");

var databaseName = builder.Configuration["DatabaseName"]
                   ?? Environment.GetEnvironmentVariable("DatabaseName");

// Configure MongoDB client with TLS 1.2
var mongoSettings = MongoClientSettings.FromConnectionString(mongoConnectionString);
mongoSettings.SslSettings = new SslSettings { EnabledSslProtocols = SslProtocols.Tls12 };
var mongoClient = new MongoClient(mongoSettings);

// Register MongoClient and IMongoDatabase for dependency injection
builder.Services.AddSingleton<IMongoClient>(mongoClient);
builder.Services.AddSingleton(sp => sp.GetRequiredService<IMongoClient>().GetDatabase(databaseName));

// Configure CORS for frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "https://wonderful-coast-0409a4c03.2.azurestaticapps.net",
                "http://localhost:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();
app.Run();
