import { Component } from '@angular/core';
import { ToastController, LoadingController, LoadingOptions } from 'ionic-angular';
import { ImagePickerOptions, ImagePicker } from 'ionic-native';
import { UserModel } from './user.model';
import { ProfileEnum } from '../shared/profile.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from './user.service';
import { ValidationMessageService } from '../shared/validator/validation-message.service';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { AbstractPage } from '../shared/abstract.page';
import { RegionEnum } from '../car-park/car-park-filter/region.enum';
import { GlobalValidator } from '../shared/validator/global.validator';

@Component({
             selector: 'page-add-user',
             templateUrl: 'add-user.html',
           })
export class AddUserPage extends AbstractPage {

  connectEmailNoFacebook: 'true' | 'false';
  userModel = new UserModel();
  carParkModel = new CarParkModel();
  password: string = '';
  confirmPassword: string = '';

  profileEnum = ProfileEnum;
  regionEnum = RegionEnum;
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
  carParkForm: FormGroup;
  carParkFormErrors = {
    name: '',
    address: '',
    area: '',
    //nbPlaces: ''
  };
  cleanerForm: FormGroup;
  cleanerFormErrors = {};

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public toastCtrl: ToastController,
              public messageService: ValidationMessageService,
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

  pickCarParkPicture(event) {
    ImagePicker.getPictures(<ImagePickerOptions>{
      maximumImagesCount: 1,
      outputType: 0
    }).then((results) => {
      this.carParkModel.picture = results[0];
    }, (err) => {
      console.error(err);
      this.showToast('Fail to get picture', 'toastError');
    });
  }

  areInputsValid() {
    return this.userInfoForm.valid
      && ((this.connectEmailNoFacebook && this.signUpForm.valid) || !this.connectEmailNoFacebook)
      && ((this.userModel.profile === ProfileEnum.cleaner && this.cleanerForm.valid)
      || (this.userModel.profile === ProfileEnum.manager && this.carParkForm.valid))
  }

  private createWithFacebook() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.facebookLogin(this.userModel, this.carParkModel).then((data) => {
      loading.dismissAll();
      this.buildForms();
      this.showToast(`Account ${this.userModel.profile} created`, 'toastInfo');
    }).catch((err: firebase.FirebaseError) => {
      loading.dismissAll();
      console.error(err);
      let errMsg = 'Fail to create ${this.userModel.profile}  account';
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
    this.userService.create(this.userModel, this.password, this.carParkModel)
      .then(() => {
        loading.dismissAll();
        this.buildForms();
        this.showToast(`Account ${this.userModel.profile} created`, 'toastInfo');
      })
      .catch((err: firebase.FirebaseError) => {
        loading.dismissAll();
        console.error(err);
        let errMsg = 'Fail to create ${this.userModel.profile}  account';
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
    this.buildSignUpForm();
    this.buildUserInfoForm();
    this.buildCarParkForm();
    this.buildCleanerForm();
  }

  private buildCarParkForm() {
    this.carParkForm = this.formBuilder.group(
      {
        carParkName: ['', Validators.compose(
          [Validators.required,
            Validators.minLength(this.messageService.minLengthCarParkName),
            Validators.maxLength(this.messageService.maxLengthCarParkName)])],
        address: ['', Validators.compose(
          [Validators.required,
            Validators.minLength(this.messageService.minLengthAddress),
            Validators.maxLength(this.messageService.maxLengthAddress)])],
        region: ['', Validators.required],
        area: ['', Validators.compose(
          [Validators.required,
            Validators.minLength(this.messageService.minLengthName),
            Validators.maxLength(this.messageService.maxLengthName)])],
        //nbPlaces: ['', Validators.pattern('^[0-9]+$')]
      });
    this.carParkForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.carParkForm, this.carParkFormErrors);
    });
    this.messageService.onValueChanged(this.carParkForm, this.carParkFormErrors);
  }

  private buildSignUpForm() {
    this.signUpForm = this.formBuilder.group(
      {
        email: ['', Validators.compose(
          [Validators.required,
            GlobalValidator.mailFormat,
            Validators.maxLength(
              this.messageService.maxLengthEmail)])],
        name: ['', Validators.compose(
          [Validators.required,
            Validators.minLength(
              this.messageService.minLengthName),
            Validators.maxLength(
              this.messageService.maxLengthName)])],
        password: ['', Validators.compose(
          [Validators.required,
            Validators.minLength(
              this.messageService.minLengthPassword),
            Validators.maxLength(
              this.messageService.maxLengthPassword)])],
        confirmPassword: ['', Validators.required],
      });
    this.signUpForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    });
    this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    setTimeout(GlobalValidator.samePassword(this.signUpForm, 'signUp'), 2000);
  }

  private buildUserInfoForm() {
    this.userInfoForm = this.formBuilder.group(
      {
        address: ['', Validators.compose(
          [Validators.required,
            Validators.minLength(
              this.messageService.minLengthAddress),
            Validators.maxLength(
              this.messageService.maxLengthAddress)])],
        phoneNumber: ['', Validators.pattern(
          /\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)],
        profile: ['', Validators.required]
      });
    this.userInfoForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.userInfoForm, this.userInfoFormErrors);
    });
    this.messageService.onValueChanged(this.userInfoForm, this.userInfoFormErrors);
  }

  private buildCleanerForm() {
    this.cleanerForm = this.formBuilder.group(
      {
        //email: ['', Validators.required],
        //password: ['', Validators.required]
      });
    this.cleanerForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.cleanerForm, this.cleanerFormErrors);
    });
    this.messageService.onValueChanged(this.cleanerForm, this.cleanerFormErrors);
  }

}
