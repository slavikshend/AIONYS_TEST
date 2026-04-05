using api.Context;
using api.Service;
using Microsoft.AspNetCore.Mvc;

namespace api.Controller
{
    [ApiController]
    [Route("api/notes")]
    public class NoteController : ControllerBase
    {
        private readonly INoteService _noteService;

        public NoteController(INoteService noteService)
        {
            _noteService = noteService;
        }

        [HttpGet("tags")]
        public async Task<ActionResult<IEnumerable<Tag>>> GetTags()
        {
            var tags = await _noteService.GetTagsAsync();
            return Ok(tags);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Note>>> GetNotes(
    [FromQuery] int skip = 0,
    [FromQuery] int take = 20,
    [FromQuery] List<string>? tags = null)
        {
            var notes = await _noteService.GetNotesAsync(skip, take, tags);
            return Ok(notes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Note>> GetNote(int id)
        {
            var note = await _noteService.GetNoteByIdAsync(id);
            if (note == null) return NotFound(new { message = $"Заметка с id {id} не найдена" });

            return Ok(note);
        }

        [HttpPost]
        public async Task<ActionResult<Note>> CreateNote([FromBody] Note note)
        {
            var createdNote = await _noteService.CreateNoteAsync(note);
            return CreatedAtAction(nameof(GetNote), new { id = createdNote.Id }, createdNote);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(int id, [FromBody] Note note)
        {
            try
            {
                await _noteService.UpdateNoteAsync(id, note);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(int id)
        {
            try
            {
                await _noteService.DeleteNoteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }
    }
}