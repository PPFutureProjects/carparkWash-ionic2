import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { CarService } from '../shared/car.service';
import { CarModel } from '../shared/car.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';
import { AbstractPage } from '../../shared/abstract.page';

@Component({
  selector: 'page-car-list',
  templateUrl: 'car-list.html',
})
export class CarListPage extends AbstractPage {

  selectedCarPark: CarParkModel;
  cars: Array<CarModel>;
  subscriptions: Array<SubscriptionModel>;
  configCarousel = {
    slidesPerView: 1,
    //slidesPerColumn: 3,
    spaceBetween: 10,
    //grabCursor: true,
    centeredSlides: true,
    // loop: true,
    //autoplay: 5000,
    //autoplayDisableOnInteraction: false,
    paginationClickable: true,
    pagination: '.swiper-pagination',
    // nextButton: '.swiper-button-next',
    // prevButton: '.swiper-button-prev',
  };


  constructor(public carParkService: CarParkService, public carService: CarService, public toastCtrl: ToastController) {
    super(toastCtrl);
    this.selectedCarPark = this.carParkService.selectedCarPark;
  }

  ionViewWillEnter() {
    //if (!this.selectedCarPark) {
    //  this.router.navigate(['']);
    //} else {
    this.subscriptions = this.carParkService.selectedCarPark.subscriptions;
    //}
  }

}
