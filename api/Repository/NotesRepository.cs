using api.Context;
using Microsoft.EntityFrameworkCore;

namespace api.Repository
{
    public interface INoteRepository
    {
        Task<IEnumerable<Note>> GetAllAsync(int skip, int take, List<string> list);
        Task<Note?> GetByIdAsync(int id);
        Task CreateAsync(Note note);
        Task UpdateAsync(Note note);
        Task DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<IEnumerable<Tag>> GetAllTagsAsync();
    }

    public class NotesRepository : INoteRepository
    {
        private readonly AppDbContext _context;

        public NotesRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Tag>> GetAllTagsAsync()
        {
            return await _context.Tags.ToListAsync();
        }

        public async Task<IEnumerable<Note>> GetAllAsync(int skip, int take, List<string>? tags)
        {
            var query = _context.Notes.Include(n => n.Tags).AsQueryable();

            if (tags != null && tags.Any())
            {
                foreach (var tagName in tags)
                {
                    query = query.Where(n => n.Tags.Any(t => t.Name == tagName));
                }
            }

            return await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip(skip)
                .Take(take)
                .ToListAsync();
        }

        public async Task<Note?> GetByIdAsync(int id)
        {
            return await _context.Notes.FindAsync(id);
        }

        public async Task CreateAsync(Note note)
        {
            var tagIds = note.Tags.Select(t => t.Id).ToList();

            var existingTags = await _context.Tags
                .Where(t => tagIds.Contains(t.Id))
                .ToListAsync();

            note.Tags = existingTags;

            await _context.Notes.AddAsync(note);
            await _context.SaveChangesAsync();

        }

        public async Task UpdateAsync(Note note)
        {
            var existingNote = await _context.Notes
                .Include(n => n.Tags)
                .FirstOrDefaultAsync(n => n.Id == note.Id);

            if (existingNote == null) throw new KeyNotFoundException();

            existingNote.Title = note.Title;
            existingNote.Content = note.Content;
            existingNote.Color = note.Color;

            var tagIds = note.Tags.Select(t => t.Id).ToList();
            var tagsFromDb = await _context.Tags.Where(t => tagIds.Contains(t.Id)).ToListAsync();

            existingNote.Tags.Clear();
            foreach (var tag in tagsFromDb)
            {
                existingNote.Tags.Add(tag);
            }

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var note = await _context.Notes.FindAsync(id);
            if (note != null)
            {
                _context.Notes.Remove(note);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Notes.AnyAsync(e => e.Id == id);
        }
    }
}
