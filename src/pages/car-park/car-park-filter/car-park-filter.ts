import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ToastController, LoadingController, LoadingOptions, MenuController } from 'ionic-angular';
import { CarParkService } from '../shared/car-park.service';
import { CarParkFilterModel } from './car-park-filter.model';
import { UtilsPage } from '../../shared/utils.page';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';

@Component({
  selector: 'app-car-park-filter',
  templateUrl: 'car-park-filter.html'
})
export class CarParkFilterComponent extends UtilsPage {

  carParkFilter: CarParkFilterModel;

  codeFielterForm: FormGroup;
  codeFormErrors = {
    carParkCode: ''
  };

  @Output() onFilterCarParks = new EventEmitter<CarParkFilterModel>();

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
    this.buildForm();
  }

  filterCarParks() {
    this.onFilterCarParks.emit(this.carParkFilter);
  }

  private buildForm() {
    this.codeFielterForm = this.formBuilder.group({
      carParkCode: ['', Validators.required]
    });
    this.codeFielterForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.codeFielterForm, this.codeFormErrors));
    this.messageService.onValueChanged(this.codeFielterForm, this.codeFormErrors);
  }
}
