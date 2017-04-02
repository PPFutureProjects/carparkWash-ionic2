import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastController, LoadingController, LoadingOptions, MenuController } from 'ionic-angular';
import { UserModel } from './shared/user.model';
import { ProfileEnum } from './shared/profile.enum';
import { UserService } from './shared/user.service';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { UtilsPage } from '../shared/utils.page';
import { GlobalValidator } from '../shared/validator/global.validator';

@Component({
  selector: 'page-add-user',
  templateUrl: 'add-user.html',
})
export class AddUserPage extends UtilsPage {

  connectEmailNoFacebook: 'true' | 'false';
  userModel = new UserModel();
  carParkModel = new CarParkModel();
  password: string = '';
  confirmPassword: string = '';

  profileEnum = ProfileEnum;
  signUpForm: FormGroup;
  signUpFormErrors = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  };
  userInfoForm: FormGroup;
  userInfoFormErrors = {
    address: '',
    phoneNumber: '',
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public toastCtrl: ToastController,
              public messageService: ValidationMessageService, public menuCtrl: MenuController,
              public formBuilder: FormBuilder, public loadingCtrl: LoadingController) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.userModel = new UserModel();
    this.buildForms();
  }

  ionViewWillEnter() {
    this.buildForms();
  }

  ionViewWillLeave() {
    GlobalValidator.endSamePassword(this.signUpForm, 'signUp');
  }

  createAccount() {
    if (this.connectEmailNoFacebook === 'true') {
      this.createWithEmail();
    } else {
      this.createWithFacebook();
    }
  }

  areInputsValid() {
    return this.userInfoForm.valid
      && ((this.connectEmailNoFacebook === 'true' && this.signUpForm.valid) || this.connectEmailNoFacebook === 'false');
  }

  private createWithFacebook() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.facebookLogin(this.userModel).then((data) => {
      loading.dismissAll();
      this.buildForms();
      this.showToast(`Account ${this.userModel.profile} created`, 'toastInfo');
    }).catch((err: firebase.FirebaseError) => {
      loading.dismissAll();
      console.error(err);
      let errMsg = `Fail to create ${this.userModel.profile}  account`;
      switch (err.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errMsg = 'Incorrect email or password';
          break;
      }
      this.showToast(errMsg, 'toastError');
    });
  }

  private createWithEmail() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.create(this.userModel, this.password, false)
      .then(() => {
        loading.dismissAll();
        this.buildForms();
        this.showToast(`Account ${this.userModel.email} created`, 'toastInfo');
      })
      .catch((err: firebase.FirebaseError) => {
        loading.dismissAll();
        console.error(err);
        let errMsg = `Fail to create ${this.userModel.email}  account`;
        switch (err.code) {
          case 'auth/email-already-in-use':
            errMsg = err.message;
            break;
          case 'auth/network-request-failed':
            errMsg = 'No internet connection';
            break;
        }
        this.showToast(errMsg, 'toastError');
      });
  }

  private buildForms() {
    this.userModel.profile = undefined;
    this.buildSignUpForm();
    this.buildUserInfoForm();
  }

  private buildSignUpForm() {
    this.signUpForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])],
      name: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthName),
        Validators.maxLength(this.messageService.maxLengthName)])],
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required],
    });
    this.signUpForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    });
    this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    setTimeout(GlobalValidator.samePassword(this.signUpForm, 'signUp'), 2000);
  }

  private buildUserInfoForm() {
    this.userInfoForm = this.formBuilder.group({
      address: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthAddress),
        Validators.maxLength(this.messageService.maxLengthAddress)])],
      phoneNumber: ['', Validators.pattern(
        /\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)],
      profile: ['', Validators.required]
    });
    this.userInfoForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.userInfoForm, this.userInfoFormErrors);
    });
    this.messageService.onValueChanged(this.userInfoForm, this.userInfoFormErrors);
  }

}
