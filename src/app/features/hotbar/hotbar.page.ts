import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonTabs, IonLabel, IonTabButton, IonTabBar, IonRouterOutlet} from '@ionic/angular/standalone';


@Component({
  selector: 'app-hotbar',
  templateUrl: './hotbar.page.html',
  styleUrls: ['./hotbar.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonTabs, IonLabel, IonTabButton, IonTabBar, IonRouterOutlet]
})
export class HotbarPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
