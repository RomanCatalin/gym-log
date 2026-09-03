import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonSelectOption, IonSelect, IonToggle, AlertController, IonButton } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { returnUpBackOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { PreferencesService } from 'src/app/services/preferences-service';
import { WorkoutService } from 'src/app/services/workout-service';

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
    addIcons({ returnUpBackOutline });
  }

  async ngOnInit() {
    await this.preferencesService.ready;
  }
  preferencesService = inject(PreferencesService);
  private workoutService = inject(WorkoutService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  restTimeOptions = 
  [
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

  onAlertToggle(event: any) {
    this.preferencesService.setAlertEnabled(event.detail.checked);
  }

  onSoundToggle(event: any) {
    this.preferencesService.setSoundEnabled(event.detail.checked);
  }

  onVibrationToggle(event: any) {
    this.preferencesService.setVibrationEnabled(event.detail.checked);
  }

  onNotificationToggle(event: any) {
    this.preferencesService.setNotificationEnabled(event.detail.checked);
  }


}
