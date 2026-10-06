import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController, IonIcon, IonAccordionGroup, IonAccordion, IonItem } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronDownOutline, timeOutline, timerOutline } from 'ionicons/icons';
import { ActiveWorkout, WorkoutMuscleGroup, WorkoutExercise, WorkoutSet } from 'src/app/services/workout-service';

@Component({
  selector: 'app-workout-history-detail',
  standalone: true,
  imports: [CommonModule, IonIcon, IonAccordionGroup, IonAccordion, IonItem],
  templateUrl: './workout-history-detail.component.html',
})
export class WorkoutHistoryDetailComponent 
{
  @Input() workout!: ActiveWorkout;

  private modalController = inject(ModalController);

  constructor() 
  {
    addIcons({ chevronDownOutline, timeOutline, timerOutline});
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

  get groupsWithData(): { group: WorkoutMuscleGroup;  exercises: WorkoutExercise[] }[] 
  {
    return this.workout.muscleGroups.map(group => ({group, exercises: group.exercises.filter(ex => ex.sets.length > 0),})).filter(g => g.exercises.length > 0);
  }

  formatRestDuration(seconds: number): string 
  {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  close() 
  {
    this.modalController.dismiss();
  }
}