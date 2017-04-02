import { ToastController, MenuController } from 'ionic-angular';
import * as Swiper from 'swiper';
import { Camera } from 'ionic-native';

export abstract class UtilsPage {

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

  protected pickPicture(sourceType: number) {
    return Camera.getPicture({
      sourceType: sourceType,
      destinationType: Camera.DestinationType.DATA_URL,
      targetWidth: 1000,
      targetHeight: 1000,
      correctOrientation: true
    });
  }
}
