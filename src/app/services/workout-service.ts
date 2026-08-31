import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

export interface Exercise { id: string; name: string; }
export interface MuscleGroup { id: string; name: string; exercises: Exercise[]; }
export interface Workout { id: string; name: string; muscleGroups: MuscleGroup[]; }

export interface WorkoutSet { reps: number | null; weight: number | null; }
export interface WorkoutExercise { id: string; name: string; isCustom: boolean; isCompleted: boolean; sets: WorkoutSet[]; }
export interface WorkoutMuscleGroup { id: string; name: string; isCustom: boolean; isCompleted: boolean; exercises: WorkoutExercise[]; }
export interface ActiveWorkout { id: string; name: string; startTime: number; endTime?: number; durationSeconds?: number; muscleGroups: WorkoutMuscleGroup[]; }

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  
  workouts: Workout[] = []; 
  currentActiveWorkout: ActiveWorkout | null = null;
  workoutHistory: ActiveWorkout[] = [];

  // Variabile pentru SQLite
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  public isDbReady = false;
  public dbReady: Promise<void>;
  pendingActiveWorkout: ActiveWorkout | null = null;

  constructor() 
  {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.dbReady=this.initDatabase();
  }

  async initDatabase() {
    try
     {
      this.db = await this.sqlite.createConnection('fitness_db', false, 'no-encryption', 1, false);
      await this.db.open();

      const schema = `
        CREATE TABLE IF NOT EXISTS templates (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS history (
          id TEXT PRIMARY KEY,
          startTime INTEGER NOT NULL,
          data TEXT NOT NULL
        );
         CREATE TABLE IF NOT EXISTS active_workout (
          id TEXT PRIMARY KEY,
          data TEXT NOT NULL
        );
      `;
      await this.db.execute(schema);
      
      
      this.isDbReady = true;
      await this.loadTemplates();
      await this.loadHistory();
      await this.loadActiveWorkout();
      
    } 
    catch (error) 
    {
      console.error('Eroare la inițializarea bazei de date SQLite:', error);
    }
  }

  async saveTemplates() 
  {
    await this.dbReady;
    if (!this.isDbReady) 
    {
      console.warn('saveTemplates sărit: baza de date nu este gata.');
      return;
    }
    try {
      await this.db.execute('DELETE FROM templates');
      for (const workout of this.workouts) {
        const dataStr = JSON.stringify(workout);
        await this.db.query('INSERT INTO templates (id, data) VALUES (?, ?)', [workout.id, dataStr]);
      }
      console.log('Template-urile au fost salvate cu succes.');
    } catch (error) {
      console.error('Eroare la salvarea template-urilor:', error);
    }
  }

  async loadTemplates() {
    if (!this.isDbReady) {
      console.warn('loadTemplates sărit: baza de date nu este gata.');
      return;
    }
    try 
    {
      const res = await this.db.query('SELECT data FROM templates');
      if (res.values && res.values.length > 0) {
        this.workouts = res.values.map(row => JSON.parse(row.data));
        console.log(`S-au încărcat ${this.workouts.length} template-uri.`);
      } else {
        console.log(' Nu există template-uri salvate.');
      }
    } catch (error) {
      console.error('Eroare la încărcarea template-urilor:', error);
    }
  }

  async loadHistory() {
    if (!this.isDbReady) {
      console.warn('loadHistory sărit: baza de date nu este gata.');
      return;
    }
    try {
      console.log('Se încarcă istoricul antrenamentelor...');
      const res = await this.db.query('SELECT data FROM history ORDER BY startTime ASC');
      if (res.values && res.values.length > 0) {
        this.workoutHistory = res.values.map(row => JSON.parse(row.data));
        console.log(`S-au încărcat ${this.workoutHistory.length} intrări în istoric.`);
      } else {
        console.log('Istoricul de antrenamente este gol.');
      }
    } catch (error) {
      console.error('Eroare la încărcarea istoricului:', error);
    }
  }

  async addWorkoutToHistoryDB(workout: ActiveWorkout) 
  {
    await this.dbReady;
    if (!this.isDbReady) return;
    try {
      const dataStr = JSON.stringify(workout);
      await this.db.query(
        'INSERT INTO history (id, startTime, data) VALUES (?, ?, ?)',
        [workout.id, workout.startTime, dataStr]
      );
      console.log('Antrenament nou adăugat în istoric cu succes.');
    } catch (error) {
      console.error('Eroare la salvarea antrenamentului nou în SQLite:', error);
    }
  }

  startWorkout(templateName: string, muscleGroupsTemplate: MuscleGroup[]) 
  {
      const generateId = () => '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

      const clonedGroups: WorkoutMuscleGroup[] = muscleGroupsTemplate.map(mg => ({
        id: generateId(),
        name: mg.name,
        isCustom: false,
        isCompleted: false,
        exercises: mg.exercises.map(ex => ({
          id: generateId(),
          name: ex.name,
          isCustom: false,
          isCompleted: false,
          sets: [] 
        }))
      }));

      this.currentActiveWorkout = {
        id: generateId(),
        name: templateName,
        startTime: Date.now(),
        muscleGroups: clonedGroups
      };

      this.saveActiveWorkout();
      
      console.log('Workout pornit cu succes:', templateName);
    }

  async endWorkout() 
  {
    if (this.currentActiveWorkout) {
      this.currentActiveWorkout.endTime = Date.now();
      this.currentActiveWorkout.durationSeconds = Math.floor((this.currentActiveWorkout.endTime - this.currentActiveWorkout.startTime) / 1000);
    
      this.workoutHistory.push(this.currentActiveWorkout);
      await this.addWorkoutToHistoryDB(this.currentActiveWorkout);
      await this.clearActiveWorkout();
      console.log('Workout încheiat și salvat.');
      this.currentActiveWorkout = null;
    }
  }

  async saveActiveWorkout() 
  {
  await this.dbReady;
  if (!this.isDbReady || !this.currentActiveWorkout) return;
  try {
    await this.db.execute('DELETE FROM active_workout');
    await this.db.query(
      'INSERT INTO active_workout (id, data) VALUES (?, ?)',
      ['current', JSON.stringify(this.currentActiveWorkout)]
    );
  } catch (error) {
    console.error('Eroare la salvarea antrenamentului activ:', error);
  }
}

async loadActiveWorkout() 
{
  if (!this.isDbReady) return;
  try {
    const res = await this.db.query('SELECT data FROM active_workout WHERE id = ?', ['current']);
    if (res.values && res.values.length > 0) {
      this.pendingActiveWorkout = JSON.parse(res.values[0].data);
    }
  } catch (error) {
    console.error('Eroare la încărcarea antrenamentului activ:', error);
  }
}

async clearActiveWorkout() 
{
  await this.dbReady;
  if (!this.isDbReady) return;
  try {
    await this.db.execute('DELETE FROM active_workout');
  } catch (error) {
    console.error('Eroare la ștergerea antrenamentului activ:', error);
  }
}

resumeActiveWorkout() 
{
  if (this.pendingActiveWorkout) {
    this.currentActiveWorkout = this.pendingActiveWorkout;
    this.pendingActiveWorkout = null;
  }
}

async discardActiveWorkout() 
{
  this.pendingActiveWorkout = null;
  await this.clearActiveWorkout();
}

async clearAllData() 
{
  await this.dbReady;
  if (!this.isDbReady) return;
  try 
  {
    await this.db.execute('DELETE FROM templates');
    await this.db.execute('DELETE FROM history');
    await this.db.execute('DELETE FROM active_workout');

    this.workouts = [];
    this.workoutHistory = [];
    this.currentActiveWorkout = null;
    this.pendingActiveWorkout = null;

    console.log('Toate datele au fost șterse.');
  } 
  catch (error) 
  {
    console.error('Eroare la ștergerea tuturor datelor:', error);
  }
}
}