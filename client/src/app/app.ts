import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CustomCalendarComponent } from './components/custom-calendar/custom-calendar';
import { NotesStore } from './store/notes.store'; // Импортируй созданный стор

export interface Tag {
  id: number;
  name: string;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  tags: Tag[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, CustomCalendarComponent, MatIconModule, FormsModule, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  readonly store = inject(NotesStore);
  private translate = inject(TranslateService);
  isEditorOpen = signal(false);
  editingNote = signal<Partial<Note> | null>(null);
  currentLang = signal('en');
  colors = ['#ffffff', '#fef3c7', '#d1fae5', '#dbeafe', '#f3e8ff', '#fee2e2'];

  constructor() {
    this.translate.addLangs(['en', 'uk']);
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();
    const targetLang = browserLang?.match(/en|uk/) ? browserLang : 'en';
    this.translate.use(targetLang);
    this.currentLang.set(targetLang);
  }

  ngOnInit() {
    this.store.loadMoreNotes();
    this.store.loadAllTags();
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
  }

  addNote() {
    this.editingNote.set({ title: '', content: '', color: '#ffffff', tags: [] });
    this.isEditorOpen.set(true);
  }

  editNote(note: Note) {
    this.editingNote.set({ ...note });
    this.isEditorOpen.set(true);
  }

  closeEditor() {
    this.isEditorOpen.set(false);
    this.editingNote.set(null);
  }

  saveNote() {
    const note = this.editingNote();
    if (note && note.title) {
      this.store.saveNote(note, () => this.closeEditor());
    }
  }

  toggleTagInEditor(tag: Tag) {
    this.editingNote.update(note => {
      if (!note) return null;
      const hasTag = note.tags?.some(t => t.id === tag.id);
      const newTags = hasTag 
        ? note.tags?.filter(t => t.id !== tag.id) 
        : [...(note.tags || []), tag];
      return { ...note, tags: newTags };
    });
  }

  updateSearch(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.store.updateSearch(val);
  }

  onDateChange(date: Date) {
    const current = this.store.selectedDate();
    const isSame = current && 
      current.getFullYear() === date.getFullYear() && 
      current.getMonth() === date.getMonth() && 
      current.getDate() === date.getDate();
    
    this.store.setSelectedDate(isSame ? null : date);
  }

  onScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (Math.ceil(el.scrollHeight - el.scrollTop) <= el.clientHeight + 1) {
      this.store.loadMoreNotes();
    }
  }

  deleteNote(id: number) {
    if (confirm(this.translate.instant('COMMON.CONFIRM_DELETE'))) {
      this.store.deleteNote(id);
    }
  }
}