import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HistoryService } from './history.service';
import { UserModel } from '../user/user.model';
import { SubscriptionModel } from '../shared/subscription/subscription.model';

@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryPage {

  private client: UserModel;
  private histories: Array<SubscriptionModel>;
  private selectedHistory: SubscriptionModel;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public historyService: HistoryService) {}

  ionViewDidLoad() {
    this.client = this.historyService.selectedClient;
    if (this.client) {
      this.historyService.getHistory(this.client)
        .then(histories => this.histories = histories);
    } else {
      this.navCtrl.pop();
    }
  }

  selectHistory(history: SubscriptionModel) {
    this.selectedHistory = history;
  }
}
