import { Component, ViewChild } from '@angular/core';
import { LoadingOptions, ToastController, ModalController, LoadingController, Loading } from 'ionic-angular';
import { UserModel } from '../user/shared/user.model';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { ProfileEnum } from '../user/shared/profile.enum';
import { UserService } from '../user/shared/user.service';
import { CarParkService } from '../car-park/shared/car-park.service';
import { UtilsPage } from '../shared/utils.page';
import { CarModel } from '../car/shared/car.model';
import { EditCarParkPage } from '../car-park/edit-car-park/edit-car-park';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { SwiperComponent } from 'angular2-useful-swiper/lib/swiper.component';
import { CarParkSgApiModel } from '../car-park/shared/car-park-sg-api.model';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { NotificationListPage } from '../notification/notification-list/notification-list';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends UtilsPage {

  currentUser: UserModel;
  carParks: Array<CarParkModel>;

  selectedCarParkWorkingOn: CarParkModel;
  searchCarPark: string | CarParkSgApiModel = new CarParkSgApiModel();

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

  constructor(public userService: UserService, public carParkService: CarParkService, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController, public modalCtrl: ModalController, public messageService: ValidationMessageService,
              public domSanitizer: DomSanitizer) {

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

    this.userService.getCurrent(false).then(user => {
      this.currentUser = user;
      if (this.currentUser.profile == ProfileEnum.washer && this.currentUser.workingCarPark) {
        (<CarParkSgApiModel>this.searchCarPark)._id = Number(this.currentUser.workingCarPark.id);
        (<CarParkSgApiModel>this.searchCarPark).address = this.currentUser.workingCarPark.address;
        (<CarParkSgApiModel>this.searchCarPark).car_park_no = this.currentUser.workingCarPark.code;
        (<CarParkSgApiModel>this.searchCarPark).x_coord = this.currentUser.workingCarPark.x;
        (<CarParkSgApiModel>this.searchCarPark).y_coord = this.currentUser.workingCarPark.y;
      }
      if (this.currentUser.profile == ProfileEnum.manager) {
        this.getAllCarParks(loading);
      } else {
        loading.dismissAll();
      }
    }).catch(err => {
      console.error(err);
      loading.dismissAll();
      this.showToast('Fail to get user data', 'toastError');
    });
  }

  carParkSelected() {
    this.selectedCarParkWorkingOn = new CarParkModel();
    this.selectedCarParkWorkingOn.id = String((<CarParkSgApiModel>this.searchCarPark)._id);
    this.selectedCarParkWorkingOn.code = (<CarParkSgApiModel>this.searchCarPark).car_park_no;
    this.selectedCarParkWorkingOn.address = (<CarParkSgApiModel>this.searchCarPark).address;
    this.selectedCarParkWorkingOn.x = (<CarParkSgApiModel>this.searchCarPark).x_coord;
    this.selectedCarParkWorkingOn.y = (<CarParkSgApiModel>this.searchCarPark).y_coord;
    if (this.selectedCarParkWorkingOn.id && this.selectedCarParkWorkingOn.id !== 'undefined') {
      this.updateWasherWorkingCarPark();
    }
  }

  getCarParks() {
    return this.carParkService.getByAddressAutocompletion(<string>this.searchCarPark);
  }

  getCarParkAddress = (carPark: any): SafeHtml => {
    let html = `<span>${carPark.address}</span>`;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  };

  updateWasherWorkingCarPark() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.updateWasherWorkingCarPark(this.currentUser, this.selectedCarParkWorkingOn)
      .then(() => {
        loading.dismissAll();
        this.showToast(`Data updated`, 'toastInfo');
      })
      .catch(err => {
        loading.dismissAll();
        console.error(err);
        this.showToast(`Fail to update date`, 'toastError');
      });
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

  showNotifications() {
    this.modalCtrl.create(NotificationListPage).present();
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

  /**
   * Called after car or carpark is deleted
   */
  private updateUserFromDatabase(toastMsg: string, loading: Loading) {
    if (this.currentUser.profile === ProfileEnum.manager) {
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

  private addCarPark() {
    let editCarParkPage = this.modalCtrl.create(EditCarParkPage);
    editCarParkPage.onDidDismiss((newCarPark: {carPark: CarParkModel, supervisor: UserModel}) => {
      if (newCarPark) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carParkService.add(newCarPark).then(() => {
          if (this.currentUser.profile === ProfileEnum.manager) {
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
