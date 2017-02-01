import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ValidationMessageService } from "../../shared/validator/validation-message.service";
import { ViewController } from "ionic-angular";

@Component({
  selector: 'app-car-lot-number',
  templateUrl: 'car-lot-number.html'
})
export class CarLotNumberDialog implements OnInit {

  form: FormGroup;
  formErrors = {
    carParkLotNumber: ''
  };

  constructor(private viewCtrl: ViewController, private formBuilder: FormBuilder,
              private messageService: ValidationMessageService) {
    this.buildForm();
  }

  ngOnInit() {
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
