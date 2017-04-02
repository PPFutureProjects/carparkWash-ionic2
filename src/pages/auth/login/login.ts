import { Component, ChangeDetectionStrategy } from '@angular/core';
import * as firebase from 'firebase';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import {
  LoadingOptions,
  LoadingController,
  NavController,
  MenuController,
  ToastController,
  AlertController
} from 'ionic-angular';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarModel } from '../../car/shared/car.model';
import { ProfileEnum } from '../../user/shared/profile.enum';
import { HomePage } from '../../home/home';
import { UtilsPage } from '../../shared/utils.page';
import { SignUpPage } from '../sign-up/sign-up';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage extends UtilsPage {

  userModel = new UserModel();
  carModel = new CarModel();
  password: string = '';

  profileEnum = ProfileEnum;
  loginForm: FormGroup;
  loginFormErrors = {
    email: '',
    password: '',
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public messageService: ValidationMessageService,
              public formBuilder: FormBuilder, public menuCtr: MenuController,
              public navCtrl: NavController, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController) {

    super(toastCtrl);
    this.userModel = new UserModel();
    this.userModel.profile = ProfileEnum.client;
    this.buildLoginForm();
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
  }

  ionViewDidEnter() {
    this.messageService.onValueChanged(this.loginForm, this.loginFormErrors);
  }

  goToSignUp() {
    this.navCtrl.push(SignUpPage);
  }

  backToWelcomePage() {
    this.navCtrl.pop();
  }

  login() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.login(this.userModel, this.password).then(() => {
      loading.dismissAll();
      this.navCtrl.setRoot(HomePage);
      this.menuCtr.enable(true);
      this.showToast('Log in Success', 'toastInfo');
    }).catch((err: firebase.FirebaseError) => {
      loading.dismissAll();
      this.showToast(err.message, 'toastError');
    });
  }

  loginFacebook() {
    console.log('loginFacebook');
    this.userService.facebookLogin().then((data) => {
      this.navCtrl.setRoot(HomePage);
      this.menuCtr.enable(true);
      this.showToast('Log in Success', 'toastInfo');
    }).catch((err: firebase.FirebaseError) => {
      console.error(err);
      let errMsg = 'Log in Fail';
      switch (err.code) {
        case 'auth/network-request-failed':
          errMsg = 'No Internet Connection';
          break;
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errMsg = 'Incorrect email or password';
          break;
      }
      this.showToast(errMsg, 'toastError');
    });
  }

  loginGooglePlus() {
    console.log('loginGooglePlus');
    this.userService.loginGooglePlus().then((data) => {
      this.navCtrl.setRoot(HomePage);
      this.menuCtr.enable(true);
      this.showToast('Log in Success', 'toastInfo');
    }).catch((err: firebase.FirebaseError) => {
      console.error(err);
      let errMsg = 'Log in Fail';
      switch (err.code) {
        case 'auth/network-request-failed':
          errMsg = 'No Internet Connection';
          break;
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errMsg = 'Incorrect email or password';
          break;
      }
      this.showToast(errMsg, 'toastError');
    });
  }

  resetPassword() {
    this.userService.resetPassword(this.userModel).then(() => {
      this.showToast('Reset password email sent', 'toastInfo');
    }).catch((err: firebase.FirebaseError) => {
      console.error(err);
      let errMsg = err.message;
      switch (err.code) {
        case 'auth/network-request-failed':
          errMsg = 'No Internet Connection';
          break;
      }
      this.showToast(errMsg, 'toastError');
    });
  }

  private buildLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
    this.loginForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.loginForm, this.loginFormErrors);
    });
  }
}
