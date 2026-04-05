using api.Context;
using api.Repository;

namespace api.Service
{
    public interface INoteService
    {
        Task<IEnumerable<Note>> GetNotesAsync(int skip, int take, List<string> list);
        Task<Note?> GetNoteByIdAsync(int id);
        Task<Note> CreateNoteAsync(Note note);
        Task UpdateNoteAsync(int id, Note note);
        Task DeleteNoteAsync(int id);
        Task<IEnumerable<Tag>> GetTagsAsync();
    }

    public class NoteService : INoteService
    {
        private readonly INoteRepository _repository;

        public NoteService(INoteRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<Tag>> GetTagsAsync()
        {
            return await _repository.GetAllTagsAsync();
        }

        public async Task<IEnumerable<Note>> GetNotesAsync(int skip, int take, List<string> list)
        {
            return await _repository.GetAllAsync(skip, take, list);
        }

        public async Task<Note?> GetNoteByIdAsync(int id)
        {
            return await _repository.GetByIdAsync(id);
        }

        public async Task<Note> CreateNoteAsync(Note note)
        {
            note.CreatedAt = DateTime.UtcNow;

            await _repository.CreateAsync(note);
            return note;
        }

        public async Task UpdateNoteAsync(int id, Note note)
        {
            if (!await _repository.ExistsAsync(id))
                throw new KeyNotFoundException($"Note with ID {id} not found");

            note.Id = id;
            await _repository.UpdateAsync(note);
        }

        public async Task DeleteNoteAsync(int id)
        {
            if (!await _repository.ExistsAsync(id))
                throw new KeyNotFoundException($"Note with ID {id} not found");

            await _repository.DeleteAsync(id);
        }
    }
}