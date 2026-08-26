import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline } from 'ionicons/icons';
import { WorkoutService, ActiveWorkout, WorkoutMuscleGroup, WorkoutExercise } from 'src/app/services/workout-service';

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.page.html',
  styleUrls: ['./statistics-page.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, IonSelect, IonSelectOption, CommonModule, FormsModule]
})
export class StatisticsPagePage {
  workoutService = inject(WorkoutService);

  statTypes = ['TOTAL WEIGHT LIFTED', 'WORKOUT TYPE', 'MUSCLE GROUP', 'EXERCISE'];
  selectedStatType: string = 'EXERCISE';
  selectedSubItem: string = '';

  activePointIndex: number | null = null; 
  selectedTimeRange: '7d' | '30d' | 'all' = '7d';

  constructor() {
    addIcons({ chevronDownOutline });
  }


  get availableSubItems(): string[] 
  {
    const history = this.workoutService.workoutHistory;
    if (!history || history.length === 0) return [];
    if (this.selectedStatType === 'TOTAL WEIGHT LIFTED') return [];

    const items = new Set<string>();

    history.forEach(workout => {
      if (this.selectedStatType === 'WORKOUT TYPE') {
        items.add(workout.name.toUpperCase());
      } else {
        workout.muscleGroups.forEach(mg => {
          if (this.selectedStatType === 'MUSCLE GROUP') {
            items.add(mg.name.toUpperCase());
          } else if (this.selectedStatType === 'EXERCISE') {
            mg.exercises.forEach(ex => items.add(ex.name.toUpperCase()));
          }
        });
      }
    });

    return Array.from(items);
  }

  onStatTypeChange() {
    this.activePointIndex = null;
    const subItems = this.availableSubItems;
    if (subItems.length > 0) {
      this.selectedSubItem = subItems[0];
    } else {
      this.selectedSubItem = '';
    }
  }

  selectPoint(index: number) {
    this.activePointIndex = this.activePointIndex === index ? null : index;
  }

  private parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }


  private getExerciseMaxWeight(exercise: WorkoutExercise): number 
  {
    let maxWeight = 0;
    exercise.sets.forEach(set => {
      if (set.weight && set.weight > maxWeight) {
        maxWeight = set.weight;
      }
    });
    return maxWeight;
  }


  private calculateMuscleGroupMaxWeightSum(group: WorkoutMuscleGroup): number 
  {
    let sum = 0;
    group.exercises.forEach(ex => {
      sum += this.getExerciseMaxWeight(ex);
    });
    return sum;
  }

  private calculateWorkoutMaxWeightSum(workout: ActiveWorkout): number 
  {
    let sum = 0;
    workout.muscleGroups.forEach(g => {
      sum += this.calculateMuscleGroupMaxWeightSum(g);
    });
    return sum;
  }


  get rawHistoryData() 
  {
    const history = this.workoutService.workoutHistory;
    if (!history || history.length === 0) return [];

    const dailyData = new Map<string, number>();

    history.forEach(workout => {
      const dateObj = new Date(workout.startTime);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const dateStr = `${day}/${month}/${year}`;

      let sessionValue = 0;

      if (this.selectedStatType === 'TOTAL WEIGHT LIFTED') {
        sessionValue = this.calculateWorkoutMaxWeightSum(workout);
      } 
      else if (this.selectedStatType === 'WORKOUT TYPE' && workout.name.toUpperCase() === this.selectedSubItem) {
        sessionValue = this.calculateWorkoutMaxWeightSum(workout);
      } 
      else if (this.selectedStatType === 'MUSCLE GROUP') {
        const group = workout.muscleGroups.find(g => g.name.toUpperCase() === this.selectedSubItem);
        if (group) sessionValue = this.calculateMuscleGroupMaxWeightSum(group);
      } 
      else if (this.selectedStatType === 'EXERCISE') {
        let maxWeight = 0;
        workout.muscleGroups.forEach(g => {
          const ex = g.exercises.find(e => e.name.toUpperCase() === this.selectedSubItem);
          if (ex) {
            const exMax = this.getExerciseMaxWeight(ex);
            if (exMax > maxWeight) maxWeight = exMax;
          }
        });
        sessionValue = maxWeight;
      }

      if (sessionValue > 0) {
        if (dailyData.has(dateStr)) 
        {
          dailyData.set(dateStr, Math.max(dailyData.get(dateStr)!, sessionValue));
        } 
        else 
        {
          dailyData.set(dateStr, sessionValue);
        }
      }
    });

    const result = Array.from(dailyData.entries()).map(([date, value]) => ({ date, value }));
    result.sort((a, b) => this.parseDate(a.date).getTime() - this.parseDate(b.date).getTime());
    
    return result;
  }


  get chartConfig() 
  {
    const allHistory = this.rawHistoryData;
    let rawData = allHistory;

    if (this.selectedTimeRange === '7d') {
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      rawData = allHistory.filter(item => {
        const itemDate = this.parseDate(item.date);
        return itemDate >= sevenDaysAgo && itemDate <= now;
      });
    }

    const svgWidth = 400;
    const svgHeight = 220; 
    
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

      segments.push({
        x1: p1.x, y1: p1.y,
        x2: p2.x, y2: p2.y,
        color: lineColor
      });
    }

    return { points, segments, viewBox: `0 0 ${svgWidth} ${svgHeight}` };
  }
}