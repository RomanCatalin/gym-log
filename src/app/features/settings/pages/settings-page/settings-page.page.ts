import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.page.html',
  styleUrls: ['./settings-page.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, IonButton]
})
export class SettingsPagePage implements OnInit 
{
  private router = inject(Router);
  constructor() { }

  ngOnInit() { }

  goToWorkoutTemplates() {
    this.router.navigate(['/settings/workout-templates']);
  }
}