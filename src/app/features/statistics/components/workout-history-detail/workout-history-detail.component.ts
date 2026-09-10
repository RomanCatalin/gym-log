import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, timeOutline } from 'ionicons/icons';
import { ActiveWorkout, WorkoutMuscleGroup, WorkoutExercise, WorkoutSet } from 'src/app/services/workout-service';

@Component({
  selector: 'app-workout-history-detail',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './workout-history-detail.component.html',
})
export class WorkoutHistoryDetailComponent 
{
  @Input() workout!: ActiveWorkout;

  private modalController = inject(ModalController);

  constructor() 
  {
    addIcons({ chevronDownOutline, timeOutline });
  }

  get durationDisplay(): string 
  {
    const totalSeconds = this.workout.durationSeconds || 0;
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return hours === '00' ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;
  }

  get dateDisplay(): string 
  {
    const d = new Date(this.workout.startTime);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  get groupsWithData(): { group: WorkoutMuscleGroup; exercises: { exercise: WorkoutExercise; bestSet: WorkoutSet }[] }[] 
  {
    return this.workout.muscleGroups
      .map(group => {
        const exercises = group.exercises
          .map(exercise => ({ exercise, bestSet: this.getBestSet(exercise) }))
          .filter((e): e is { exercise: WorkoutExercise; bestSet: WorkoutSet } => e.bestSet !== null);
        return { group, exercises };
      })
      .filter(g => g.exercises.length > 0);
  }

  private getBestSet(exercise: WorkoutExercise): WorkoutSet | null 
  {
    if (!exercise.sets || exercise.sets.length === 0) return null; 
    let best: WorkoutSet | null = null;
    for (const set of exercise.sets) {
      if (set.weight == null || set.reps == null) continue;
      if (!best || set.weight > (best.weight ?? -Infinity) || (set.weight === best.weight && set.reps > (best.reps ?? -Infinity))) {
        best = set;
      }
    }
    return best;
  }

  close() 
  {
    this.modalController.dismiss();
  }
}