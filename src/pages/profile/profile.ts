import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ToastController, LoadingController, LoadingOptions } from 'ionic-angular';
import { UserService } from '../user/user.service';
import { UserModel } from '../user/user.model';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { AbstractPage } from '../shared/abstract.page';
import { GlobalValidator } from '../shared/validator/global.validator';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage extends AbstractPage {

  user: UserModel;
  editMode = false;

  profileForm: FormGroup;
  formErrors = {
    email: '',
    name: '',
    address: '',
    phoneNumber: ''
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public messageService: ValidationMessageService,
              public formBuilder: FormBuilder, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController) {

    super(toastCtrl);
    this.user = new UserModel();
    this.editMode = false;
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.buildProfileForm(true);
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

  toggleEditMode(editMode: boolean) {
    this.editMode = editMode;
    this.buildProfileForm(!editMode);
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

}
