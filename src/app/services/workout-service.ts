import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { inject } from '@angular/core';
import { PreferencesService } from './preferences-service';
import {Preferences} from '@capacitor/preferences';
import { REST_DAY_COLOR } from 'src/app/shared/constants/workout-colors';

export interface Exercise { id: string; name: string; }
export interface MuscleGroup { id: string; name: string; exercises: Exercise[]; }
export interface Workout { id: string; name: string; muscleGroups: MuscleGroup[]; color?: string;}

export interface WorkoutSet { reps: number | null; weight: number | null; }
export interface WorkoutExercise { id: string; name: string; isCustom: boolean; isCompleted: boolean; sets: WorkoutSet[]; }
export interface WorkoutMuscleGroup { id: string; name: string; isCustom: boolean; isCompleted: boolean; exercises: WorkoutExercise[]; }
export interface ActiveWorkout { id: string; name: string; startTime: number; endTime?: number; durationSeconds?: number; muscleGroups: WorkoutMuscleGroup[]; }

export interface CycleSlot {  type: 'workout' | 'rest'; workoutId?: string;}
export interface Cycle {  slots: CycleSlot[]; anchorDate: number;}

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

  private preferencesService = inject(PreferencesService);
  private readonly BACKUP_FILE_NAME = 'gym-log-backup.json';

  cycle: Cycle | null = null;

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
      await this.loadCycle();
      this.maybeAutoBackup();
      
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
      if (res.values && res.values.length > 0) 
      {
        this.workouts = res.values.map(row => JSON.parse(row.data));
        console.log(`S-au încărcat ${this.workouts.length} template-uri.`);
      } 
      else 
      {
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

async cancelActiveWorkout() 
{
  await this.clearActiveWorkout();
  this.currentActiveWorkout = null;
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

async saveHistory() 
{
  await this.dbReady;
  if (!this.isDbReady) return;
  try {
    await this.db.execute('DELETE FROM history');
    for (const workout of this.workoutHistory) {
      await this.db.query(
        'INSERT INTO history (id, startTime, data) VALUES (?, ?, ?)',
        [workout.id, workout.startTime, JSON.stringify(workout)]
      );
    }
  } catch (error) {
    console.error('[Backup] Eroare la salvarea istoricului:', error);
  }
}

async createBackup() {
  await this.dbReady;
  if (!this.isDbReady) return;
  try {
    const payload = {
      version: 1,
      createdAt: Date.now(),
      workouts: this.workouts,
      workoutHistory: this.workoutHistory,
    };
    await Filesystem.writeFile({
      path: this.BACKUP_FILE_NAME,
      data: JSON.stringify(payload),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    });
    await this.preferencesService.setLastBackupAt(Date.now());
    console.log('[Backup] Backup creat cu succes.');
  } catch (error) {
    console.error('[Backup] Eroare la crearea backup-ului:', error);
  }
}

async getBackupFileUri(): Promise<string> {
  const result = await Filesystem.getUri({ path: this.BACKUP_FILE_NAME, directory: Directory.Data });
  return result.uri;
}

async restoreFromBackup(backupData: { workouts?: Workout[]; workoutHistory?: ActiveWorkout[] }) {
  await this.dbReady;
  if (!this.isDbReady) return;
  this.workouts = backupData.workouts || [];
  this.workoutHistory = backupData.workoutHistory || [];
  await this.saveTemplates();
  await this.saveHistory();
}

async maybeAutoBackup() {
  await this.preferencesService.ready;
  if (!this.preferencesService.dataBackupEnabled) return;

  const intervalMs = this.preferencesService.dataIntervalDays * 24 * 60 * 60 * 1000;
  if (Date.now() - this.preferencesService.lastBackupAt >= intervalMs) {
    await this.createBackup();
  }
}

getLastSetForExercise(exerciseName: string): WorkoutSet | null {
  const normalizedName = exerciseName.toUpperCase().trim();

  const sortedHistory = [...this.workoutHistory].sort((a, b) => b.startTime - a.startTime);

  for (const workout of sortedHistory) {
    for (const group of workout.muscleGroups) {
      for (const exercise of group.exercises) {
        if (exercise.name.toUpperCase().trim() !== normalizedName) continue;
        if (exercise.sets.length > 0) {
          return exercise.sets[exercise.sets.length - 1];
        }
      }
    }
  }

  return null;
}

async getShareableBackupUri(): Promise<string> 
{
  const payload = {
    version: 1,
    createdAt: Date.now(),
    workouts: this.workouts,
    workoutHistory: this.workoutHistory,
  };
  await Filesystem.writeFile({
    path: this.BACKUP_FILE_NAME,
    data: JSON.stringify(payload),
    directory: Directory.Cache,
    encoding: Encoding.UTF8,
  });
  const result = await Filesystem.getUri({ path: this.BACKUP_FILE_NAME, directory: Directory.Cache });
  return result.uri;
}

async loadCycle() {
  try {
    const res = await Preferences.get({ key: 'workout_cycle' });
    if (res.value) {
      this.cycle = JSON.parse(res.value);
    }
  } catch (error) {
    console.error('[Cycle] Eroare la încărcare:', error);
  }
}

async saveCycle(cycle: Cycle) {
  this.cycle = cycle;
  await Preferences.set({ key: 'workout_cycle', value: JSON.stringify(cycle) });
}

async restartCycleAtSlot(slotIndex: number) {
  if (!this.cycle) return;
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const newAnchor = todayMidnight.getTime() - slotIndex * 24 * 60 * 60 * 1000;
  this.cycle.anchorDate = newAnchor;
  await this.saveCycle(this.cycle);
}

getCycleSlotIndexForDate(date: Date): number | null {
  if (!this.cycle || this.cycle.slots.length === 0) return null;
  const dayMidnight = new Date(date);
  dayMidnight.setHours(0, 0, 0, 0);
  const anchorMidnight = new Date(this.cycle.anchorDate);
  anchorMidnight.setHours(0, 0, 0, 0);
  const diffDays = Math.round((dayMidnight.getTime() - anchorMidnight.getTime()) / (24 * 60 * 60 * 1000));
  const len = this.cycle.slots.length;
  return ((diffDays % len) + len) % len;
}

getCycleSlotForDate(date: Date): CycleSlot | null {
  const index = this.getCycleSlotIndexForDate(date);
  if (index === null || !this.cycle) return null;
  return this.cycle.slots[index];
}
getWorkoutColor(workoutName: string): string {
  const template = this.workouts.find(w => w.name.toUpperCase() === workoutName.toUpperCase());
  return template?.color || REST_DAY_COLOR;
}

getHistoryForDate(date: Date): ActiveWorkout[] {
  const dayStr = date.toDateString();
  return this.workoutHistory.filter(w => new Date(w.startTime).toDateString() === dayStr);
}

getWorkoutColorById(workoutId: string | undefined): string {
  if (!workoutId) return REST_DAY_COLOR;
  const wk = this.workouts.find(w => w.id === workoutId);
  return wk?.color || REST_DAY_COLOR;
}

}