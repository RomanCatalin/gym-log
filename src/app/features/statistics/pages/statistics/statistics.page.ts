import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barChart, barChartOutline, calendar, calendarOutline, refresh, trendingUpOutline } from 'ionicons/icons';
import { WorkoutService } from 'src/app/services/workout-service';
import { FormsModule } from '@angular/forms';
import { ModalController, ActionSheetController } from '@ionic/angular/standalone';
import { REST_DAY_COLOR } from 'src/app/shared/constants/workout-colors';
import { WorkoutHistoryDetailComponent } from '../../components/workout-history-detail/workout-history-detail.component';
import { SplitEditorComponent } from '../../components/split-editor/spllit-editor.component';

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics.page.html',
  styleUrls: ['./statistics.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonButton, IonSelect, FormsModule, IonSelectOption],
})
export class StatisticsPage {
  workoutService = inject(WorkoutService);

  viewState: 1 | 2 = 1; // 1 = Progression, 2 = Workout Log

  selectedGroup = '';
  selectedExercise = '';
  activePointIndex: number | null = null;

  private modalController = inject(ModalController);
  private actionSheetController = inject(ActionSheetController);

  calendarMonth = new Date().getMonth();
  calendarYear = new Date().getFullYear();

  constructor() {
    addIcons({ trendingUpOutline, barChart, calendar, refresh });
  }

  goToProgression() { this.viewState = 1; }
  goToWorkoutLog() { this.viewState = 2; }

  get availableGroups(): string[] {
    const history = this.workoutService.workoutHistory;
    const items = new Set<string>();
    history.forEach(workout => {
      workout.muscleGroups.forEach(mg => {
        if (mg.exercises.some(ex => ex.sets.length > 0)) {
          items.add(mg.name.toUpperCase());
        }
      });
    });
    return Array.from(items);
  }

  get availableExercises(): string[] {
    if (!this.selectedGroup) return [];
    const history = this.workoutService.workoutHistory;
    const items = new Set<string>();
    history.forEach(workout => {
      workout.muscleGroups
        .filter(mg => mg.name.toUpperCase() === this.selectedGroup)
        .forEach(mg => {
          mg.exercises.forEach(ex => {
            if (ex.sets.length > 0) items.add(ex.name.toUpperCase());
          });
        });
    });
    return Array.from(items);
  }

  onGroupChange() {
    this.selectedExercise = '';
    this.activePointIndex = null;
  }

  onExerciseChange() {
    this.activePointIndex = null;
  }

  selectPoint(index: number) {
    this.activePointIndex = this.activePointIndex === index ? null : index;
  }

  private getExerciseMaxWeight(sets: { weight: number | null; reps: number | null }[]): number {
    let max = 0;
    sets.forEach(s => {
      if (s.weight && s.weight > max) max = s.weight;
    });
    return max;
  }

  private formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  get rawChartData(): { date: string; value: number; timestamp: number }[] {
    if (!this.selectedGroup || !this.selectedExercise) return [];

    const history = this.workoutService.workoutHistory;
    const dailyBest = new Map<string, { value: number; timestamp: number }>();

    history.forEach(workout => {
      let maxForThisWorkout = 0;
      workout.muscleGroups
        .filter(mg => mg.name.toUpperCase() === this.selectedGroup)
        .forEach(mg => {
          mg.exercises
            .filter(ex => ex.name.toUpperCase() === this.selectedExercise)
            .forEach(ex => {
              const max = this.getExerciseMaxWeight(ex.sets);
              if (max > maxForThisWorkout) maxForThisWorkout = max;
            });
        });

      if (maxForThisWorkout > 0) {
        const dateStr = this.formatDate(workout.startTime);
        const existing = dailyBest.get(dateStr);
        if (!existing || maxForThisWorkout > existing.value) {
          dailyBest.set(dateStr, { value: maxForThisWorkout, timestamp: workout.startTime });
        }
      }
    });

    const result = Array.from(dailyBest.entries()).map(([date, data]) => ({
      date, value: data.value, timestamp: data.timestamp,
    }));
    result.sort((a, b) => a.timestamp - b.timestamp);
    return result;
  }

  get chartConfig() {
    const rawData = this.rawChartData;
    const svgWidth = 400;
    const svgHeight = 400;

    if (rawData.length === 0) return { points: [], segments: [], viewBox: `0 0 ${svgWidth} ${svgHeight}` };

    const maxVal = Math.max(...rawData.map(d => d.value));
    const minVal = Math.min(...rawData.map(d => d.value));
    const range = maxVal === minVal ? 10 : maxVal - minVal;

    const paddingX = 25;
    const topPadding = 40;
    const bottomPadding = 40;
    const usableWidth = svgWidth - paddingX * 2;
    const usableHeight = svgHeight - topPadding - bottomPadding;

    const points = rawData.map((data, index) => {
      const x = rawData.length > 1 ? paddingX + (index / (rawData.length - 1)) * usableWidth : svgWidth / 2;
      const normalizedY = (data.value - minVal) / range;
      const y = topPadding + usableHeight - (normalizedY * usableHeight);

      let textAnchor = 'middle';
      if (index === 0 && rawData.length > 1) textAnchor = 'start';
      else if (index === rawData.length - 1) textAnchor = 'end';

      return { ...data, x, y, textAnchor };
    });

    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      let lineColor = '#9ca3af';
      if (p2.value > p1.value) lineColor = '#4ade80';
      else if (p2.value < p1.value) lineColor = '#f87171';
      segments.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, color: lineColor });
    }

    return { points, segments, viewBox: `0 0 ${svgWidth} ${svgHeight}` };
  }

  get calendarMonthLabel(): string {
    const names = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    return `${names[this.calendarMonth]} ${this.calendarYear}`;
  }

  prevMonth() {
    this.calendarMonth--;
    if (this.calendarMonth < 0) { this.calendarMonth = 11; this.calendarYear--; }
  }

  nextMonth() {
    this.calendarMonth++;
    if (this.calendarMonth > 11) { this.calendarMonth = 0; this.calendarYear++; }
  }

  get calendarCells(): ({ day: number; date: Date; color: string; hasHistory: boolean; isOutsideMonth: boolean; isPast: boolean; isToday: boolean } | null)[] 
  {
    const firstOfMonth = new Date(this.calendarYear, this.calendarMonth, 1);
    const daysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();
    const jsDay = firstOfMonth.getDay(); 
    const leadingBlanks = (jsDay + 6) % 7; 

    const cells: ({ day: number; date: Date; color: string; hasHistory: boolean; isOutsideMonth: boolean; isPast: boolean; isToday: boolean } | null)[] = [];

    // 1. Zilele din luna anterioară (completare grilă)
    if (leadingBlanks > 0) {
      const previousMonthDays = new Date(this.calendarYear, this.calendarMonth, 0).getDate();

      for (let i = leadingBlanks; i > 0; i--) {
        const day = previousMonthDays - i + 1;
        const date = new Date(this.calendarYear, this.calendarMonth - 1, day);
        date.setHours(0, 0, 0, 0);

        cells.push({
          day,
          date,
          color: '#252525',
          hasHistory: false,
          isOutsideMonth: true,
          isPast: true,
          isToday: false,
        });
      }
    }

    const todayMidnight = new Date();
    todayMidnight.setHours(0, 0, 0, 0);

    // 2. Zilele lunii curente
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.calendarYear, this.calendarMonth, d);
      date.setHours(0, 0, 0, 0);
      
      let color: string;
      let hasHistory = false;
      const isPast = date.getTime() < todayMidnight.getTime();
      const isToday = date.getTime() === todayMidnight.getTime();

      const history = this.workoutService.getHistoryForDate(date);

      if (isPast) {
        // TRECUT: Dacă există antrenament, folosește culoarea lui. Dacă nu, folosește REST_DAY_COLOR.
        if (history.length > 0) {
          color = this.workoutService.getWorkoutColor(history[0].name);
          hasHistory = true;
        } else {
          color = REST_DAY_COLOR;
        }
      } else {
        // ASTĂZI ȘI VIITOR: Aplicăm logica bazată pe Split
        if (history.length > 0) {
          color = this.workoutService.getWorkoutColor(history[0].name);
          hasHistory = true;
        } else {
          const slot = this.workoutService.getCycleSlotForDate(date);
          color = !slot 
            ? REST_DAY_COLOR 
            : (slot.type === 'rest' ? REST_DAY_COLOR : this.workoutService.getWorkoutColorById(slot.workoutId));
        }
      }

      cells.push({
        day: d,
        date,
        color,
        hasHistory,
        isOutsideMonth: false,
        isPast,
        isToday,
      });
    }

    // 3. Zilele din luna următoare (completare grilă)
    const trailingDays = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= trailingDays; i++) {
      const date = new Date(this.calendarYear, this.calendarMonth + 1, i);
      date.setHours(0, 0, 0, 0);

      cells.push({
        day: i,
        date,
        color: '#252525',
        hasHistory: false,
        isOutsideMonth: true,
        isPast: false,
        isToday: false,
      });
    }

    return cells;
  }

  get cycleBarSlots(): { color: string; isToday: boolean }[] {
    if (!this.workoutService.cycle || this.workoutService.cycle.slots.length === 0) return [];
    const todayIndex = this.workoutService.getCycleSlotIndexForDate(new Date());

    return this.workoutService.cycle.slots.map((slot, i) => ({
      color: slot.type === 'rest' ? REST_DAY_COLOR : this.workoutService.getWorkoutColorById(slot.workoutId),
      isToday: i === todayIndex,
    }));
  }

  async onDayTap(cell: { day: number; date: Date; color: string; hasHistory: boolean } | null) 
  {
    if (!cell || !cell.hasHistory) return;
  
    const history = this.workoutService.getHistoryForDate(cell.date);
    if (history.length === 0) return;

    if (history.length === 1) {
      this.openWorkoutDetailModal(history[0]);
      return;
    }

    const buttons: any[] = history.map((workout) => 
    {
      const timeStr = new Date(workout.startTime).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      return {
        text: `${workout.name.toUpperCase()} (${timeStr})`,
        handler: () => {
          this.openWorkoutDetailModal(workout);
        }
      };
    });

    buttons.push({ text: 'CANCEL', role: 'cancel' });

    const actionSheet = await this.actionSheetController.create({
      header: 'SELECT WORKOUT',
      cssClass: 'custom-action-sheet-cycle',
      buttons,
    });

    await actionSheet.present();
  }

private async openWorkoutDetailModal(workout: any) {
  const modal = await this.modalController.create({
    component: WorkoutHistoryDetailComponent,
    componentProps: { workout },
    cssClass: 'workout-history-modal',
    initialBreakpoint: 0.75,
    breakpoints: [0, 0.75, 0.95],
  });
  await modal.present();
}

  async openSplitEditor() {
    const modal = await this.modalController.create({
      component: SplitEditorComponent,
      cssClass: 'split-editor-modal',
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75, 0.95],
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.saved) {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      await this.workoutService.saveCycle({ slots: data.slots, anchorDate: todayMidnight.getTime() });
    }
  }

  async openRestartPicker() {
    if (!this.workoutService.cycle || this.workoutService.cycle.slots.length === 0) return;

    const buttons: any[] = this.workoutService.cycle.slots.map((slot, index) => {
      const label = slot.type === 'rest' ? 'REST' : (this.workoutService.workouts.find(w => w.id === slot.workoutId)?.name || 'UNKNOWN');
      return {
        text: `DAY ${index + 1}: ${label}`,
        handler: () => { this.workoutService.restartCycleAtSlot(index); },
      };
    });
    buttons.push({ text: 'CANCEL', role: 'cancel' });

    const actionSheet = await this.actionSheetController.create({
      header: 'START SPLIT FROM:',
      cssClass: 'custom-action-sheet-cycle',
      buttons,
    });
    await actionSheet.present();
  }
}