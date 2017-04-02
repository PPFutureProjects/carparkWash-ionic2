import { Component } from '@angular/core';
import { ToastController, LoadingController, LoadingOptions, MenuController } from 'ionic-angular';
import { CarService } from '../shared/car.service';
import { CarModel } from '../shared/car.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { UtilsPage } from '../../shared/utils.page';

@Component({
  selector: 'page-car-list',
  templateUrl: 'car-list.html',
})
export class CarListPage extends UtilsPage {

  selectedCarPark: CarParkModel;
  cars: Array<CarModel>;
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

  private loadingOptions: LoadingOptions;

  constructor(public carService: CarService, public carParkService: CarParkService, public toastCtrl: ToastController,
              public loadingCtrl: LoadingController) {
    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.cars = Array<CarModel>();
    this.selectedCarPark = this.carParkService.selectedCarPark;
  }

  ionViewWillEnter() {
    //if (!this.selectedCarPark) {
    //  this.router.navigate(['']);
    //} else {

    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.carService.getByIds(this.idsToArray(this.carParkService.selectedCarPark.subscriptionIds))
      .then(cars => {
        loading.dismissAll();
        this.cars = cars;
      })
      .catch(err => {
        console.log(err);
        loading.dismissAll();
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
    //}
  }

  idsToArray(ids) {
    return Object.keys(ids ? ids : []);
  }
}
