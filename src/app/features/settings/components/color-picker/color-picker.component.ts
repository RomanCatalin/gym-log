import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverController } from '@ionic/angular/standalone';
import { WORKOUT_COLOR_PALETTE } from 'src/app/shared/constants/workout-colors';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './color-picker.component.html',
})
export class ColorPickerComponent 
{
  colors = WORKOUT_COLOR_PALETTE;
  private popoverController = inject(PopoverController);

  pick(color: string) {
    this.popoverController.dismiss(color);
  }
}