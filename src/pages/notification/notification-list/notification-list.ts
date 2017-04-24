import { Component } from '@angular/core';
import {
  ViewController,
  NavParams,
  ToastController,
  ModalController,
  ActionSheetController,
  LoadingController,
  LoadingOptions
} from 'ionic-angular';
import { UtilsPage } from '../../shared/utils.page';
import { UserService } from '../../user/shared/user.service';
import { NotificationModel } from './notification.model';
import { NotificationService } from './notification.service';

@Component({
  selector: 'page-notification-list',
  templateUrl: 'notification-list.html',
})
export class NotificationListPage extends UtilsPage {

  notifications: Array<NotificationModel>;

  private loadingOptions: LoadingOptions;

  constructor(public viewCtrl: ViewController, public toastCtrl: ToastController, public params: NavParams,
              public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController,
              public userService: UserService, public loadingCtrl: LoadingController,
              public notificationService: NotificationService) {

    super(toastCtrl);

    this.notifications = new Array<NotificationModel>();
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.getCurrent().then(currentUser => {
      this.notificationService.getForUser(currentUser).then(notifications => {
        this.notifications = notifications;
        loading.dismissAll();
      });
    });
  }

  back() {
    this.viewCtrl.dismiss();
  }

}
