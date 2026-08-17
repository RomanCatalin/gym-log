import { Injectable } from '@angular/core';

// ==========================================
// 1. MODELE PENTRU TEMPLATE-URI (Ecranul Settings)
// ==========================================
export interface Exercise {
  id: string;
  name: string;
}

export interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface Workout {
  id: string;
  name: string;
  muscleGroups: MuscleGroup[];
}

// ==========================================
// 2. MODELE PENTRU SESIUNEA ACTIVĂ (Ecranul Principal)
// ==========================================
export interface WorkoutSet {
  reps: number | null;
  weight: number | null;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  isCustom: boolean;    // true dacă e adăugat on-the-fly
  isCompleted: boolean; // true când apeși COMPLETE
  sets: WorkoutSet[];   // lista de serii
}

export interface WorkoutMuscleGroup {
  id: string;
  name: string;
  isCustom: boolean;
  isCompleted: boolean;
  exercises: WorkoutExercise[];
}

export interface ActiveWorkout {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  durationSeconds?: number;
  muscleGroups: WorkoutMuscleGroup[];
}

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  
  // --- STATE-UL APLICAȚIEI ---

  // A. Aici ținem Template-urile create în Settings
  workouts: Workout[] = []; 

  // B. Aici ținem antrenamentul curent
  currentActiveWorkout: ActiveWorkout | null = null;
  
  // C. Istoricul antrenamentelor terminate
  workoutHistory: ActiveWorkout[] = [];

  constructor() {
    this.loadTemplates();
    this.loadHistory();
  }

  // ==========================================
  // LOGICĂ LOCAL STORAGE: TEMPLATE-URI
  // ==========================================
  saveTemplates() {
    localStorage.setItem('workoutTemplates', JSON.stringify(this.workouts));
  }

  loadTemplates() {
    const saved = localStorage.getItem('workoutTemplates');
    if (saved) {
      this.workouts = JSON.parse(saved);
    }
  }

  // ==========================================
  // LOGICĂ LOCAL STORAGE: ISTORIC
  // ==========================================
  saveHistory() {
    localStorage.setItem('workoutHistory', JSON.stringify(this.workoutHistory));
  }

  loadHistory() {
    const saved = localStorage.getItem('workoutHistory');
    if (saved) {
      this.workoutHistory = JSON.parse(saved);
    }
  }

  // ==========================================
  // LOGICĂ: ANTRENAMENT ACTIV
  // ==========================================
  startWorkout(templateName: string, muscleGroupsTemplate: MuscleGroup[]) {
    const clonedGroups: WorkoutMuscleGroup[] = muscleGroupsTemplate.map(mg => ({
      id: crypto.randomUUID(),
      name: mg.name,
      isCustom: false,
      isCompleted: false,
      exercises: mg.exercises.map(ex => ({
        id: crypto.randomUUID(),
        name: ex.name,
        isCustom: false,
        isCompleted: false,
        sets: [] 
      }))
    }));

    this.currentActiveWorkout = {
      id: crypto.randomUUID(),
      name: templateName,
      startTime: Date.now(),
      muscleGroups: clonedGroups
    };
  }

  endWorkout() {
    if (this.currentActiveWorkout) {
      this.currentActiveWorkout.endTime = Date.now();
      this.currentActiveWorkout.durationSeconds = Math.floor((this.currentActiveWorkout.endTime - this.currentActiveWorkout.startTime) / 1000);
      
      this.workoutHistory.push(this.currentActiveWorkout);
      this.saveHistory();
      
      this.currentActiveWorkout = null;
    }
  }
}