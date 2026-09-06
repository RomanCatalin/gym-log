import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon, IonSelectOption, IonSelect, IonToggle, AlertController, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { returnUpBackOutline, playOutline} from 'ionicons/icons';
import { Router } from '@angular/router';
import { PreferencesService } from 'src/app/services/preferences-service';
import { LocalNotifications } from '@capacitor/local-notifications';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.page.html',
  styleUrls: ['./preferences.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonIcon, IonSelect, IonSelectOption, IonToggle, IonButton]
})
export class PreferencesPage implements OnInit {

  constructor() 
  {
    addIcons({ returnUpBackOutline, playOutline });
  }

  async ngOnInit() {
    await this.preferencesService.ready;
  }
  preferencesService = inject(PreferencesService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  restTimeOptions = 
  [
    { label: '5 SECONDS', value: 5 },
    { label: '30 SECONDS', value: 30 },
    { label: '1 MINUTE', value: 60 },
    { label: '1:30 MINUTES', value: 90 },
    { label: '2 MINUTES', value: 120 },
    { label: '3 MINUTES', value: 180 },
    { label: '5 MINUTES', value: 300 },
  ];

  goBack() {
    this.router.navigate(['/settings']);
  }

  onThemeChange(event: any) {
    this.preferencesService.setTheme(event.detail.value);
  }

  onRestTimeChange(event: any) {
    this.preferencesService.setRestTimeSeconds(event.detail.value);
  }

  async onAlertToggle(event: any) {
    const enabled = event.detail.checked;
    this.preferencesService.setAlertEnabled(enabled);

    if (enabled) {
      const result = await LocalNotifications.requestPermissions();
      if (result.display !== 'granted') {
        this.preferencesService.setAlertEnabled(false);
        await this.showPermissionDeniedAlert();
      }
    }
  }

  onSoundToggle(event: any) {
    this.preferencesService.setSoundEnabled(event.detail.checked);
  }

  private async showPermissionDeniedAlert() {
    const alert = await this.alertController.create({
      header: 'Permission refused',
      message: 'For notifications to be received at the end of rests, please allow notifications permission in your phone settings.',
      buttons: ['OK'],
      cssClass: 'custom-alert', 
    });

    await alert.present();
  }

}
