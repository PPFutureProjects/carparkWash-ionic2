import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';
import { CarModel } from '../shared/car.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { CarParkSgApiModel } from '../../car-park/shared/car-park-sg-api.model';

@Component({
  selector: 'page-subscription',
  templateUrl: 'subscription.html'
})
export class SubscriptionPage {

  car: CarModel;
  searchCarPark: string | CarParkSgApiModel = <any>{address: ''};
  carPark: CarParkModel;
  isActifSubscription: boolean;
  lotNumber: number;

  constructor(public viewCtrl: ViewController, public params: NavParams, public domSanitizer: DomSanitizer,
              public carParkService: CarParkService) {
    this.car = params.get('carToSubscribe');
    this.isActifSubscription = params.get('isActifSubscription');
    params.get('carParkSubscribed') ? this.carPark = params.get('carParkSubscribed') : '';
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SupscribtionPage');
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
    // this.searchCarPark = (<CarParkSgApiModel>this.searchCarPark).address;
  }

  getCarParks() {
    return this.carParkService.getByAddressAutocompletion(<string>this.searchCarPark);
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  confirm() {
    //TODO verifie if car park exist
    this.viewCtrl.dismiss({carPark: this.carPark, lotNumber: this.lotNumber});
  }

}
