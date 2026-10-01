import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PopoverController } from '@ionic/angular/standalone';

export interface PickerItem {
  name: string;
  logo?: string;
}

@Component({
  selector: 'app-brand-picker',
  templateUrl: './brand-picker.component.html',
  styleUrls: ['./brand-picker.component.scss'],
  imports: [CommonModule],
})
export class BrandPickerComponent{

  constructor() { }
  @Input() items: PickerItem[] = [];
  @Input() title = '';

  private popoverController = inject(PopoverController);

  pick(name: string) 
  {
    this.popoverController.dismiss(name);
  }

  pickOther() 
  {
    this.popoverController.dismiss('OTHER');
  }

  cancel() 
  {
    this.popoverController.dismiss('CANCEL');
  }
}
