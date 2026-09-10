export interface ExerciseDatabase {
  [muscleGroup: string]: string[];
}

export const EXERCISES_BY_GROUP: ExerciseDatabase = 
{
  CHEST: 
  [
    'Bench Press',
    'Incline Bench Press',
    'Machine Chest Press',
    'Machine Incline Chest Press',
    'Incline Dumbbell Press',
    'Pec Fly',
    'Cable Flyes',
    'Push-ups',
    'Dips'
  ],
  BACK: 
  [
    'Lat Pulldown',
    'Machine Lat Pulldown',
    'Barbell Row',
    'Pull-ups',
    'Seated Cable Row',
    'Machine Row',
    'Deadlift',
    'Dumbbell Shrugs',
    'Barbell Shrugs'
  ],
  LEGS: 
  [
    'Squats',
    'Leg Press',
    'Leg Extensions',
    'Leg Curls',
    'Calf Raises'
  ],
  SHOULDERS: 
  [
    'Overhead Press',
    'Cable Lateral Raises',
    'Dumbbell Lateral Raises',
    'Front Raises',
    'Cable Face Pulls'
  ],
  BICEPS: 
  [
    'Dumbbell Curls',
    'Hammer Curls',
    'Preacher Curls',
    'Bar Curls',
    'Bayesian Curls'
  ],
  TRICEPS: 
  [
    'Cable Tricep Pushdowns',
    'Cable Overhead Extension',
    'Dumbbell Overhead Extension',
    'Dumbbell Tricep Pushdown',
    'Seated Dips',
    'Dips',
    'Unilateral Tricep Pushdown',
    'Skull Crushers',
  ],
  CORE: 
  [
    'Crunches',
    'Cable Crunches',
    'Leg Raises',
    'Plank',
    'Machine Crunches',
    'Russian Twists',
    'Bicycle Crunches',
    'Hanging Leg Raises'
  ] 
};

export const ALL_MUSCLE_GROUPS: string[] = Object.keys(EXERCISES_BY_GROUP);