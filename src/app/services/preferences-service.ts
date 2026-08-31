import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export type ThemeOption = 'dark' | 'light';

const KEYS = {
  theme: 'pref_theme',
  restTimeSeconds: 'pref_rest_time_seconds',
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
      const [theme, restTime, alert, sound, vibration, notification] = await Promise.all([
        Preferences.get({ key: KEYS.theme }),
        Preferences.get({ key: KEYS.restTimeSeconds }),
        Preferences.get({ key: KEYS.alertEnabled }),
        Preferences.get({ key: KEYS.soundEnabled }),
        Preferences.get({ key: KEYS.vibrationEnabled }),
        Preferences.get({ key: KEYS.notificationEnabled }),
      ]);

      if (theme.value) this.theme = theme.value as ThemeOption;
      if (restTime.value) this.restTimeSeconds = parseInt(restTime.value, 10);
      if (alert.value) this.alertEnabled = alert.value === 'true';
      if (sound.value) this.soundEnabled = sound.value === 'true';
      if (vibration.value) this.vibrationEnabled = vibration.value === 'true';
      if (notification.value) this.notificationEnabled = notification.value === 'true';
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