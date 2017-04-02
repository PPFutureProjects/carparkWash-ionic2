import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';

@Component({
  selector: 'app-car-lot-number',
  templateUrl: 'car-lot-number.dialog.html'
})
export class CarLotNumberDialog {

  form: FormGroup;
  formErrors = {
    carParkLotNumber: ''
  };

  constructor(public viewCtrl: ViewController, public formBuilder: FormBuilder,
              public messageService: ValidationMessageService) {
    this.buildForm();
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  select() {
    this.viewCtrl.dismiss(this.form.value.carParkLotNumber);
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      carParkLotNumber: ['', Validators.compose([Validators.required,
        Validators.maxLength(this.messageService.maxLengthCarParkLotNumber)])],
    });
    this.form.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.form, this.formErrors));
    this.messageService.onValueChanged(this.form, this.formErrors);
  }

}
