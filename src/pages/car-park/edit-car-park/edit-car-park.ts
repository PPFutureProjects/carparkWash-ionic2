import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ViewController, NavParams } from 'ionic-angular';
import { ImagePicker, ImagePickerOptions } from 'ionic-native';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarParkModel } from '../shared/car-park.model';
import { AbstractPage } from '../../shared/abstract.page';
import { RegionEnum } from '../car-park-filter/region.enum';

@Component({
  selector: 'page-add-car',
  templateUrl: 'edit-car-park.html',
})
export class EditCarParkPage extends AbstractPage {

  // Value input from the caller of the dialog
  carParkToEdit: CarParkModel;
  isPictureLoading = false;

  regionEnum = RegionEnum;
  carParkForm: FormGroup;
  formErrors = {
    carParkName: '',
    carParkCode: '',
    region: '',
    area: '',
    address: '',
    //nbPlaces: ''
  };

  constructor(private formBuilder: FormBuilder, public viewCtrl: ViewController, public params: NavParams,
              public messageService: ValidationMessageService, public toastCtrl: ToastController) {

    super(toastCtrl);
    this.carParkToEdit = params.get('carParkToEdit') ? params.get('carParkToEdit') : new CarParkModel();
    this.buildForm();
  }

  pickCarParkPicture(event) {
    this.isPictureLoading = true;
    ImagePicker.getPictures(<ImagePickerOptions>{
      maximumImagesCount: 1,
      outputType: 0
    }).then((results) => {
      this.carParkToEdit.picture = results[0];
      this.isPictureLoading = false;
    }, (err) => {
      this.isPictureLoading = false;
      console.error(err);
      this.showToast('Fail to get picture', 'toastError');
    });
  }

  cancel() {
    this.viewCtrl.dismiss(false)
  }

  save() {
    this.carParkToEdit.name = this.carParkForm.value.carParkName;
    this.carParkToEdit.code = this.carParkForm.value.carParkCode;
    this.carParkToEdit.address = this.carParkForm.value.address;
    // this.carParkToEdit.region = this.carParkForm.value.region;
    // this.carParkToEdit.area = this.carParkForm.value.area;
    //this.carParkToEdit.nbPlaces = this.carParkForm.value.nbPlaces;
    this.viewCtrl.dismiss({
      carpark: this.carParkToEdit,
      area: this.carParkForm.value.area,
      region: this.carParkForm.value.region
    });
  }

  private buildForm() {
    this.carParkForm = this.formBuilder.group({
      carParkName: [this.carParkToEdit.name,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthCarParkName),
          Validators.maxLength(this.messageService.maxLengthCarParkName)])],
      region: [this.carParkToEdit.region, Validators.required],
      area: [this.carParkToEdit.area,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthArea),
          Validators.maxLength(this.messageService.maxLengthArea)])],
      address: [this.carParkToEdit.address,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthAddress),
          Validators.maxLength(this.messageService.maxLengthAddress)])],
      //nbPlaces: [this.carParkToEdit.nbPlaces],
    });
    this.carParkForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carParkForm, this.formErrors));
    this.messageService.onValueChanged(this.carParkForm, this.formErrors);
  }

}
