import { Component, inject, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, AlertController, IonButton, IonSelect, IonSelectOption} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { returnUpBackOutline, chevronDownOutline, add } from 'ionicons/icons';
import { WorkoutService, WorkoutMuscleGroup, WorkoutExercise, Workout } from 'src/app/services/workout-service';
import { EXERCISES_BY_GROUP, ALL_MUSCLE_GROUPS } from 'src/app/shared/constants/exercise-database';

@Component({
  selector: 'app-workout',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, IonButton, IonSelect, IonSelectOption],
  templateUrl: './workout-page.page.html',
})
export class WorkoutPagePage implements OnDestroy 
{
  workoutService = inject(WorkoutService);
  private alertController = inject(AlertController);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  readonly recentWorkoutsLimit = 6;


  viewState: 1 | 2 | 3 = 1;
  activeMuscleGroup: WorkoutMuscleGroup | null = null;
  activeExercise: WorkoutExercise | null = null;


  newGroupName = '';
  newExerciseName = '';
  newReps: number | null = null;
  newWeight: number | null = null;


  timerInterval: any;
  timerDisplay = '00:00';
  selectedTemplateId = '';


  constructor() {
    addIcons({ returnUpBackOutline, chevronDownOutline, add });
  }

  ngOnDestroy() 
  {
    this.stopTimer();
  }

  async confirmStartWorkout(event: any) 
  {
  const templateId = event?.detail?.value;
  if (!templateId) return;

  const template = this.workoutService.workouts.find(w => w.id === templateId);
  if (!template) return;

  const alert = await this.alertController.create({
    header: 'Start Workout',
    message: `Are you sure you want to start a ${template.name} workout?`,
    cssClass: 'custom-alert', 
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          this.ngZone.run(() => {
            this.selectedTemplateId = ''; 
          });
        }
      },
      {
        text: 'Start',
        handler: () => {
          this.ngZone.run(() => {
            this.workoutService.startWorkout(template.name, template.muscleGroups);
            this.startTimer();
            this.selectedTemplateId = '';
            this.cdr.detectChanges();
          });
        }
      }
    ]
  });

  await alert.present();
  }

  startTimer() 
  {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.ngZone.run(() => {
        if (this.workoutService.currentActiveWorkout) {
          const diff = Math.floor((Date.now() - this.workoutService.currentActiveWorkout.startTime) / 1000);
          const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
          const seconds = (diff % 60).toString().padStart(2, '0');
          this.timerDisplay = `${minutes}:${seconds}`;
          
          this.cdr.detectChanges();
        }
      });
    }, 1000);
  }

  stopTimer() 
  {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  goBack() 
  {
    if (this.viewState === 3) 
    {
      this.viewState = 2;
      this.activeExercise = null;
    } 
    else if (this.viewState === 2) 
    {
      this.viewState = 1;
      this.activeMuscleGroup = null;
    }
  }

  goToGroup(group: WorkoutMuscleGroup) 
  {
    this.activeMuscleGroup = group;
    this.viewState = 2;
  }

  goToExercise(exercise: WorkoutExercise) 
  {
    this.activeExercise = exercise;
  }

  collapseExercise() {
  this.activeExercise = null;
}


  addGroup() 
  {
    if (this.newGroupName.trim() && this.workoutService.currentActiveWorkout) 
    {
      this.workoutService.currentActiveWorkout.muscleGroups.push({
        id: Date.now().toString(),
        name: this.newGroupName.toUpperCase(),
        isCustom: true,
        isCompleted: false,
        exercises: []
      });
      this.newGroupName = '';
    }
  }

  addExercise() 
  {
    if (this.newExerciseName.trim() && this.activeMuscleGroup) 
    {
      this.activeMuscleGroup.exercises.push({
        id: Date.now().toString(),
        name: this.newExerciseName.toUpperCase(),
        isCustom: true,
        isCompleted: false,
        sets: []
      });
      this.newExerciseName = '';
    }
  }

  addSet() 
  {
    if (this.newReps && this.newWeight && this.activeExercise) 
    {
      this.activeExercise.sets.push({
        reps: this.newReps,
        weight: this.newWeight
      });
      this.newReps = null;
      this.newWeight = null;
    }
  }

  completeExercise() 
  {
    if (this.activeExercise && this.activeMuscleGroup) {
      this.activeExercise.isCompleted = true;

      const allDone = this.activeMuscleGroup.exercises.every(ex => ex.isCompleted);
      if (allDone && this.activeMuscleGroup.exercises.length > 0) 
      {
        this.activeMuscleGroup.isCompleted = true;
      }
      this.collapseExercise();
    }
  }

  async endWorkout() 
  {
    if (!this.workoutService.currentActiveWorkout) return;
    const incompleteGroups = this.workoutService.currentActiveWorkout.muscleGroups.filter(mg => !mg.isCompleted);
    
    let message = 'Are you sure you want to end this workout?';
    if (incompleteGroups.length > 0)
    {
      message = `You have unfinished muscle groups. ${message}`;
    }

    const alert = await this.alertController.create({
      header: 'End Workout',
      message: message,
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Confirm',
          handler: () => {
          this.ngZone.run(async () => {
            await this.workoutService.endWorkout();
            this.stopTimer();
            this.timerDisplay = '00:00';
            this.selectedTemplateId = '';
            this.viewState = 1;
            this.activeMuscleGroup = null;
            this.activeExercise = null;
            this.cdr.detectChanges();
          });
        }
        }
      ]
    });

    await alert.present();
  }
  
  availableGroups = ALL_MUSCLE_GROUPS;

  exercisesByGroup: Record<string, string[]> = EXERCISES_BY_GROUP;
 
  get availableGroupsForDropdown(): string[] 
  {
    if (!this.workoutService.currentActiveWorkout) return this.availableGroups;
    const existingGroupNames = this.workoutService.currentActiveWorkout.muscleGroups.map(mg => mg.name.toUpperCase());
    return this.availableGroups.filter(group => !existingGroupNames.includes(group));
  }

  get availableExercisesForDropdown(): string[] 
  {
    if (!this.workoutService.currentActiveWorkout || !this.activeMuscleGroup) return [];
    const existingExerciseNames = this.activeMuscleGroup.exercises.map(ex => ex.name.toUpperCase());
    const groupName = this.activeMuscleGroup.name.toUpperCase().trim();
    const allExercisesForGroup = this.exercisesByGroup[groupName] || [];
    return allExercisesForGroup.filter(ex => !existingExerciseNames.includes(ex.toUpperCase().trim()));
  }

  restrictInput(event: any, field: 'newReps' | 'newWeight') 
  {
    let inputVal = event.target.value.toString();

    inputVal = inputVal.replace('-', '');

    if (inputVal === '0' || (inputVal.startsWith('0') && !inputVal.startsWith('0.'))) {
      inputVal = '';
    }

    const parts = inputVal.split('.');
    
    if (parts[0] && parts[0].length > 3) {
      parts[0] = parts[0].substring(0, 3);
    }

    if (parts[1] !== undefined && parts[1].length > 1) {
      parts[1] = parts[1].substring(0, 1);
    }

    let finalStr = parts[0];
    if (parts.length > 1) {
      finalStr += '.' + (parts[1] !== undefined ? parts[1] : '');
    }

    event.target.value = finalStr;
    if (finalStr === '' || finalStr === '.') {
      this[field] = null;
    } else {
      this[field] = parseFloat(finalStr);
    }
  }

  get recentWorkouts() 
  {
    const history = this.workoutService.workoutHistory;
    if (!history || history.length === 0) return [];

    const sortedHistory = [...history].sort((a, b) => b.startTime - a.startTime);
    return sortedHistory.slice(0, this.recentWorkoutsLimit).map(workout => {
  
      const totalSeconds = workout.durationSeconds || 0;
      const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const seconds = (totalSeconds % 60).toString().padStart(2, '0');
      
      const durationDisplay = hours === '00' ? `${minutes}:${seconds}` : `${hours}:${minutes}:${seconds}`;

      return { 
        id: workout.id, 
        name: workout.name, 
        date: new Date(workout.startTime), 
        durationDisplay: durationDisplay 
      };
    });
  }


}