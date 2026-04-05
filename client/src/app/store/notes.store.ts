import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { Note, Tag } from '../../app/app';
import { computed } from '@angular/core';

type NotesState = {
  notes: Note[];
  allTags: Tag[];
  searchQuery: string;
  selectedTags: string[];
  selectedDate: Date | null;
  isLoading: boolean;
  page: number;
  pageSize: number;
};

const initialState: NotesState = {
  notes: [],
  allTags: [],
  searchQuery: '',
  selectedTags: [],
  selectedDate: null,
  isLoading: false,
  page: 1,
  pageSize: 20,
};

export const NotesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed((store) => ({
    filteredNotes: computed(() => {
      const search = store.searchQuery().toLowerCase();
      const activeTags = store.selectedTags();
      const date = store.selectedDate();

      return store.notes().filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search) || 
                              n.content.toLowerCase().includes(search);
        
        const matchesTags = activeTags.length === 0 || 
                            activeTags.some(tagName => n.tags.some(t => t.name === tagName));

        const matchesDate = !date || isSameDay(new Date(n.createdAt), date);

        return matchesSearch && matchesTags && matchesDate;
      });
    })
  })),

  withMethods((store, http = inject(HttpClient)) => ({
    loadAllTags() {
      http.get<Tag[]>('/api/notes/tags').subscribe(tags => patchState(store, { allTags: tags }));
    },

    loadMoreNotes() {
      if (store.isLoading()) return;

      patchState(store, { isLoading: true });
      const skip = (store.page() - 1) * store.pageSize();

      http.get<Note[]>(`/api/notes?skip=${skip}&take=${store.pageSize()}`).subscribe({
        next: (newNotes) => patchState(store, {
          notes: [...store.notes(), ...newNotes],
          page: store.page() + 1,
          isLoading: false
        }),
        error: () => patchState(store, { isLoading: false })
      });
    },

    saveNote(note: Partial<Note>, callback: () => void) {
      if (note.id) {
        http.put<Note>(`/api/notes/${note.id}`, note).subscribe(() => {
          patchState(store, {
            notes: store.notes().map(n => n.id === note.id ? (note as Note) : n)
          });
          callback();
        });
      } else {
        http.post<Note>(`/api/notes`, note).subscribe(createdNote => {
          patchState(store, { notes: [createdNote, ...store.notes()] });
          callback();
        });
      }
    },

    deleteNote(id: number) {
      http.delete(`/api/notes/${id}`).subscribe(() => {
        patchState(store, { notes: store.notes().filter(n => n.id !== id) });
      });
    },

    updateSearch(query: string) { patchState(store, { searchQuery: query }); },
    
    toggleTag(tagName: string) {
      const tags = store.selectedTags();
      const newTags = tags.includes(tagName) ? tags.filter(t => t !== tagName) : [...tags, tagName];
      patchState(store, { selectedTags: newTags });
    },

    setSelectedDate(date: Date | null) { patchState(store, { selectedDate: date }); }
  }))
);

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}