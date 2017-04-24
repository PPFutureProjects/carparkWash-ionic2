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
  searchCarPark: string | CarParkSgApiModel = <any>{address: ''};
  carPark: CarParkModel;
  isActifSubscription: boolean;
  lotNumber: string;

  constructor(public viewCtrl: ViewController, public params: NavParams, public domSanitizer: DomSanitizer,
              public carParkService: CarParkService, public toastCtrl: ToastController) {

    super(toastCtrl);
    this.car = params.get('carToSubscribe');
    this.isActifSubscription = params.get('isActifSubscription');
    params.get('carParkSubscribed') ? this.carPark = params.get('carParkSubscribed') : '';
    if (this.car.subscription) {
      let dayIndex = Math.round((new Date().getTime() - this.car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
      this.lotNumber = this.car.subscription.days[dayIndex].carParkLotNumber;
    }
  }

  getCarParkAddress = (carPark: any): SafeHtml => {
    let html = `<span>${carPark.address}</span>`;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  };

  carParkSelected() {
    this.carPark = new CarParkModel();
    this.carPark.id = String((<CarParkSgApiModel>this.searchCarPark)._id);
    this.carPark.code = (<CarParkSgApiModel>this.searchCarPark).car_park_no;
    this.carPark.address = (<CarParkSgApiModel>this.searchCarPark).address;
    this.carPark.x = (<CarParkSgApiModel>this.searchCarPark).x_coord;
    this.carPark.y = (<CarParkSgApiModel>this.searchCarPark).y_coord;
  }

  getCarParks() {
    return this.carParkService.getByAddressAutocompletion(<string>this.searchCarPark);
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  confirm() {
    this.carParkService.getById(this.carPark.id)
      .then(carpark => {
        if (carpark) {
          this.viewCtrl.dismiss({carPark: this.carPark, lotNumber: this.lotNumber});
        } else {
          this.showToast(`The Car Park ${this.carPark.address} is not added yet`, 'toastError');
        }
      });
  }

}
