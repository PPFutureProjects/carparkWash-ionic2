import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, MenuController } from 'ionic-angular';
import { UserModel } from '../../user/shared/user.model';
import { HistoryModel } from '../shared/history.model';
import { HistoryService } from '../shared/history.service';
import { UtilsPage } from '../../shared/utils.page';

@Component({
  selector: 'history-client',
  templateUrl: './history-client.html'
})
export class HistoryClientComponent extends UtilsPage {

  clients: Array<UserModel>;
  selectedClient: UserModel;
  histories: Array<HistoryModel>;
  selectedHistory: HistoryModel;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public historyService: HistoryService, public toastCtrl: ToastController) {
    super(toastCtrl);
  }

  ngAfterContentInit() {
    this.historyService.getClients()
      .then(clients => this.clients = clients)
      .catch(err => {
        console.log(err);
        this.showToast('Error getting clients names', 'toastError');
      });
  }

  selectClient(client: UserModel) {
    this.selectedClient = client;
    this.selectedHistory = undefined;
    this.historyService.getHistory(this.selectedClient)
      .then(histories => this.histories = histories);
  }

  selectHistory(history: HistoryModel) {
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
