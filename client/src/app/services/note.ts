import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Tag {
  id?: number;
  name: string;
}

export interface Note {
  id?: number;
  title: string;
  content: string;
  color: string;
  createdAt?: string;
  tags: Tag[];
}

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private http = inject(HttpClient);
  private apiUrl = '/api/notes';

  getNotes(skip: number, take: number): Observable<Note[]> {
    const params = new HttpParams()
      .set('skip', skip.toString())
      .set('take', take.toString());
    
    return this.http.get<Note[]>(this.apiUrl, { params });
  }

  createNote(note: Note): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, note);
  }

  updateNote(id: number, note: Note): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, note);
  }

  deleteNote(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}