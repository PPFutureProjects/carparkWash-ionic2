import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  ToastController,
  LoadingController,
  LoadingOptions,
  ModalController,
  ActionSheetController, MenuController
} from 'ionic-angular';
import { UserService } from '../user/shared/user.service';
import { UserModel, ProviderEnum } from '../user/shared/user.model';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { UtilsPage } from '../shared/utils.page';
import { GlobalValidator } from '../shared/validator/global.validator';
import { Camera } from 'ionic-native';
import { ChangePasswordPage } from './change-password/change-password';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage extends UtilsPage {

  currentUser: UserModel;
  editMode = false;
  isPictureLoading = false;
  selectedPicture: string;

  providerTypeEnum = ProviderEnum;
  profileForm: FormGroup;
  formErrors = {
    email: '',
    name: '',
    address: '',
    phoneNumber: '',
    sex: '',
    dateOfBirth: '',
    nricNo: '',
    race: '',
    age: '',
    bankAccountDetails: '',
    accountNumber: ''
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public messageService: ValidationMessageService,
              public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController, public modalCtrl: ModalController,
              public actionSheetCtrl: ActionSheetController, public menuCtrl: MenuController) {

    super(toastCtrl);
    this.currentUser = new UserModel();
    this.editMode = false;
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.buildProfileForm(false);
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.getCurrent(true).then(user => {
      this.currentUser = user;
      this.buildProfileForm(false);
      loading.dismissAll();
    }).catch(err => {
      loading.dismissAll();
      console.error(err);
      this.showToast('Fail to get your profile data', 'toastError');
    });
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  toggleEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.buildProfileForm(!editMode);
  }

  changePassword() {
    let changePasswordPage = this.modalCtrl.create(ChangePasswordPage);
    changePasswordPage.onDidDismiss((updatePassword: {new: string, old: string}) => {
      if (updatePassword) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.userService.updatePassword(updatePassword).then(() => {
          loading.dismissAll();
          this.showToast('Password has been successfully updated', 'toastInfo');
        }).catch(err => {
          console.error(err);
          loading.dismissAll();
          this.showToast('Fail to update your password', 'toastError');
        });
      }
    });
    changePasswordPage.present();
  }

  startPickPicture() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Picture Source',
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.pickPicture(Camera.PictureSourceType.CAMERA).then((imageData) => {
              this.selectedPicture = "data:image/jpeg;base64," + imageData;
            }, (err) => {
              console.log(err);
              this.showToast('Fail to get picture', 'toastError');
            });
          }
        }, {
          text: 'Gallery',
          handler: () => {
            this.pickPicture(Camera.PictureSourceType.PHOTOLIBRARY).then((imageData) => {
              this.selectedPicture = "data:image/jpeg;base64," + imageData;
            }, (err) => {
              console.log(err);
              this.showToast('Fail to get picture', 'toastError');
            });
          }
        }, {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    actionSheet.present();
  }

  saveUserInfo() {
    this.currentUser.email = this.profileForm.value.email;
    this.currentUser.name = this.profileForm.value.name;
    this.currentUser.address = this.profileForm.value.address;
    this.currentUser.phoneNumber = this.profileForm.value.phoneNumber;
    this.currentUser.sex = this.profileForm.value.sex;
    this.currentUser.dateOfBirth = this.profileForm.value.dateOfBirth;
    this.currentUser.nricNo = this.profileForm.value.nricNo;
    this.currentUser.race = this.profileForm.value.race;
    this.currentUser.age = this.profileForm.value.age;
    this.currentUser.bankAccountDetails = this.profileForm.value.bankAccountDetails;
    this.currentUser.accountNumber = this.profileForm.value.accountNumber;
    this.currentUser.picture = this.selectedPicture;
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.updateUserInfo(this.currentUser).then(() => {
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

  private buildProfileForm(isDisabled: boolean) {
    this.selectedPicture = this.currentUser.picture;
    this.profileForm = this.formBuilder.group({
      email: [{value: this.currentUser.email, disabled: isDisabled},
        Validators.compose([Validators.required,
          GlobalValidator.mailFormat,
          Validators.maxLength(this.messageService.maxLengthEmail)])],
      name: [{value: this.currentUser.name, disabled: isDisabled},
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      address: [{value: this.currentUser.address, disabled: isDisabled},
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthAddress),
          Validators.maxLength(this.messageService.maxLengthAddress)])],
      phoneNumber: [{value: this.currentUser.phoneNumber, disabled: isDisabled},
        Validators.compose([Validators.required,
          Validators.pattern(/\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)])],
      sex: [{value: this.currentUser.sex, disabled: isDisabled}],
      dateOfBirth: [{value: this.currentUser.dateOfBirth, disabled: isDisabled},
        Validators.required],
      nricNo: [{value: this.currentUser.nricNo, disabled: isDisabled},
        Validators.required],
      race: [{value: this.currentUser.race, disabled: isDisabled}],
      age: [{value: this.currentUser.race, disabled: isDisabled}],
      bankAccountDetails: [{value: this.currentUser.bankAccountDetails, disabled: isDisabled},
        Validators.required],
      accountNumber: [{value: this.currentUser.accountNumber, disabled: isDisabled},
        Validators.required],
    });
    this.profileForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.profileForm, this.formErrors));
    this.messageService.onValueChanged(this.profileForm, this.formErrors);
    this.editMode = !isDisabled;
  }

}
