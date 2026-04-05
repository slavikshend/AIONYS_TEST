using api.Context;
using api.Data;
using api.Repository;
using api.Service;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var frontendUrl = builder.Configuration["FrontendUrl"] ?? "http://localhost:4200";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFront",
        builder => builder.WithOrigins(frontendUrl)
                          .AllowAnyMethod()
                          .AllowCredentials()
                          .AllowAnyHeader());
});
builder.Configuration.AddEnvironmentVariables();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<INoteService, NoteService>();
builder.Services.AddScoped<INoteRepository, NotesRepository>();
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connStr));

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db1 = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db1.Database.Migrate();
    TagSeeder.Seed(db1);
}
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseCors("AllowFront");
app.MapControllers();

app.Run();
