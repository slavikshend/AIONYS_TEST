using api.Context;

namespace api.Data
{
    public static class TagSeeder
    {
        public static void Seed(AppDbContext db)
        {
            if (!db.Tags.Any())
            {
                var initialTags = new List<Tag>
                {
                    new Tag { Name = "Work" },
                    new Tag { Name = "Personal" },
                    new Tag { Name = "Ideas" },
                    new Tag { Name = "Urgent" },
                    new Tag { Name = "Study" },
                    new Tag { Name = "Archive" }
                };

                db.Tags.AddRange(initialTags);
                db.SaveChanges();
            }
        }
    }
}