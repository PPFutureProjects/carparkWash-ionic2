import { Component } from '@angular/core';
import { LoadingOptions, ToastController, ModalController, LoadingController } from 'ionic-angular';
import * as Swiper from 'swiper';
import { UserModel } from '../user/user.model';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { ProfileEnum } from '../shared/profile.enum';
import { UserService } from '../user/user.service';
import { CarParkService } from '../car-park/shared/car-park.service';
import { CarService } from '../car/shared/car.service';
import { AbstractPage } from '../shared/abstract.page';
import { EditCarPage } from '../car/edit-car/edit-car';
import { CarModel } from '../car/shared/car.model';
import { EditCarParkPage } from '../car-park/edit-car-park/edit-car-park';
import { CarParkFilterModel } from '../car-park/car-park-filter/car-park-filter.model';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends AbstractPage {

  user: UserModel;
  carParks: Array<CarParkModel>;

  profileTypeEnum = ProfileEnum;
  configCarousel = {
    slidesPerView: 1,
    spaceBetween: 30,
    //grabCursor: true,
    centeredSlides: false,
    //loop: true,
    // autoplay: 5000,
    // autoplayDisableOnInteraction false,
    paginationClickable: true,
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public carService: CarService,
              public carParkService: CarParkService, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController, public modalCtrl: ModalController) {

    super(toastCtrl);
    this.user = new UserModel();
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
  }

  ionViewDidEnter() {
    // by passing Swiper not found on angular2-useful-swiper
    new Swiper('.swip', {});
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.getCurrent(true).then(user => {
      this.user = user;
      loading.dismissAll();
    }).catch(err => {
      loading.dismissAll();
      console.error(err);
      this.showToast('Fail to get your profile data', 'toastError');
    });
  }

  getCarParksFilter(carParkFilterModel: CarParkFilterModel) {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.carParkService.getByAreas(carParkFilterModel)
      .then(carParks => {
        this.carParks = carParks;
        loading.dismissAll();
      })
      .catch(err => {
        console.log(err);
        loading.dismissAll();
        this.showToast('Error getting Car parks, please contact admin', 'toastError');
      });
  }

  add() {
    if (this.user.profile === ProfileEnum.client) {
      this.addCar();
    } else if (this.user.profile === ProfileEnum.manager) {
      this.addCarPark();
    }
  }

  updateUserFromDatabase() {
    this.userService.getCurrent(false).then(user => {
      this.user = user;
    });
  }

  private addCar() {
    let editCarPage = this.modalCtrl.create(EditCarPage);
    editCarPage.onDidDismiss((newCar: CarModel) => {
      if (newCar) {
        newCar.userUid = this.user.uid;
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carService.add(this.user, newCar).then(() => {
          loading.dismissAll();
          this.showToast('Add selected Car success', 'toastInfo');
        }).catch(err => {
          loading.dismissAll();
          console.error(err);
          this.showToast('Fail to add selectedCar', 'toastError');
        });
      }
    });
    editCarPage.present();
  }

  private addCarPark() {
    let editCarParkPage = this.modalCtrl.create(EditCarParkPage);
    editCarParkPage.onDidDismiss((newCarPark: CarParkModel) => {
      if (newCarPark) {
        newCarPark.userUid = this.user.uid;
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carParkService.add(this.user, newCarPark).then(() => {
          loading.dismissAll();
          this.showToast('Add selectedCar park success', 'toastInfo');
        }).catch(err => {
          loading.dismissAll();
          console.error(err);
          this.showToast('Fail to add selectedCar park', 'toastError');
        });
      }
    });
    editCarParkPage.present();
  }

}
