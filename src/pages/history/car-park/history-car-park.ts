import { Component } from '@angular/core';
import { NavController, NavParams, ToastController, MenuController } from 'ionic-angular';
import { UtilsPage } from '../../shared/utils.page';
import { HistoryService } from '../shared/history.service';
import { CarParkHistoryModel } from './car-park-history.model';

@Component({
  selector: 'history-car-park',
  templateUrl: 'history-car-park.html'
})
export class HistoryCarParkComponent extends UtilsPage {

  carParksHistory: Array<CarParkHistoryModel>;
  selectedCarParkHistory: CarParkHistoryModel;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public historyService: HistoryService, public toastCtrl: ToastController) {
    super(toastCtrl);
  }

  ngAfterContentInit() {
    this.historyService.getCarParksHistory()
      .then(carParksHistory => this.carParksHistory = carParksHistory)
      .catch(err => {
        console.log(err);
        this.showToast('Error getting car parks unlock history', 'toastError');
      });
  }

  selectCarParkHistory(selectedCarParkHistory: CarParkHistoryModel) {
    this.selectedCarParkHistory = selectedCarParkHistory;
  }

  unSelectCarParkHistory() {
    this.selectedCarParkHistory = undefined;
  }

}
