export interface ExerciseDatabase {
  [muscleGroup: string]: string[];
}

export const EXERCISES_BY_GROUP: ExerciseDatabase = 
{
  CHEST: 
  [
    'Bench Press',
    'Incline Bench Press',
    'Smith Machine Bench Press',
    'Incline Smith Machine Bench Press',
    'Machine Chest Press',
    'Machine Incline Chest Press',
    'Dumbbell Press',
    'Incline Dumbbell Press',
    'Pec Fly',
    'Cable Flyes',
    'Push-ups',
    'Wide Grip Seated Dips',
    'Wide Grip Dips'
  ],
  BACK: 
  [
    'Lat Pulldown',
    'Machine Lat Pulldown',
    'Barbell Row',
    'Dumbbell Row',
    'Seated Cable Row',
    'Machine Row',
    'Dumbbell Shrugs',
    'Barbell Shrugs',
    'Pull-ups',
    'Deadlift'
  ],
  LEGS: 
  [
    'Squats',
    'Leg Press',
    'Leg Extensions',
    'Leg Curls',
    'Hip Thrust',
    'Calf Raises',
    'Abductor Machine'
  ],
  SHOULDERS: 
  [
    'Overhead Press',
    'Cable Lateral Raises',
    'Dumbbell Lateral Raises',
    'Machine Lateral Raises',
    'Dumbbell Front Raises',
    'Cable Front Raises',
    'Cable Face Pulls',
    'Reverse Pec Deck'
  ],
  BICEPS: 
  [
    'Dumbbell Curls',
    'Incline Dumbbell Curls',
    'Hammer Curls',
    'Cable Hammer Curls',
    'Preacher Curls',
    'Bar Curls',
    'Bayesian Curls'
  ],
  TRICEPS: 
  [
    'Cable Tricep Pushdowns',
    'Cable Overhead Extension',
    'Dumbbell Overhead Extension',
    'Close Grip Seated Dips',
    'Close Grip Dips',
    'Close Grip Bench Press',
    'Skull Crushers'
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