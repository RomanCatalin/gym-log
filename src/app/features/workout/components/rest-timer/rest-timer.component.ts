import { Component, inject } from '@angular/core';
import { RestTimerService } from 'src/app/services/rest-timer-service';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-rest-timer',
  templateUrl: './rest-timer.component.html',
  styleUrls: ['./rest-timer.component.scss'],
  imports: [IonButton],
})
export class RestTimerComponent 
{
  restTimerService = inject(RestTimerService);

  skipRest() 
  {
    this.restTimerService.skipRest();
  }
}
