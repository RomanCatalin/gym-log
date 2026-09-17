import { Injectable, inject, NgZone } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PreferencesService } from './preferences-service';

@Injectable({ providedIn: 'root' })
export class RestTimerService {

  private preferencesService = inject(PreferencesService);
  private ngZone = inject(NgZone);

  isResting = false;
  restTimeDisplay = '';

  private restEndsAt: number | null = null;
  private restInterval: any;
  private restNotificationId: number | null = null;

  async startRestTimer()
   {
    const seconds = this.preferencesService.restTimeSeconds;
    if (!seconds || seconds <= 0) return;

    clearInterval(this.restInterval);
    if (this.restNotificationId !== null) 
    { 
      try 
      { 
        await LocalNotifications.cancel({ notifications: [{ id: this.restNotificationId }] }); 
      } 
      catch (error) 
      { 
        console.error( '[RestTimer] Eroare la anularea notificării anterioare:', error ); 
      } 

      this.restNotificationId = null; 
    }

    this.isResting = true;
    this.restEndsAt = Date.now() + seconds * 1000;
    this.updateRestDisplay();

    this.restInterval = setInterval(() => {
      this.ngZone.run(() => {
        this.updateRestDisplay();
      });
    }, 1000);

    if (this.preferencesService.alertEnabled) 
    {
      const channelId = this.preferencesService.soundEnabled ? 'rest_sound_1' : 'rest_silent';

      this.restNotificationId = Math.floor(Math.random() * 1000000);
      const notificationId = this.restNotificationId;

      try 
      {
        await LocalNotifications.schedule({
          notifications: [{
            id: notificationId,
            title: 'Rest complete!',
            body: 'Time to start your next set.',
            channelId,
            autoCancel: true,
            schedule: { at: new Date(Date.now() + seconds * 1000), allowWhileIdle: true }
          }]
        });
      } 
      catch (error) 
      {
        console.error('[RestTimer] Eroare la programarea notificării:', error);
      }
    }
  }

  private updateRestDisplay() 
  {
    if (!this.restEndsAt) return;
    const remainingMs = this.restEndsAt - Date.now();
    const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

    const minutes = Math.floor(remainingSec / 60).toString().padStart(2, '0');
    const seconds = (remainingSec % 60).toString().padStart(2, '0');
    this.restTimeDisplay = `${minutes}:${seconds}`;

    if (remainingSec <= 0) {
      this.finishRestTimer();
    }
  }

  private finishRestTimer() 
  {
    clearInterval(this.restInterval);
    this.isResting = false;
    this.restEndsAt = null;
    this.restNotificationId = null;
    this.restTimeDisplay = '';
  }

  async skipRest() 
  {
    clearInterval(this.restInterval);
    this.isResting = false;
    this.restEndsAt = null;
    this.restTimeDisplay = '';

    if (this.restNotificationId !== null) 
    {
      try 
      {
        await LocalNotifications.cancel({ notifications: [{ id: this.restNotificationId }] });
      } 
      catch (error) 
      {
        console.error('[RestTimer] Eroare la anularea notificării:', error);
      }
      this.restNotificationId = null;
    }
  }
}