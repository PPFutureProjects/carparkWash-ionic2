import { Component, EventEmitter, Output } from '@angular/core';
import { ToastController, LoadingController, LoadingOptions } from 'ionic-angular';
import { CarParkService } from '../shared/car-park.service';
import { CarParkFilterModel } from './car-park-filter.model';
import { AbstractPage } from '../../shared/abstract.page';
import { RegionEnum } from './region.enum';

@Component({
  selector: 'app-car-park-filter',
  templateUrl: 'car-park-filter.html',
})
export class CarParkFilterComponent extends AbstractPage {

  selectedCarParkFilter: CarParkFilterModel;
  areasOfRegion: Array<string>
  //areaFilter: string;
  //filteredAreasPart: Array<AreaModel>
  //@ViewChild('selectOptionArea') selectOptionArea: MdSelect;

  @Output() onFilterCarParks = new EventEmitter<CarParkFilterModel>();

  regionEnum = RegionEnum;
  private loadingOptions: LoadingOptions;

  constructor(public carParkService: CarParkService, public toastCtrl: ToastController, public loadingCtrl: LoadingController) {
    super(toastCtrl);
    this.selectedCarParkFilter = new CarParkFilterModel();
    this.areasOfRegion = [];
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
  }

  getAreasByPart() {
    this.selectedCarParkFilter.area = undefined;
    if (this.selectedCarParkFilter.region) {
      let loading = this.loadingCtrl.create(this.loadingOptions);
      loading.present();
      this.carParkService.getAreasByRegion(this.selectedCarParkFilter.region)
        .then(areasOfRegion => {
          this.areasOfRegion = areasOfRegion;
          loading.dismissAll();
        })
        .catch(err => {
          console.error(err);
          loading.dismissAll();
          this.showToast('Error getting areas, please contact admin', 'toastError');
        });
    }
  }

  filterCarParks() {
    this.onFilterCarParks.emit(this.selectedCarParkFilter);
  }

}
