import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { CarTypeEnum } from '../../shared/car-silhouette.enum';
import { CarModel } from '../../shared/car.model';

@Component({
  selector: 'type-select',
  templateUrl: 'type-select.html'
})
export class TypeSelectPage {

  private carToEdit: CarModel;

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    this.carToEdit = params.get('carToEdit');
  }

  selectSedan() {
    this.carToEdit.type = CarTypeEnum.sedan;
    this.viewCtrl.dismiss(this.carToEdit);
  }

  selectSuv() {
    this.carToEdit.type = CarTypeEnum.suv;
    this.viewCtrl.dismiss(this.carToEdit);
  }

}
