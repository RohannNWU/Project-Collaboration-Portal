using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var mongoConnectionString = builder.Configuration.GetConnectionString("MongoDb")
                            ?? Environment.GetEnvironmentVariable("MongoDb");

var databaseName = builder.Configuration["DatabaseName"]
                   ?? Environment.GetEnvironmentVariable("DatabaseName");

var mongoSettings = MongoClientSettings.FromConnectionString(mongoConnectionString);
mongoSettings.SslSettings = new SslSettings { EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12 };
var mongoClient = new MongoClient(mongoSettings);
builder.Services.AddSingleton<IMongoClient>(mongoClient);

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(
                "https://wonderful-coast-0409a4c03.2.azurestaticapps.net", // your Azure frontend
                "http://localhost:5173" // optional for local development
            )
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
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