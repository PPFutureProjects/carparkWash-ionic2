import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastController, ViewController, NavParams } from 'ionic-angular';
import { ImagePicker, ImagePickerOptions } from 'ionic-native';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarParkModel } from '../car-park.model';
import { CardinalPartEnum } from '../car-park-filter/cardinal-part-enum';
import { AbstractPage } from '../../shared/abstract.page';

@Component({
  selector: 'page-add-car',
  templateUrl: 'edit-car-park.html',
})
export class EditCarParkPage extends AbstractPage { //PickImageAbstract

  // Value input from the caller of the dialog
  carParkToEdit: CarParkModel;
  isPictureLoading = false;

  cardinalPartEnum = CardinalPartEnum;
  carParkForm: FormGroup;
  formErrors = {
    name: '',
    cardinalPart: '',
    area: '',
    address: '',
    //nbPlaces: ''
  };

  constructor( private formBuilder: FormBuilder, public viewCtrl: ViewController, public params: NavParams,
              public messageService: ValidationMessageService, public toastCtrl: ToastController) {

    super(toastCtrl);
    this.carParkToEdit = params.get('carParkToEdit') ? params.get('carParkToEdit') : new CarParkModel();
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.carParkForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carParkForm, this.formErrors));
    this.messageService.onValueChanged(this.carParkForm, this.formErrors);
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
    this.carParkToEdit.name = this.carParkForm.value.name;
    this.carParkToEdit.address = this.carParkForm.value.address;
    this.carParkToEdit.cardinalPart = this.carParkForm.value.cardinalPart;
    this.carParkToEdit.area = this.carParkForm.value.area;
    //this.carParkToEdit.nbPlaces = this.carParkForm.value.nbPlaces;
    this.viewCtrl.dismiss(this.carParkToEdit)
  }

  private buildForm() {
    this.carParkForm = this.formBuilder.group({
      name: [this.carParkToEdit.name,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      cardinalPart: [this.carParkToEdit.cardinalPart, Validators.required],
      area: [this.carParkToEdit.area,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthName),
          Validators.maxLength(this.messageService.maxLengthName)])],
      address: [this.carParkToEdit.address,
        Validators.compose([Validators.required,
          Validators.minLength(this.messageService.minLengthAddress),
          Validators.maxLength(this.messageService.maxLengthAddress)])],
      //nbPlaces: [this.carParkToEdit.nbPlaces],
    });
  }

}
