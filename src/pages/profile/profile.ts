import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastController, LoadingController, LoadingOptions, ModalController } from 'ionic-angular';
import * as Swiper from 'swiper';
import { UserService } from '../user/user.service';
import { UserModel } from '../user/user.model';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { CarModel } from '../car/car.model';
import { CarService } from '../car/car.service';
import { ProfileTypeEnum } from '../shared/profile-type.enum';
import { CarParkService } from '../car-park/car-park.service';
import { CarParkModel } from '../car-park/car-park.model';
import { AbstractPage } from '../shared/abstract.page';
import { EditCarPage } from '../car/edit-car/edit-car';
import { EditCarParkPage } from '../car-park/edit-car-park/edit-car-park';
import { GlobalValidator } from '../shared/validator/global.validator';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage extends AbstractPage {

  user: UserModel;
  editMode = false;
  allCarParks: Array<CarParkModel>;

  profileTypeEnum = ProfileTypeEnum;
  profileForm: FormGroup;
  formErrors = {
    email: '',
    name: '',
    address: '',
    phoneNumber: ''
  };
  configCarousel = {
    slidesPerView: 1,
    spaceBetween: 30,
    //grabCursor: true,
    centeredSlides: false,
    loop: true,
    // autoplay: 5000,
    // autoplayDisableOnInteraction false,
    paginationClickable: true,
    pagination: '.swiper-pagination',
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public carService: CarService,
              public carParkService: CarParkService, public messageService: ValidationMessageService,
              public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController, public modalCtrl: ModalController) {

    super(toastCtrl);
    this.user = new UserModel();
    this.editMode = false;
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };

    this.buildProfileForm(true);
    this.carParkService.getAll()
      .then(allCarParks => this.allCarParks = allCarParks)
      .catch(err => {
        console.error(err);
        this.showToast('Fail to load car parks', 'toastError');
      });
  }

  ionViewDidEnter() {
    // by passing Swiper not found on angular2-useful-swiper
    new Swiper ('.swip', {})
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.getCurrent(true).then(user => {
      this.user = user;
      loading.dismissAll();
      if (!this.user.profile) {
        alert('users must have always a profile type');
        //this.dialog.open(SelectTypeDialog, <MdDialogConfig>{
        //  disableClose: true
        //}).afterClosed().subscribe(userProfile => {
        //  if (userProfile) {
        //    let loading = this.loadingCtrl.create(this.loadingOptions);
        //    loading.present();
        //    this.user.profile = userProfile;
        //    this.userService.updateUserInfo(this.user).then(() => {
        //      loading.dismissAll();
        //      this.showToast('Type account has been saved', 'toastInfo');
        //    }).catch(err => {
        //      loading.dismissAll();
        //      console.error(err);
        //      this.showToast('Fail to update your password', 'toastError');
        //    });
        //  }
        //});
      }
    }).catch(err => {
      loading.dismissAll();
      console.error(err);
      this.showToast('Fail to get your profile data', 'toastError');
    });
  }

  toggleEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.buildProfileForm(!editMode);
  }

  add() {
    if (this.user.profile === ProfileTypeEnum.client) {
      this.addCar();
    } else if (this.user.profile === ProfileTypeEnum.manager) {
      this.addCarPark();
    }
  }

  changePassword() {
    //FIXME to move from here to setting
    //this.dialog.open(ChangePasswordDialog, <MdDialogConfig>{
    //  disableClose: true
    //}).afterClosed().subscribe(newPassword => {
    //  if (newPassword) {
    //    this.userService.updatePassword(newPassword)
    //      .then(() => {
    //        this.showToast('Password has been successfully updated', 'toastInfo');
    //      })
    //      .catch(err => {
    //        console.error(err);
    //        this.showToast('Fail to update your password', 'toastError');
    //      });
    //  }
    //});
  }

  save() {
    this.user.email = this.profileForm.value.email;
    this.user.name = this.profileForm.value.name;
    this.user.address = this.profileForm.value.address;
    this.user.phoneNumber = this.profileForm.value.phoneNumber;
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.updateUserInfo(this.user).then(() => {
      this.editMode = false;
      loading.dismissAll();
      this.showToast('Profile has been successfully updated', 'toastInfo');
    }).catch(err => {
      this.editMode = false;
      loading.dismissAll();
      console.error(err);
      this.showToast('Fail to update your profile', 'toastError');
    });
  }

  updateUserFromDatabase() {
    this.userService.getCurrent(false).then(user => {
      this.user = user;
    });
  }

  private buildProfileForm(isDisabled: boolean) {
    this.profileForm = this.formBuilder.group({
      email: [{value: this.user.email, disabled: isDisabled},
        Validators.compose([Validators.required,
          GlobalValidator.mailFormat,
          Validators.maxLength(this.messageService.maxLengthEmail)])],
      name: [{value: this.user.name, disabled: isDisabled},
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      address: [{value: this.user.address, disabled: isDisabled},
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthAddress),
          Validators.maxLength(this.messageService.maxLengthAddress)])],
      phoneNumber: [{value: this.user.phoneNumber, disabled: isDisabled},
        Validators.pattern(/\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)
      ],
    });
    this.profileForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.formErrors));
    this.messageService.onValueChanged(this.profileForm, this.formErrors);
    this.editMode = !isDisabled;
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
