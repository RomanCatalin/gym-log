import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type ThemeOption = 'dark' | 'light';

const KEYS = {
  theme: 'pref_theme',
  restTimeSeconds: 'pref_rest_time_seconds',
  dataBackupEnabled: 'pref_data_backup_enabled',
  dataIntervalDays: 'pref_data_interval_days',
  alertEnabled: 'pref_alert_enabled',
  soundEnabled: 'pref_sound_enabled',
  vibrationEnabled: 'pref_vibration_enabled',
  notificationEnabled: 'pref_notification_enabled',
};

@Injectable({ providedIn: 'root' })
export class PreferencesService 
{

  theme: ThemeOption = 'dark';
  restTimeSeconds = 180;
  dataIntervalDays = 7;
  dataBackupEnabled = true;
  alertEnabled = false;
  soundEnabled = false;
  vibrationEnabled = false;
  notificationEnabled = false;

  public ready: Promise<void>;

  constructor() 
  {
    this.ready = this.loadAll();
  }

  private async loadAll() 
  {
    try 
    {
      const [theme, restTime, dataInterval, dataBackup, alert, sound, vibration, notification] = await Promise.all
      ([
        Preferences.get({ key: KEYS.theme }),
        Preferences.get({ key: KEYS.restTimeSeconds }),
        Preferences.get({ key: KEYS.dataIntervalDays}),
        Preferences.get({ key: KEYS.dataBackupEnabled}),
        Preferences.get({ key: KEYS.alertEnabled }),
        Preferences.get({ key: KEYS.soundEnabled }),
        Preferences.get({ key: KEYS.vibrationEnabled }),
        Preferences.get({ key: KEYS.notificationEnabled }),
      ]);

    if (theme.value) this.theme = theme.value as ThemeOption;

    if (restTime.value !== null) {
      const parsed = parseInt(restTime.value, 10);
      if (!isNaN(parsed)) this.restTimeSeconds = parsed;
    }

    if (dataInterval.value !== null) {
      const parsed = parseInt(dataInterval.value, 10);
      if (!isNaN(parsed)) this.dataIntervalDays = parsed;
    }

    if (dataBackup.value !== null) this.dataBackupEnabled = dataBackup.value === 'true';
    if (alert.value !== null) this.alertEnabled = alert.value === 'true';
    if (sound.value !== null) this.soundEnabled = sound.value === 'true';
    if (vibration.value !== null) this.vibrationEnabled = vibration.value === 'true';
    if (notification.value !== null) this.notificationEnabled = notification.value === 'true';
    } 
    catch (error) 
    {
      console.error('[Preferences] Eroare la încărcarea preferințelor:', error);
    }
  }

  async setTheme(value: ThemeOption) {
    this.theme = value;
    await Preferences.set({ key: KEYS.theme, value });
  }

  async setRestTimeSeconds(value: number) {
    this.restTimeSeconds = value;
    await Preferences.set({ key: KEYS.restTimeSeconds, value: value.toString() });
  }

  async setDataIntervalDays(value: number) {
    this.dataIntervalDays = value;
    await Preferences.set({ key: KEYS.dataIntervalDays, value: value.toString() });
  }

  async setDataBackupEnabled(value: boolean) {
    this.dataBackupEnabled = value;
    await Preferences.set({ key: KEYS.dataBackupEnabled, value: value.toString() });
  }

  async setAlertEnabled(value: boolean) {
    this.alertEnabled = value;
    await Preferences.set({ key: KEYS.alertEnabled, value: value.toString() });
  }

  async setSoundEnabled(value: boolean) {
    this.soundEnabled = value;
    await Preferences.set({ key: KEYS.soundEnabled, value: value.toString() });
  }

  async setVibrationEnabled(value: boolean) {
    this.vibrationEnabled = value;
    await Preferences.set({ key: KEYS.vibrationEnabled, value: value.toString() });
  }

  async setNotificationEnabled(value: boolean) {
    this.notificationEnabled = value;
    await Preferences.set({ key: KEYS.notificationEnabled, value: value.toString() });
  }
}