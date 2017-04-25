import { Component } from '@angular/core';
import { NavParams, ViewController, ToastController } from 'ionic-angular';
import { CarModel } from '../shared/car.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { CarParkSgApiModel } from '../../car-park/shared/car-park-sg-api.model';
import { UtilsPage } from '../../shared/utils.page';

@Component({
  selector: 'page-subscription',
  templateUrl: 'subscription.html'
})
export class SubscriptionPage extends UtilsPage {

  car: CarModel;
  carPark: CarParkModel;
  lotNumber: string;

  constructor(public viewCtrl: ViewController, public params: NavParams, public toastCtrl: ToastController) {

    super(toastCtrl);
    this.car = params.get('carToSubscribe');
    params.get('carParkSubscribed') ? this.carPark = params.get('carParkSubscribed') : '';
    if (this.car.subscription) {
      let dayIndex = Math.round((new Date().getTime() - this.car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
      this.lotNumber = this.car.subscription.days[dayIndex].carParkLotNumber;
    }
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  confirm() {
    this.viewCtrl.dismiss(this.lotNumber);
  }

}
