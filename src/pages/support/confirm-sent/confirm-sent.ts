import { Component } from '@angular/core';
import { NavParams, ViewController } from 'ionic-angular';

@Component({
  selector: 'page-confirm-sent',
  templateUrl: 'confirm-sent.html'
})
export class ConfirmSentPage {

  constructor(public viewCtrl: ViewController, public navParams: NavParams) {
  }

  close() {
    this.viewCtrl.dismiss();
  }

}
