import { Component, OnInit } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  async ngOnInit() {
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setStyle({ style: Style.Dark });
      await EdgeToEdge.setBackgroundColor({ color: '#191919' });
    }
  }
}