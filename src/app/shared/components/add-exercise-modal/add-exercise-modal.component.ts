import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSelect, IonSelectOption, IonButton, ModalController, PopoverController, IonIcon } from '@ionic/angular/standalone';
import { EXERCISES_BY_GROUP } from 'src/app/shared/constants/exercise-database';
import { EQUIPMENT_BRANDS, CABLE_ATTACHMENTS } from 'src/app/shared/constants/equipment-database';
import { BrandPickerComponent } from '../brand-picker/brand-picker.component';
import { addIcons } from 'ionicons';
import { checkmark, close} from 'ionicons/icons';

@Component({
  selector: 'app-add-exercise-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonSelect, IonSelectOption, IonButton, IonIcon],
  templateUrl: './add-exercise-modal.component.html',
})
export class AddExerciseModalComponent {
  @Input() muscleGroupName = '';
  @Input() existingExerciseNames: string[] = [];

  private modalController = inject(ModalController);
  private popoverController = inject(PopoverController);

  brandOptions = EQUIPMENT_BRANDS;
  attachmentOptions = CABLE_ATTACHMENTS;

  selectedName = '';
  selectedBrand = '';
  customBrand = '';
  isCustomBrand = false;
  selectedAttachment = '';
  customAttachment = '';
  isCustomAttachment = false;

  constructor() 
  {
    addIcons({ checkmark, close });
  }

  get availableExercises(): string[] 
  {
    const groupName = this.muscleGroupName.toUpperCase().trim();
    const all = EXERCISES_BY_GROUP[groupName] || [];
    return all;
  }

  async openBrandPicker(event: Event) {
    const popover = await this.popoverController.create({
      component: BrandPickerComponent,
      componentProps: { items: this.brandOptions, title: 'Select Brand' },
      alignment: 'center',
      cssClass: 'equipment-picker-popover',
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    if(data === 'CANCEL')
    {  
      this.selectedBrand = '';
      this.isCustomBrand = false;
      this.customBrand = '';
    }
    else if (data === 'OTHER') 
    {
      this.isCustomBrand = true;
      this.selectedBrand = '';
    } 
    else if (data) 
    {
      this.isCustomBrand = false;
      this.customBrand = '';
      this.selectedBrand = data;
    }
  }

  async openAttachmentPicker(event: Event) {
    const popover = await this.popoverController.create({
      component: BrandPickerComponent,
      componentProps: { items: this.attachmentOptions, title: 'Select Attachment' },
      event,
      cssClass: 'equipment-picker-popover',
    });
    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data === 'OTHER') {
      this.isCustomAttachment = true;
      this.selectedAttachment = '';
    } else if (data) {
      this.isCustomAttachment = false;
      this.customAttachment = '';
      this.selectedAttachment = data;
    }
  }

  get finalBrand(): string 
  {
    return this.selectedBrand;
  }

  get finalAttachment(): string 
  {
    return this.selectedAttachment;
  }

  get selectedBrandLogo(): string | undefined 
  {
    if (!this.selectedBrand) 
    {
      return undefined;
    }

  return EQUIPMENT_BRANDS.find(brand => brand.name === this.selectedBrand)?.logo;
  }

  cancel() {
    this.modalController.dismiss(null);
  }

  confirm() {
    if (!this.selectedName) return;
    this.modalController.dismiss({
      name: this.selectedName,
      equipmentBrand: this.finalBrand || undefined,
      attachment: this.finalAttachment || undefined,
    });
  }
}