import { Component, inject, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, ToastController, IonButton, IonIcon, AlertController, IonToggle, IonSelect, IonSelectOption} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { returnUpBackOutline, shareSocialOutline } from 'ionicons/icons';
import { WorkoutService } from 'src/app/services/workout-service';
import { PreferencesService } from 'src/app/services/preferences-service';
import { Share } from '@capacitor/share';
import { FilePicker } from '@capawesome/capacitor-file-picker';

@Component({
  selector: 'app-databackup',
  templateUrl: './databackup.page.html',
  styleUrls: ['./databackup.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton, IonIcon, IonToggle, IonSelect, IonSelectOption]
})
export class DatabackupPage implements OnInit {

  constructor() 
  { 
    addIcons({ returnUpBackOutline, shareSocialOutline });
  }

  ngOnInit() {
  }

  private router = inject(Router);
  private workoutService = inject(WorkoutService);
  private alertController = inject(AlertController);
  preferencesService = inject(PreferencesService);
  private ngZone = inject(NgZone);
  private toastController = inject(ToastController);
  
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

async backupNow() {
  try 
  {
    await this.workoutService.createBackup();
    const toast = await this.toastController.create({
      message: 'Backup saved',
      duration: 2500,
      position: 'bottom',
      positionAnchor: 'hotbar-id',
      cssClass: 'custom-toast',
    });
    await toast.present();
  } 
  catch (error) 
  {
    console.error('[Backup] Eroare la backup manual:', error);
  }
}

async share()
{
  try 
  {
    const uri = await this.workoutService.getShareableBackupUri(); 
    await Share.share({ title: 'Gym Log — Backup', files: [uri] }); 
  } 
  catch (error) 
  {
    console.error('[Backup] Eroare la share:', error);
  }
}

async importData() {
  try {
    const result = await FilePicker.pickFiles({ readData: true });
    const file = result.files?.[0];
    if (!file || !file.data) return;

    const jsonText = atob(file.data);
    const parsed = JSON.parse(jsonText);

    if (!parsed.workouts || !parsed.workoutHistory) {
      throw new Error('Format de fișier invalid.');
    }

    const alert = await this.alertController.create({
      header: 'Import Data?',
      message: 'This will replace all current templates and workout history with the data from this backup. This cannot be undone.',
      cssClass: 'custom-alert',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Import',
          handler: () => {
            this.ngZone.run(async () => {
              await this.workoutService.restoreFromBackup(parsed);
            });
          }
        }
      ]
    });
    await alert.present();
  } catch (error) {
    console.error('[Import] Eroare la importul datelor:', error);
    const errorAlert = await this.alertController.create({
      header: 'Import Failed',
      message: 'The selected file could not be read as a valid backup.',
      cssClass: 'custom-alert',
      buttons: ['OK'],
    });
    await errorAlert.present();
  }
}


}
