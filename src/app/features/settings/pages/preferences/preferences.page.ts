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

  async ngOnInit() 
  {
    await this.preferencesService.ready;
    this.restMinutes = Math.floor(this.preferencesService.restTimeSeconds / 60);
    this.restSeconds = this.preferencesService.restTimeSeconds % 60;
  }

  preferencesService = inject(PreferencesService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  restMinutes: number | null = 0;
  restSeconds: number | null = 0;



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

  onRestMinutesInput(event: any) 
  {
    let value = event.target.value.replace(/\D/g, '').slice(0, 2);

    event.target.value = value;
    this.restMinutes = value ? Number(value) : null;
  }

  onRestSecondsInput(event: any) 
  {
    let value = event.target.value.replace(/\D/g, '').slice(0, 2);

    let seconds = value ? Number(value) : null;

    if (seconds !== null && seconds > 59) 
    {
      seconds = 59;
      value = '59';
    }

    event.target.value = value;
    this.restSeconds = seconds;
  }

  onRestTimeBlur() 
  {
    const minutes = this.restMinutes ?? 0;
    const seconds = this.restSeconds ?? 0;
    this.preferencesService.setRestTimeSeconds(minutes * 60 + seconds);
  }

}
