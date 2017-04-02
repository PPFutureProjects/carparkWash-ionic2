import { Component } from '@angular/core';
import { NavController, NavParams, ModalController } from 'ionic-angular';
import { SupportService } from './support-service';
import { ConfirmSentPage } from './confirm-sent/confirm-sent';
import { CallNumber } from 'ionic-native';

@Component({
  selector: 'page-support',
  templateUrl: 'support.html'
})
export class SupportPage {

  textToAdmin: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, public supportService: SupportService,
              public modalCtrl: ModalController) {
  }

  sendToAdmin() {
    this.supportService.sendMsgToAdmin(this.textToAdmin).then(() => {
      this.textToAdmin = '';
      this.modalCtrl.create(ConfirmSentPage).present();
    });
  }

  callSupport() {
    CallNumber.callNumber('0000000000', true)
      .then(() => console.log('Launched dialer!'))
      .catch(() => console.log('Error launching dialer'));
  }

}
