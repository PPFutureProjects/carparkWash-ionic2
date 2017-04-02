import { Component, Input } from '@angular/core';
import { CarModel } from '../shared/car.model';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { CarParkModel } from '../../car-park/shared/car-park.model';

@Component({
  selector: 'job-item',
  templateUrl: 'job-item.html'
})
export class JobItemComponent {

  @Input() car: CarModel;
  private carParkSubscribed: CarParkModel;
  private dayIndex: number;

  constructor(public carParkService: CarParkService) {
  }

  ngAfterContentInit() {
    this.carParkService.getById(this.car.subscription.carParkId).then(carPark => {
      this.carParkSubscribed = carPark;
    });
    this.dayIndex = Math.round((new Date().getTime() - this.car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
  }
}
