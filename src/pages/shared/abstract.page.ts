import { ToastController } from 'ionic-angular';

export abstract class AbstractPage {

  constructor(public toastCtrl: ToastController) {

  }

  protected showToast(msg, style, duration: number = 2000) {
    this.toastCtrl.create({
      message: msg,
      duration: duration,
      cssClass: style
    }).present();
  }
}
