import { Component } from '@angular/core';
import { LoadingOptions, ToastController, ModalController, LoadingController } from 'ionic-angular';
import { FormGroup, FormBuilder } from '@angular/forms';
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
import { Region } from '../car-park/car-park-filter/region.enum';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { AnnouncementService } from '../shared/announcement.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage extends AbstractPage {

  user: UserModel;
  carParks: Array<CarParkModel>;
  announcement: string;

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

  announcementForm: FormGroup;
  announcementFormErrors = {
    announcement: '',
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public carService: CarService,
              public carParkService: CarParkService, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController, public modalCtrl: ModalController,
              public messageService: ValidationMessageService, public formBuilder: FormBuilder,
              public announcementService: AnnouncementService) {

    super(toastCtrl);
    this.user = new UserModel();
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.buildForms();
  }

  ionViewDidEnter() {
    // by passing Swiper not found on angular2-useful-swiper
    new Swiper('.swip', {});
  }

  ionViewWillEnter() {
    let loadingUser = this.loadingCtrl.create(this.loadingOptions);
    loadingUser.present();
    this.userService.getCurrent(true).then(user => {
      this.user = user;
      loadingUser.dismiss();
    }).catch(err => {
      loadingUser.dismiss();
      console.error(err);
      this.showToast('Fail to get your profile data', 'toastError');
    });
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.announcementService.get().then(announcement => {
      this.announcement = announcement;
      this.buildForms();
      console.log(announcement);
      loading.dismiss();
    }).catch(err => {
      loading.dismiss();
      console.error(err);
      this.showToast('Fail to get announcement, Please contact admin', 'toastError');
    });
  }

  resetAnnouncement() {
    this.buildForms();
  }

  saveAnnouncement() {
    this.announcementService.set(this.announcementForm.value.announcement)
      .then(() => {
        this.announcement = this.announcementForm.value.announcement;
        this.showToast('Announcement saved', 'toastInfo');
      })
      .catch(err => {
        console.log(err);
        this.showToast(err.message, 'toastError');
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
    editCarParkPage.onDidDismiss((newCarPark: {carpark: CarParkModel, region: Region, area: string}) => {
      if (newCarPark && newCarPark.carpark) {
        newCarPark.carpark.userUid = this.user.uid;
        newCarPark.carpark.region = newCarPark.region;
        newCarPark.carpark.area = newCarPark.area;
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carParkService.add(this.user, newCarPark.carpark).then(() => {
          loading.dismissAll();
          this.showToast(`The car ${newCarPark.carpark.name} added successfully`, 'toastInfo');
        }).catch(err => {
          loading.dismissAll();
          console.error(err);
          this.showToast(`Fail to add ${newCarPark.carpark.name}`, 'toastError');
        });
      }
    });
    editCarParkPage.present();
  }

  private buildForms() {
    this.announcementForm = this.formBuilder.group({
      announcement: [this.announcement],
    });
    this.announcementForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.announcementForm, this.announcementFormErrors);
    });
    this.messageService.onValueChanged(this.announcementForm, this.announcementFormErrors);
  }
}
