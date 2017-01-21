import { Component, EventEmitter, Output } from '@angular/core';
import { ToastController } from 'ionic-angular';
import { CardinalPartEnum } from './cardinal-part-enum';
import { CarParkService } from '../car-park.service';
import { CarParkFilterModel } from './car-park-filter.model';
import { AbstractPage } from '../../shared/abstract.page';

@Component({
  selector: 'app-car-park-filter',
  templateUrl: 'car-park-filter.html',
})
export class CarParkFilterComponent extends AbstractPage {

  selectedCarParkFilter: CarParkFilterModel;
  areasPart: Array<string>
  //areaFilter: string;
  //filteredAreasPart: Array<AreaModel>
  //@ViewChild('selectOptionArea') selectOptionArea: MdSelect;

  @Output() onFilterCarParks = new EventEmitter<CarParkFilterModel>();

  cardinalPartEnum = CardinalPartEnum;

  constructor(public carParkService: CarParkService, public toastCtrl: ToastController) {
    super(toastCtrl);
    this.selectedCarParkFilter = new CarParkFilterModel();
    this.areasPart = [];
  }

  ngOnInit() {
  }

  getAreasByPart() {
    this.selectedCarParkFilter.area = undefined;
    if (this.selectedCarParkFilter.cardinalPart) {
      this.carParkService.getAreasByCardinalPart(this.selectedCarParkFilter.cardinalPart)
        .then(areasPart => this.areasPart = areasPart)
        .catch(err => {
          console.error(err);
          this.showToast('Error getting areas, please contact admin', 'toastError');
        });
    }
  }

  filterCarParks() {
    this.onFilterCarParks.emit(this.selectedCarParkFilter);
  }

}
