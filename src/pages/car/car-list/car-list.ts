import { Component } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { CarService } from '../../car/car.service';
import { CarModel } from '../../car/car.model';
import { CarParkModel } from '../../car-park/car-park.model';
import { CarParkService } from '../../car-park/car-park.service';
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
    slidesPerView: 4,
    //slidesPerColumn: 3,
    spaceBetween: 30,
    //grabCursor: true,
    centeredSlides: false,
    //loop: true,
    //autoplay: 5000,
    //autoplayDisableOnInteraction: false,
    paginationClickable: true,
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
  };


  constructor(public carParkService: CarParkService, public carService: CarService, public toastCtrl: ToastController) {
    super(toastCtrl);
    this.selectedCarPark = this.carParkService.selectedCarPark;
  }

  ionViewWillEnter() {
    //if (!this.selectedCarPark) {
    //  this.router.navigate(['']);
    //} else {
    this.carService.getByCarPark(this.carParkService.selectedCarPark)
      .then((subscriptions: Array<SubscriptionModel>) => this.subscriptions = subscriptions)
      .catch(err => {
        console.log(err);
        this.showToast('Error getting Cars, please contact admin', 'toastError');
      });
    //}
  }

}
