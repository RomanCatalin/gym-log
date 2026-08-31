import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonIcon, AlertController, IonToggle, IonSelect, IonSelectOption} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { returnUpBackOutline } from 'ionicons/icons';
import { WorkoutService } from 'src/app/services/workout-service';
import { PreferencesService } from 'src/app/services/preferences-service';

@Component({
  selector: 'app-databackup',
  templateUrl: './databackup.page.html',
  styleUrls: ['./databackup.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonIcon, IonToggle, IonSelect, IonSelectOption]
})
export class DatabackupPage implements OnInit {

  constructor() 
  { 
    addIcons({ returnUpBackOutline });
  }

  ngOnInit() {
  }

  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private alertController = inject(AlertController);
  preferencesService = inject(PreferencesService);
  
  
  dataIntervalOptions = 
  [
    { label: 'DAILY', value: 1 },
    { label: 'WEEKLY', value: 7 },
    { label: 'MONTHLY', value: 30 },
    { label: 'QUARTERLY', value: 90 },
    { label: 'YEARLY', value: 365 },
  ];

  goBack() 
  {
    this.router.navigate(['/settings']);
  }

  onDataIntervalChange(event: any) 
  {
    this.preferencesService.setDataIntervalDays(event.detail.value);
  }

  onDataBackupToggle(event: any) 
  {
    this.preferencesService.setDataBackupEnabled(event.detail.checked);
  }

  async confirmClearData() 
  {
    const alert = await this.alertController.create({
      header: 'Clear All Data',
      message: 'This will permanently delete all workout templates, history, and any in-progress workout. This cannot be undone.',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear Data',
          handler: () => {
            this.workoutService.clearAllData();
          }
        }
      ]
    });
    await alert.present();
  }


}
