import { Component, signal, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-custom-calendar',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslateModule],
  templateUrl: '../custom-calendar/custom-calendar.html'
})
export class CustomCalendarComponent {
  private translate = inject(TranslateService);
  dateSelected = output<Date>();

  viewDate = signal(new Date());
  selectedDate = signal<number | null>(new Date().getDate());

  daysInMonth = computed(() => {
    const date = this.viewDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const days = [];
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const offset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < offset; i++) days.push(null);

    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  });

  get currentLang() {
    return this.translate.getCurrentLang() || 'en';
  }

  changeMonth(delta: number) {
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
    this.selectedDate.set(null);
  }

  selectDay(day: number | null) {
    if (!day) return;
    this.selectedDate.set(day);
    const date = this.viewDate();
    this.dateSelected.emit(new Date(date.getFullYear(), date.getMonth(), day));
  }
}