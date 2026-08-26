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

  constructor() {
    console.log('🚀 [WorkoutService] Constructor apelat');
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.initDatabase();
  }

  async initDatabase() {
    try {
      console.log('[DB] Se încearcă crearea conexiunii SQLite...');
      this.db = await this.sqlite.createConnection('fitness_db', false, 'no-encryption', 1, false);
      
      console.log('[DB] Se deschide baza de date...');
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
      `;
      
      console.log('⏳ [DB] Se execută schema tabelelor...');
      await this.db.execute(schema);
      
      this.isDbReady = true;
      console.log('[DB] Baza de date este pregătită (isDbReady = true)');

      await this.loadTemplates();
      await this.loadHistory();
      
    } catch (error) {
      console.error('[DB] Eroare critică la inițializarea bazei de date SQLite:', error);
    }
  }

  async saveTemplates() {
    if (!this.isDbReady) {
      console.warn('[DB] saveTemplates sărit: baza de date nu este gata.');
      return;
    }
    try {
      await this.db.execute('DELETE FROM templates');
      for (const workout of this.workouts) {
        const dataStr = JSON.stringify(workout);
        await this.db.query('INSERT INTO templates (id, data) VALUES (?, ?)', [workout.id, dataStr]);
      }
      console.log('[DB] Template-urile au fost salvate cu succes.');
    } catch (error) {
      console.error('[DB] Eroare la salvarea template-urilor:', error);
    }
  }

  async loadTemplates() {
    if (!this.isDbReady) {
      console.warn('⚠️ [DB] loadTemplates sărit: baza de date nu este gata.');
      return;
    }
    try {
      console.log('⏳ [DB] Se încarcă template-urile...');
      const res = await this.db.query('SELECT data FROM templates');
      if (res.values && res.values.length > 0) {
        this.workouts = res.values.map(row => JSON.parse(row.data));
        console.log(`[DB] S-au încărcat ${this.workouts.length} template-uri.`);
      } else {
        console.log('[DB] Nu există template-uri salvate.');
      }
    } catch (error) {
      console.error('[DB] Eroare la încărcarea template-urilor:', error);
    }
  }

  async loadHistory() {
    if (!this.isDbReady) {
      console.warn('[DB] loadHistory sărit: baza de date nu este gata.');
      return;
    }
    try {
      console.log('[DB] Se încarcă istoricul antrenamentelor...');
      const res = await this.db.query('SELECT data FROM history ORDER BY startTime ASC');
      if (res.values && res.values.length > 0) {
        this.workoutHistory = res.values.map(row => JSON.parse(row.data));
        console.log(`[DB] S-au încărcat ${this.workoutHistory.length} intrări în istoric.`);
      } else {
        console.log('[DB] Istoricul de antrenamente este gol.');
      }
    } catch (error) {
      console.error('[DB] Eroare la încărcarea istoricului:', error);
    }
  }

  async addWorkoutToHistoryDB(workout: ActiveWorkout) {
    if (!this.isDbReady) return;
    try {
      const dataStr = JSON.stringify(workout);
      await this.db.query(
        'INSERT INTO history (id, startTime, data) VALUES (?, ?, ?)',
        [workout.id, workout.startTime, dataStr]
      );
      console.log('[DB] Antrenament nou adăugat în istoric cu succes.');
    } catch (error) {
      console.error('[DB] Eroare la salvarea antrenamentului nou în SQLite:', error);
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
      
      console.log('🏋️‍♂️ [Workout] Antrenament pornit cu succes:', templateName);
    }

  endWorkout() {
    if (this.currentActiveWorkout) {
      this.currentActiveWorkout.endTime = Date.now();
      this.currentActiveWorkout.durationSeconds = Math.floor((this.currentActiveWorkout.endTime - this.currentActiveWorkout.startTime) / 1000);
    
      this.workoutHistory.push(this.currentActiveWorkout);
      this.addWorkoutToHistoryDB(this.currentActiveWorkout);
      console.log('🏁 [Workout] Antrenament încheiat și salvat.');
      this.currentActiveWorkout = null;
    }
  }
}