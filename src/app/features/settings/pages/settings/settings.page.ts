import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton]
})
export class SettingsPage implements OnInit 
{
  private router = inject(Router);
  constructor() { }

  ngOnInit() { }

  goToWorkoutTemplates() 
  {
    this.router.navigate(['/workout-templates']);
  }

  goToPreferences() 
  {
    this.router.navigate(['/preferences']);
  }

  goToDataBackup()
  {
    this.router.navigate(['/databackup']);
  }
}