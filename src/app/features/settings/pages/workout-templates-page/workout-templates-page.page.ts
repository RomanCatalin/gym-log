import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonList, IonItem, IonLabel, IonInput, 
  IonButton, IonSelect, IonSelectOption, IonIcon 
} from '@ionic/angular/standalone';
import { WorkoutService, Workout, MuscleGroup } from 'src/app/services/workout-service';
import { addIcons } from 'ionicons';
import { arrowRedoOutline, pencilOutline, chevronDownOutline, closeOutline, returnUpBackOutline, add } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workout-templates-page',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonIcon],
  templateUrl: './workout-templates-page.page.html',
})
export class WorkoutTemplatesPagePage {
  workoutService = inject(WorkoutService);
  private router = inject(Router);
  constructor() {
    addIcons({ 
      returnUpBackOutline,
      arrowRedoOutline, 
      pencilOutline, 
      chevronDownOutline, 
      closeOutline,
      add
    });
  }

  viewState: 1 | 2 | 3 = 1;
  selectedWorkout: Workout | null = null;
  selectedMuscleGroup: MuscleGroup | null = null;
  newWorkoutName = '';
  selectedNewGroup = '';
  selectedNewExercise = '';

  availableGroups = ['CARDIO', 'CHEST', 'TRICEPS', 'SHOULDERS', 'BACK', 'LEGS', 'BICEPS'];

  exercisesByGroup: Record<string, string[]> = 
  {
    'CARDIO': ['TREADMILL', 'CYCLING', 'STAIRMASTER', 'ROWING'],
    'CHEST': ['BENCH PRESS', 'INCLINE PRESS', 'PEC DECK', 'DIPS', 'CABLE CROSSOVER', 'PUSH UPS'],
    'TRICEPS': ['PUSH DOWNS', 'TRICEP EXTENSIONS', 'SKULLCRUSHERS', 'DIPS', 'CLOSE GRIP BENCH PRESS', 'OVERHEAD TRICEP EXTENSIONS'],
    'SHOULDERS': ['SHOULDER PRESS', 'DUMBBELL LATERAL RAISES', 'CABLE LATERAL RAISES', 'DUMBBELL FRONT RAISES'],
    'BACK': ['PULL UPS', 'BARBELL ROW', 'LAT PULLDOWN', 'DEADLIFT', 'SEATED ROW', 'FACE PULLS', 'T-BAR ROW', 'DUMBBELL ROW'],
    'LEGS': ['SQUATS', 'LEG PRESS', 'LUNGES', 'CALF RAISE'],
    'BICEPS': ['BARBELL CURLS', 'HAMMER CURLS', 'PREACHER CURLS','BAYESIAN CURLS', 'DUMBBELL CURLS']
  };

  get currentAvailableExercises(): string[] {
    if (!this.selectedMuscleGroup) return [];
    return this.exercisesByGroup[this.selectedMuscleGroup.name] || [];
  }

goBack() {
    if (this.viewState === 3) {
      this.viewState = 2;
      this.selectedMuscleGroup = null;
    } 
    else if (this.viewState === 2) {
      this.viewState = 1;
      this.selectedWorkout = null;
    } 
    else if (this.viewState === 1)
    {
      this.router.navigate(['/settings']); 
    }
  }

  goToLevel1() {
    this.viewState = 1;
    this.selectedWorkout = null;
    this.selectedMuscleGroup = null;
  }

  goToLevel2(workout: Workout) {
    this.selectedWorkout = workout;
    this.viewState = 2;
  }

  goToLevel3(group: MuscleGroup) {
    this.selectedMuscleGroup = group;
    this.viewState = 3;
  }

  addWorkout() {
    if (this.newWorkoutName.trim()) {
      this.workoutService.workouts.push({ id: Date.now().toString(), name: this.newWorkoutName.toUpperCase(), muscleGroups: [] });
      this.workoutService.saveTemplates();
      this.newWorkoutName = '';
    }
  }

  addGroup() {
    if (this.selectedWorkout && this.selectedNewGroup) {
      this.selectedWorkout.muscleGroups.push({ id: Date.now().toString(), name: this.selectedNewGroup, exercises: [] });
      this.workoutService.saveTemplates();
      this.selectedNewGroup = '';
    }
  }

  addExercise() {
    if (this.selectedMuscleGroup && this.selectedNewExercise) {
      this.selectedMuscleGroup.exercises.push({ id: Date.now().toString(), name: this.selectedNewExercise });
      this.workoutService.saveTemplates();
      this.selectedNewExercise = '';
    }
  }

  deleteWorkout() {
    if (this.selectedWorkout) {
      this.workoutService.workouts = this.workoutService.workouts.filter(w => w.id !== this.selectedWorkout?.id);
      this.workoutService.saveTemplates();
      this.goBack();
    }
  }

  deleteGroup() {
    if (this.selectedWorkout && this.selectedMuscleGroup) {
      this.selectedWorkout.muscleGroups = this.selectedWorkout.muscleGroups.filter(g => g.id !== this.selectedMuscleGroup?.id);
      this.workoutService.saveTemplates();
      this.goBack();
    }
  }

  deleteExercise(exerciseId: string) {
    if (this.selectedMuscleGroup) {
      this.selectedMuscleGroup.exercises = this.selectedMuscleGroup.exercises.filter(e => e.id !== exerciseId);
      this.workoutService.saveTemplates();
    }
  }
}