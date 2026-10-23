import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { barChart, barChartOutline, calendar, calendarOutline, chevronBackOutline, refresh, chevronForwardOutline, trendingUpOutline } from 'ionicons/icons';
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
  tooltipPoint: any = null;

  private modalController = inject(ModalController);
  private actionSheetController = inject(ActionSheetController);

  calendarMonth = new Date().getMonth();
  calendarYear = new Date().getFullYear();

  typeChartPeriod: '1M' | '3M' | '6M' | 'ALL' = '3M';
  chartPeriods: ('1M' | '3M' | '6M' | 'ALL')[] = ['1M','3M','6M','ALL'];

  constructor() {
    addIcons({ trendingUpOutline, barChart, barChartOutline, calendar, calendarOutline, refresh, chevronBackOutline, chevronForwardOutline});
  }

  goToProgression() { this.viewState = 1; }
  goToWorkoutLog() { this.viewState = 2; }

  get availableGroups(): string[] 
  {
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

  get availableExercises(): string[] 
  {
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

  setChartPeriod(period: '1M' | '3M' | '6M' | 'ALL'): void 
  {
    this.typeChartPeriod = period;
    this.activePointIndex = null;
  }

  
  changeChartPeriod(direction: number) 
  {
    const currentIndex = this.chartPeriods.indexOf(this.typeChartPeriod);
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= this.chartPeriods.length) 
    {
      return;
    }

    this.setChartPeriod(this.chartPeriods[nextIndex]);
  }

  onGroupChange() 
  {
    this.selectedExercise = '';
    this.activePointIndex = null;
  }

  onExerciseChange() 
  {
    this.activePointIndex = null;
  }

  selectPoint(index: number) 
  {
    this.activePointIndex = this.activePointIndex === index ? null : index;

    if (this.activePointIndex !== null) 
    {
      this.tooltipPoint = this.selectedChartPoint;
    }
  }

  
  get exerciseSessions(): { timestamp: number; date: string; maxWeight: number; bestSet: { weight: number; reps: number | null } | null;}[] 
  {
    if (!this.selectedGroup || !this.selectedExercise) 
    {
      return [];
    }

    const sessions: { timestamp: number; date: string; maxWeight: number; bestSet: { weight: number; reps: number | null } | null;}[] = [];

    for (const workout of this.workoutService.workoutHistory) 
    {
      let maxWeight = 0;

      let bestSet: { weight: number; reps: number | null; } | null = null;

      for (const mg of workout.muscleGroups) 
      {
        if (mg.name.toUpperCase() !== this.selectedGroup) 
        {
          continue;
        }

        for (const exercise of mg.exercises) 
        {
          if (exercise.name.toUpperCase() !== this.selectedExercise) 
          {
            continue;
          }

          for (const set of exercise.sets) {
            const weight = set.weight ?? 0;
            const reps = set.reps ?? null;

            if (weight > maxWeight) {
              maxWeight = weight;
              bestSet = { weight, reps };
            } else if (
              weight > 0 &&
              weight === maxWeight &&
              bestSet !== null &&
              (reps ?? 0) > (bestSet.reps ?? 0)
            ) {
              bestSet = { weight, reps };
            }
          }
        }
      }

      if (maxWeight > 0) {
        sessions.push({
          timestamp: workout.startTime,
          date: this.formatDate(workout.startTime),
          maxWeight,
          bestSet
        });
      }
    }

    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }

  get latestSession() 
  {
    return this.exerciseSessions[0] ?? null;
  }

  get previousSession() 
  {
    return this.exerciseSessions[1] ?? null;
  }

  get latestWeightChange(): number | null 
  {
    if (!this.latestSession || !this.previousSession) 
    {
      return null;
    }

    return this.latestSession.maxWeight - this.previousSession.maxWeight;
  }

  get personalBest() 
  {
    const sessions = this.exerciseSessions;

    if (!sessions.length) { return null; }

    return sessions.reduce((best, session) =>
      session.maxWeight > best.maxWeight ? session : best
    );
  }


  get bestSet(): { weight: number; reps: number | null; date: string; timestamp: number;} | null 
  {
    let best: { weight: number; reps: number | null; date: string; timestamp: number; } | null = null;

    for (const session of this.exerciseSessions) 
    {
      const currentSet = session.bestSet;

      if (currentSet === null) 
        {
        continue;
      }

      if (best === null || currentSet.weight > best.weight) 
      {
        best = { weight: currentSet.weight, reps: currentSet.reps, date: session.date, timestamp: session.timestamp};
      }
    }

    return best;
  }


  get recentSessions() 
  {
    return this.exerciseSessions.slice(0, 5).map((session, index, sessions) => 
    {
      const olderSession = sessions[index + 1];

      return { ...session, change: olderSession ? session.maxWeight - olderSession.maxWeight : null
      };
    });
  }

  get filteredChartData(): { date: string;value: number; timestamp: number; }[] 
  {
    const data = this.rawChartData;

    if (this.typeChartPeriod === 'ALL') 
    {
      return data;
    }

    const months = Number.parseInt(this.typeChartPeriod, 10);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    return data.filter(point => point.timestamp >= cutoff.getTime());
  }

  get selectedChartPoint() 
  {
    if (this.activePointIndex === null) 
    {
      return null;
    }
    return this.chartConfig.points[this.activePointIndex] ?? null;
  }
  
  private getExerciseMaxWeight(sets: { weight: number | null; reps: number | null }[]): number 
  {
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

  get chartConfig() 
  {
    const rawData = this.filteredChartData;

    const svgWidth = 430;
    const svgHeight = 170;

    const paddingLeft = 8;
    const paddingRight = 8;
    const paddingTop = 10;
    const paddingBottom = 10;

    const plotWidth = svgWidth - paddingLeft - paddingRight;
    const plotHeight = svgHeight - paddingTop - paddingBottom;

    const gridLines = [0, 1, 2, 3].map(index => ({y: paddingTop + (plotHeight / 3) * index}));

    if (!rawData.length) 
    {
      return { points: [], segments: [], gridLines, areaPath: '', viewBox: `0 0 ${svgWidth} ${svgHeight}`};
    }

    const values = rawData.map(point => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const range = maxValue === minValue ? Math.max(maxValue * 0.1, 1) : maxValue - minValue;
    const chartMin = minValue === maxValue ? Math.max(0, minValue - range / 2) : minValue - range * 0.1;
    const chartMax = maxValue === minValue ? maxValue + range / 2 : maxValue + range * 0.1;
    const chartRange = chartMax - chartMin;

    const points = rawData.map((data, index) => 
    {

      const x = rawData.length === 1 ? paddingLeft + plotWidth / 2 : paddingLeft + (index / (rawData.length - 1)) * plotWidth;
      const y = paddingTop + plotHeight - ((data.value - chartMin) / chartRange) * plotHeight;

      return { ...data, x,  y,  shortDate: data.date.slice(0, 5)
      };
    });

    const segments = [];

    for (let i = 0; i < points.length - 1; i++) 
    {
      const current = points[i];
      const next = points[i + 1];

      segments.push({ x1: current.x, y1: current.y, x2: next.x, y2: next.y });
    }

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const baselineY = paddingTop + plotHeight;

    const areaPath = [ `M ${firstPoint.x} ${baselineY}`, ...points.map(point => `L ${point.x} ${point.y}`),  `L ${lastPoint.x} ${baselineY}`,  'Z' ].join(' ');

    return { points, segments, gridLines, areaPath, viewBox: `0 0 ${svgWidth} ${svgHeight}`
    };
  }

  get calendarMonthLabel(): string 
  {
    const names = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
    return `${names[this.calendarMonth]} ${this.calendarYear}`;
  }

  prevMonth() 
  {
    this.calendarMonth--;
    if (this.calendarMonth < 0) { this.calendarMonth = 11; this.calendarYear--; }
  }

  nextMonth() 
  {
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


    if (leadingBlanks > 0) 
    {
      const previousMonthDays = new Date(this.calendarYear, this.calendarMonth, 0).getDate();

      for (let i = leadingBlanks; i > 0; i--) 
      {
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


    for (let d = 1; d <= daysInMonth; d++) 
    {
      const date = new Date(this.calendarYear, this.calendarMonth, d);
      date.setHours(0, 0, 0, 0);
      
      let color: string;
      let hasHistory = false;
      const isPast = date.getTime() < todayMidnight.getTime();
      const isToday = date.getTime() === todayMidnight.getTime();

      const history = this.workoutService.getHistoryForDate(date);

      if (isPast) 
      {
        if (history.length > 0) 
        {
          color = this.workoutService.getWorkoutColor(history[0].name);
          hasHistory = true;
        } 
        else 
        {
          color = REST_DAY_COLOR;
        }
      } 
      else 
      {
        if (history.length > 0) 
        {
          color = this.workoutService.getWorkoutColor(history[0].name);
          hasHistory = true;
        } 
        else 
          {
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

    const trailingDays = 42 - cells.length;
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

  get cycleBarSlots(): { color: string; isToday: boolean }[] 
  {
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

    if (history.length === 1) 
      {
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

  private async openWorkoutDetailModal(workout: any) 
  {
    const modal = await this.modalController.create({
      component: WorkoutHistoryDetailComponent,
      componentProps: { workout },
      cssClass: 'workout-history-modal',
    });
    await modal.present();
  }

  async openSplitEditor() 
  {
    const modal = await this.modalController.create({
      component: SplitEditorComponent,
      cssClass: 'split-editor-modal',
      initialBreakpoint: 0.75,
      breakpoints: [0, 0.75, 0.95],
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.saved) 
    {
      const todayMidnight = new Date();
      todayMidnight.setHours(0, 0, 0, 0);
      const anchorDate = this.workoutService.cycle?.anchorDate ?? todayMidnight.getTime();
      await this.workoutService.saveCycle({slots: data.slots,anchorDate});
    }
  }

  async openRestartPicker() 
  {
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

  get muscleGroupCoverage() 
  {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);

    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));

    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    const cycleWorkoutIds = new Set(
      (this.workoutService.cycle?.slots ?? [])
        .filter(slot => slot.type === 'workout' && slot.workoutId)
        .map(slot => slot.workoutId!)
    );

    const templates = cycleWorkoutIds.size > 0
      ? this.workoutService.workouts.filter(
          workout => cycleWorkoutIds.has(workout.id)
        )
      : this.workoutService.workouts;

    const plannedGroups = new Map<string, string>();

    templates.forEach(workout => {
      workout.muscleGroups.forEach(group => {
        const name = group.name.trim();
        const key = name.toUpperCase();

        if (key) {
          plannedGroups.set(key, name);
        }
      });
    });

    const groupWorkoutCounts = new Map<string, number>();

    this.workoutService.workoutHistory.forEach(workout => 
    {
      const timestamp = workout.startTime;

      if 
      (
        timestamp < monday.getTime() ||
        timestamp >= nextMonday.getTime()
      ) 
      {
        return;
      }

      const groupsInWorkout = new Set<string>();

      workout.muscleGroups.forEach(group => {
        const hasLoggedSets = group.exercises.some(
          exercise => exercise.sets.length > 0
        );

        if (hasLoggedSets) {
          const key = group.name.trim().toUpperCase();

          if (key) {
            groupsInWorkout.add(key);
          }
        }
      });


      groupsInWorkout.forEach(key => {
        groupWorkoutCounts.set(
          key,
          (groupWorkoutCounts.get(key) ?? 0) + 1
        );
      });
    });

    const groups = Array.from(plannedGroups.entries())
      .map(([key, name]) => {
        const workoutCount = groupWorkoutCounts.get(key) ?? 0;

        return {
          key,
          name,
          workoutCount,
          trained: workoutCount >= 1
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      groups,
      trainedCount: groups.filter(group => group.workoutCount >= 1).length,
      total: groups.length
    };
  }


}