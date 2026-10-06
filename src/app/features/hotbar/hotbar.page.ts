import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonTabs, IonLabel, IonTabButton, IonTabBar, IonRouterOutlet} from '@ionic/angular/standalone';
import { RestTimerComponent } from '../workout/components/rest-timer/rest-timer.component';
import {PreferencesService} from 'src/app/services/preferences-service';


@Component({
  selector: 'app-hotbar',
  templateUrl: './hotbar.page.html',
  styleUrls: ['./hotbar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonTabs, IonLabel, IonTabButton, IonTabBar, IonRouterOutlet, RestTimerComponent]
})
export class HotbarPage implements OnInit 
{

  constructor() { }

  ngOnInit() {}

  preferencesService = inject(PreferencesService);

}
