import { Component } from '@angular/core';
import {
  NavController, NavParams, ModalController, ToastController, LoadingController,
  LoadingOptions
} from 'ionic-angular';
import { ChangePasswordPage } from './change-password/change-password';
import { UserService } from '../user/user.service';
import { AbstractPage } from '../shared/abstract.page';
import { UserModel, ProviderEnum } from '../user/user.model';

@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html'
})
export class SettingPage extends AbstractPage {

  user: UserModel;
  providerTypeEnum = ProviderEnum;

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public toastCtrl: ToastController, public navCtrl: NavController,
              public navParams: NavParams, public modalCtrl: ModalController, public loadingCtrl: LoadingController) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.userService.getCurrent().then(user => this.user = user);
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

}
