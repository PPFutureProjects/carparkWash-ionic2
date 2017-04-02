import { Component } from '@angular/core';
import { NavController, ToastController, MenuController, LoadingController, LoadingOptions } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { HomePage } from '../../home/home';
import { UtilsPage } from '../../shared/utils.page';
import { UserService } from '../../user/shared/user.service';

@Component({
  selector: 'page-welcom',
  templateUrl: 'welcom.html'
})
export class WelcomPage extends UtilsPage {

  private loadingOptions: LoadingOptions;

  constructor(public navCtrl: NavController, public userService: UserService, public loadingCtrl: LoadingController,
              public menuCtr: MenuController, public toastCtrl: ToastController) {
    super(toastCtrl);

    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };

  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.isAuth()
      .then(isAuth => {
        loading.dismissAll();
        if (isAuth) {
          this.menuCtr.enable(true);
          this.navCtrl.setRoot(HomePage);
        }
      })
      .catch(err => {
        loading.dismissAll();
        console.error(err);
      });
  }

  loginByEmail() {
    this.navCtrl.push(LoginPage);
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

}
