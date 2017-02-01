import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ToastController, LoadingController, LoadingOptions } from 'ionic-angular';
import { CarParkService } from '../shared/car-park.service';
import { CarParkFilterModel, FilterBy, FilterByEnum } from './car-park-filter.model';
import { AbstractPage } from '../../shared/abstract.page';
import { RegionEnum } from './region.enum';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';

@Component({
  selector: 'app-car-park-filter',
  templateUrl: 'car-park-filter.html'
})
export class CarParkFilterComponent extends AbstractPage {

  carParkFilter: CarParkFilterModel;
  areasOfRegion: Array<string>;
  filterBy: FilterBy = FilterByEnum.code;
  filterByEnum = FilterByEnum;

  codeFielterForm: FormGroup;
  codeFormErrors = {
    carParkCode: ''
  };

  areaFielterForm: FormGroup;
  areaFormErrors = {
    carParkLotNumber: ''
  };

  @Output() onFilterCarParks = new EventEmitter<CarParkFilterModel>();

  regionEnum = RegionEnum;
  private loadingOptions: LoadingOptions;

  constructor(public carParkService: CarParkService, public toastCtrl: ToastController,
              public loadingCtrl: LoadingController, public formBuilder: FormBuilder,
              public messageService: ValidationMessageService) {
    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.carParkFilter = new CarParkFilterModel();
    this.areasOfRegion = [];
    this.buildForm();
  }

  getAreasByRegion() {
    this.carParkFilter.area = undefined;
    // if select is opened but none value is selected
    if (this.carParkFilter.region) {
      let loading = this.loadingCtrl.create(this.loadingOptions);
      loading.present();
      this.carParkService.getAreasByRegion(this.carParkFilter.region)
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
    if (this.filterBy === FilterByEnum.code) {
      this.carParkFilter.region = undefined;
      this.carParkFilter.area = '';
    } else {
      this.carParkFilter.code = '';
    }
    this.onFilterCarParks.emit(this.carParkFilter);
  }

  private buildForm() {
    this.codeFielterForm = this.formBuilder.group({
      carParkCode: ['', Validators.required]
    });
    this.codeFielterForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.codeFielterForm, this.codeFormErrors));
    this.messageService.onValueChanged(this.codeFielterForm, this.codeFormErrors);

    this.areaFielterForm = this.formBuilder.group({
      carParkRegion: ['', Validators.required],
      carParkArea: ['']
    });
    this.areaFielterForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.areaFielterForm, this.areaFormErrors));
    this.messageService.onValueChanged(this.areaFielterForm, this.areaFormErrors);
  }
}
