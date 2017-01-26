import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarModel, SilhouettePictureEnum } from '../shared/car.model';

@Component({
  selector: 'page-add-car',
  templateUrl: 'edit-car.html',
})
export class EditCarPage {

  carToEdit: CarModel;

  silhouettePictureEnum = SilhouettePictureEnum;
  carForm: FormGroup;
  formErrors = {
    licencePlateNumber: '',
    brandModel: '',
    colour: ''
  };

  constructor(private formBuilder: FormBuilder, public viewCtrl: ViewController,
              public messageService: ValidationMessageService, public params: NavParams) {

    this.carToEdit = params.get('carToEdit') ? params.get('carToEdit') : new CarModel();
    this.buildForm();
  }

  ionViewWillEnter() {
    this.buildForm();
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  save() {
    this.carToEdit.licencePlateNumber = this.carForm.value.licencePlateNumber;
    this.carToEdit.brandModel = this.carForm.value.brandModel;
    this.carToEdit.colour = this.carForm.value.colour;
    this.carToEdit.silhouettePicture = this.carForm.value.silhouettePicture;
    this.viewCtrl.dismiss(this.carToEdit);
  }

  private buildForm() {
    this.carForm = this.formBuilder.group({
      licencePlateNumber: [this.carToEdit.licencePlateNumber,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthLicencePlateNumber),
          Validators.maxLength(this.messageService.maxLengthLicencePlateNumber)])],
      brandModel: [this.carToEdit.brandModel,
        Validators.maxLength(this.messageService.maxLengthBrandModel)],
      colour: [this.carToEdit.colour,
        Validators.maxLength(this.messageService.maxLengthCarColour)],
      silhouettePicture: [this.carToEdit.silhouettePicture]
    });
    this.carForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carForm, this.formErrors));
    this.messageService.onValueChanged(this.carForm, this.formErrors);
  }

}
