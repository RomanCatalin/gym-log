import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonItem, IonReorder, IonReorderGroup, ModalController, ActionSheetController, IonButton } from '@ionic/angular/standalone';
import { ItemReorderEventDetail } from '@ionic/core';
import { addIcons } from 'ionicons';
import { addOutline, close, checkmark, trashBinOutline } from 'ionicons/icons';
import { WorkoutService, CycleSlot } from 'src/app/services/workout-service';
import { REST_DAY_COLOR } from 'src/app/shared/constants/workout-colors';

@Component({
  selector: 'app-split-editor',
  standalone: true,
  imports: [CommonModule, IonIcon, IonItem, IonReorder, IonReorderGroup, IonButton],
  templateUrl: './split-editor.component.html',
})
export class SplitEditorComponent implements OnInit {
  workoutService = inject(WorkoutService);
  private modalController = inject(ModalController);
  private actionSheetController = inject(ActionSheetController);

  slots: CycleSlot[] = [];
  deleteMode = false;
  restColor = REST_DAY_COLOR;
  readonly MAX_SLOTS = 7;

  constructor() {
    addIcons({ trashBinOutline, addOutline, close, checkmark });
  }

  ngOnInit() {
    this.slots = this.workoutService.cycle ? [...this.workoutService.cycle.slots] : [];
  }

  getSlotLabel(slot: CycleSlot): string {
    if (slot.type === 'rest') return 'REST';
    const wk = this.workoutService.workouts.find(w => w.id === slot.workoutId);
    return wk ? wk.name : 'UNKNOWN';
  }

  getSlotColor(slot: CycleSlot): string {
    if (slot.type === 'rest') return this.restColor;
    const wk = this.workoutService.workouts.find(w => w.id === slot.workoutId);
    return wk?.color || this.restColor;
  }

  toggleDeleteMode() 
  {
    this.deleteMode = !this.deleteMode;
  }

  onCardTap(index: number) 
  {
    if (this.deleteMode) 
      {
      this.slots.splice(index, 1);
    }
  }

  handleReorder(event: CustomEvent<ItemReorderEventDetail>) {
    this.slots = event.detail.complete(this.slots);
  }

  async addSlot() 
  {
    if (this.slots.length >= this.MAX_SLOTS) return;

    const buttons: any[] = this.workoutService.workouts.map(wk => ({
      text: wk.name,
      handler: () => {
        this.slots.push({ type: 'workout', workoutId: wk.id });
      },
    }));

    buttons.push({
      text: 'REST',
      handler: () => {
        this.slots.push({ type: 'rest' });
      },
    });

    buttons.push({ text: 'CANCEL', role: 'cancel' });

    const actionSheet = await this.actionSheetController.create({
      cssClass: 'custom-action-sheet-cycle',
      buttons,
    });

    await actionSheet.present();
  }

  cancel() 
  {
    this.modalController.dismiss({ saved: false });
  }

  async save() 
  {
    await this.modalController.dismiss({ saved: true, slots: this.slots });
  }
}