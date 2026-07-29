import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTab, IonTitle, IonToolbar, IonTabs, IonIcon, IonLabel, IonTabButton, IonTabBar, IonRouterOutlet} from '@ionic/angular/standalone';


@Component({
  selector: 'app-hotbar',
  templateUrl: './hotbar.page.html',
  styleUrls: ['./hotbar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonTab, IonTabs, IonIcon, IonLabel, IonTabButton, IonTabBar, IonRouterOutlet]
})
export class HotbarPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
