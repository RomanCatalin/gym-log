import { Component, inject, OnInit } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit 
{
  
  async ngOnInit() 
  {
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setStyle({ style: Style.Dark });
      await EdgeToEdge.setBackgroundColor({ color: '#191919' });
      await EdgeToEdge.setNavigationBarColor({ color: '#191919' });
      await this.setupNotificationChannels();
    }
  }

  private async setupNotificationChannels() 
  {
    try 
    {
      await LocalNotifications.createChannel({
        id: 'rest_sound_1',
        name: 'Rest Timer — Sound 1',
        importance: 5,
        sound: 'rest_sound_1.wav',
        vibration: true,
        visibility: 1,
      });
      await LocalNotifications.createChannel({
        id: 'rest_silent',
        name: 'Rest Timer — Silent',
        importance: 3,
        vibration: false,
        visibility: 1,
      });
    } 
    catch (error) 
    {
      console.error('[Channels] Eroare la crearea canalelor:', error);
    }
  }
}