import { Injectable } from '@angular/core';

export interface Exercise { id: string; name: string; }
export interface MuscleGroup { id: string; name: string; exercises: Exercise[]; }
export interface Workout { id: string; name: string; muscleGroups: MuscleGroup[]; }

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  workouts: Workout[] = [
    {
      id: '1', name: 'PUSH',
      muscleGroups: [
        { 
          id: 'mg1', name: 'TRICEPS', 
          exercises: [{ id: 'e1', name: 'PUSH DOWN' }, { id: 'e2', name: 'EXTENSION' }] 
        },
        { id: 'mg2', name: 'CHEST', exercises: [] },
        { id: 'mg3', name: 'SHOULDERS', exercises: [] }
      ]
    },
    { id: '2', name: 'PULL', muscleGroups: [] },
    { id: '3', name: 'LEGS', muscleGroups: [] }
  ];
}