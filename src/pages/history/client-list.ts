import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HistoryService } from './history.service';
import { UserModel } from '../user/user.model';
import { HistoryPage } from './history';

@Component({
  selector: 'page-client-list',
  templateUrl: 'client-list.html'
})
export class ClientListPage {

  private clients: Array<UserModel>;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public historyService: HistoryService) {}

  ionViewDidLoad() {
    this.historyService.getClients().then(clients => this.clients = clients);
  }

  selectClient(client: UserModel) {
    this.historyService.selectedClient = client;
    this.navCtrl.push(HistoryPage);
  }
}
