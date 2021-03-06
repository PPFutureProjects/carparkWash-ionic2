import { Component } from '@angular/core';
import { ToastController, LoadingController, LoadingOptions, MenuController } from 'ionic-angular';
import { CarParkService } from '../shared/car-park.service';
import { CarParkModel } from '../shared/car-park.model';
import { CarService } from '../../car/shared/car.service';
import { CarModel } from '../../car/shared/car.model';
import { CarParkFilterModel } from '../car-park-filter/car-park-filter.model';
import { UtilsPage } from '../../shared/utils.page';

@Component({
  selector: 'page-car-park-list',
  templateUrl: 'car-park-list.html',
})
export class CarParkListPage extends UtilsPage {

  selectedCar: CarModel;
  carParks: Array<CarParkModel>;

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

  constructor(public carParkService: CarParkService, public carService: CarService,
              public toastCtrl: ToastController, public loadingCtrl: LoadingController, public menuCtrl: MenuController) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.selectedCar = this.carService.selectedCar;
  }

  ionViewWillEnter() {
    //if (!this.selectedCar) {
    //  this.router.navigate(['']);
    //} else {
    this.carParkService.getAll()
      .then(carParks => {
        this.carParks = carParks;
        if (this.carParks.length === 0) {
          this.showToast('No Car Parks added yet', 'toastError');
        }
      })
      .catch(err => {
        console.log(err);
        this.showToast('Error getting Car parks, please contact admin', 'toastError');
      });
    //}
  }

  getCarParksFilter(carParkFilterModel: CarParkFilterModel) {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.carParkService.getFiltered(carParkFilterModel)
      .then(carParks => {
        this.carParks = carParks;
        if (this.carParks.length === 0) {
          this.showToast('No Car Parks found', 'toastError');
        }
        loading.dismissAll();
      })
      .catch(err => {
        loading.dismissAll();
        console.log(err);
        this.showToast('Error getting Car parks, please contact admin', 'toastError');
      });
  }

}
