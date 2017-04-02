import { Component, ViewChild } from '@angular/core';
import {
  LoadingOptions, ToastController, ModalController, LoadingController, NavParams, Loading,
  MenuController
} from 'ionic-angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UserModel } from '../user/shared/user.model';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { ProfileEnum } from '../user/shared/profile.enum';
import { UserService } from '../user/shared/user.service';
import { CarParkService } from '../car-park/shared/car-park.service';
import { CarService } from '../car/shared/car.service';
import { UtilsPage } from '../shared/utils.page';
import { EditCarPage } from '../car/edit-car/edit-car';
import { CarModel } from '../car/shared/car.model';
import { EditCarParkPage } from '../car-park/edit-car-park/edit-car-park';
import { CarParkFilterModel } from '../car-park/car-park-filter/car-park-filter.model';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { SwiperComponent } from 'angular2-useful-swiper/lib/swiper.component';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends UtilsPage {

  currentUser: UserModel;
  carParks: Array<CarParkModel>;

  profileTypeEnum = ProfileEnum;
  configCarousel = {
    slidesPerView: 1,
    spaceBetween: 10,
    //grabCursor: true,
    centeredSlides: true,
    // loop: true,
    // autoplay: 5000,
    // autoplayDisableOnInteraction false,
    paginationClickable: true,
    pagination: '.swiper-pagination',
    // nextButton: '.swiper-button-next',
    // prevButton: '.swiper-button-prev',
  };

  @ViewChild('usefulSwiper') usefulSwiper: SwiperComponent;

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public carService: CarService,
              public carParkService: CarParkService, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController, public modalCtrl: ModalController,
              public messageService: ValidationMessageService, public formBuilder: FormBuilder) {

    super(toastCtrl);
    this.currentUser = new UserModel();
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    //TODO test if this is OK
    this.userService.getCurrent(false).then(user => {
      this.currentUser = user;
      if (this.currentUser.profile == ProfileEnum.admin) {
        this.getAllCarParks(loading);
      } else {
        loading.dismissAll();
      }
    }).catch(err => {
      console.error(err);
      loading.dismissAll();
      this.showToast('Fail to get user data', 'toastError');
    });
    // this.userService.getCurrent(false).then(user => {
    //   if (!this.user.email) {
    //     this.user = user;
    //   }
    //
    //   if (this.carService.selectedCar) {
    //     for (let car of this.user.cars) {
    //       if (car.id === this.carService.selectedCar.id) {
    //         car.subscription = this.carService.selectedCar.subscription;
    //         break;
    //       }
    //     }
    //     this.eventBus.updateCarItem(true);
    //   }
    //   this.carService.selectedCar = undefined;
    //   loading.dismiss();
    // }).catch(err => {
    //   console.error(err);
    //   loading.dismiss();
    //   this.showToast('Fail to get user data', 'toastError');
    // });
  }

  private getAllCarParks(loading: Loading) {
    return this.carParkService.getAll()
      .then(allCarParks => {
        this.carParks = allCarParks;
        loading.dismissAll();
      })
      .catch(err => {
        console.error(err);
        loading.dismissAll();
        this.showToast('Fail to load car parks', 'toastError');
      });
  }

  getCarParksFilter(carParkFilterModel: CarParkFilterModel) {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.carParkService.getFiltered(carParkFilterModel)
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

  /**
   * Add car or car park
   */
  add() {
    if (this.currentUser.profile === ProfileEnum.client) {
      this.addCar();
      // this.currentUser.profile === ProfileEnum.manager ||
    } else if (this.currentUser.profile === ProfileEnum.admin) {
      this.addCarPark();
    }
  }


  removeCarPark(carPark) {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.carParkService.remove(carPark).then(data => {
      console.log(data);
      this.updateUserFromDatabase(`The car park ${carPark.code} was removed successfully`, loading);
    }).catch(err => {
      loading.dismissAll();
      console.log(err);
      this.showToast(`Could not remove the car park ${carPark.code}, please contact admin`, 'toastError');
    });
  }

  removeCar(car) {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.carService.remove(car)
      .then(() => {
        this.updateUserFromDatabase(`The car ${car.licencePlateNumber} was removed successfully`, loading);
      })
      .catch(err => {
        console.log(err);
        loading.dismissAll();
        this.showToast(`Could not remove the car ${car.licencePlateNumber}, please contact admin`, 'toastError');
      });

  }

  /**
   * Called after car or carpark is deleted
   */
  private updateUserFromDatabase(toastMsg: string, loading: Loading) {
    if (this.currentUser.profile === ProfileEnum.admin) {
      this.getAllCarParks(loading).then(() => {
        this.usefulSwiper.Swiper.slidePrev();
        this.showToast(toastMsg, 'toastInfo');
      }).catch(err => {
        loading.dismissAll();
        console.log(err);
        this.showToast(`Fatal Error, please contact admin`, 'toastError');
      });
    } else {
      this.userService.getCurrent(false).then(user => {
        this.currentUser = user;
        loading.dismissAll();
        this.usefulSwiper.Swiper.slidePrev();
        this.showToast(toastMsg, 'toastError');
      }).catch(err => {
        loading.dismissAll();
        console.log(err);
        this.showToast(`Fatal Error, please contact admin`, 'toastError');
      });
    }
  }

  addCar() {
    let editCarPage = this.modalCtrl.create(EditCarPage);
    editCarPage.onDidDismiss((newCar: CarModel) => {
      if (newCar) {
        newCar.userUid = this.currentUser.uid;
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carService.add(this.currentUser, newCar).then(() => {
          this.usefulSwiper.Swiper.slideNext();
          loading.dismissAll();
          this.showToast(`The car ${newCar.licencePlateNumber} added successfully`, 'toastInfo');
        }).catch(err => {
          loading.dismissAll();
          console.error(err);
          this.showToast(`Fail to add ${newCar.licencePlateNumber}`, 'toastError');
        });
      }
    });
    editCarPage.present();
  }

  private addCarPark() {
    let editCarParkPage = this.modalCtrl.create(EditCarParkPage);
    editCarParkPage.onDidDismiss((newCarPark: {carPark: CarParkModel, manager: UserModel}) => {
      if (newCarPark) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carParkService.add(newCarPark).then(() => {
          if (this.currentUser.profile === ProfileEnum.admin) {
            if (!this.carParks) {
              this.carParks = new Array<CarParkModel>();
            }
            this.carParks.push(newCarPark.carPark);
          }
          this.usefulSwiper.Swiper.slideNext();
          loading.dismissAll();
          this.showToast(`The car ${newCarPark.carPark.code} added successfully`, 'toastInfo');
        }).catch(err => {
          loading.dismissAll();
          console.error(err);
          this.showToast(`Fail to add ${newCarPark.carPark.code}`, 'toastError');
        });
      }
    });
    editCarParkPage.present();
  }

}
