import { ToastController } from 'ionic-angular';
import * as Swiper from 'swiper';

export abstract class AbstractPage {

  constructor(public toastCtrl: ToastController) {
    // by passing Swiper not found on angular2-useful-swiper
    new Swiper('.swip', {});
  }

  protected showToast(msg, style, duration: number = 3000) {
    this.toastCtrl.create({
      message: msg,
      duration: duration,
      cssClass: style
    }).present();
  }
}
