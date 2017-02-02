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

  clients: Array<UserModel>;
  selectedClient: UserModel;
  histories: Array<SubscriptionModel>;
  selectedHistory: SubscriptionModel;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public historyService: HistoryService) {}

  ionViewDidLoad() {
    this.historyService.getClients().then(clients => this.clients = clients);
  }

  selectClient(client: UserModel) {
    this.selectedClient = client;
    this.selectedHistory = undefined;
    this.historyService.getHistory(this.selectedClient)
      .then(histories => this.histories = histories);
  }

  selectHistory(history: SubscriptionModel) {
    this.selectedHistory = history;
  }

  unSelectHistory() {
    this.selectedHistory = undefined;
  }

  unSelectClient() {
    this.selectedHistory = undefined;
    this.selectedClient = undefined;
  }

}
