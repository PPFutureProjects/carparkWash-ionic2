import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { GlobalValidator } from '../../shared/validator/global.validator';

@Component({
  selector: 'page-change-password',
  templateUrl: 'change-password.html'
})
export class ChangePasswordPage {

  oldPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  passwordForm: FormGroup;
  formErrors = {
    oldPassword: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private viewCtrl: ViewController, private formBuilder: FormBuilder,
              private messageService: ValidationMessageService) {

    this.passwordForm = formBuilder.group({
      oldPassword: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      password: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthPassword),
        Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required]
    });
    this.passwordForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.passwordForm, this.formErrors));
    this.messageService.onValueChanged(this.passwordForm, this.formErrors);
  }

  ionViewWillEnter() {
    GlobalValidator.samePassword(this.passwordForm, 'changePassword');
  }

  ionViewWillLeave() {
    GlobalValidator.endSamePassword(this.passwordForm, 'changePassword');
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  save() {
    this.viewCtrl.dismiss({new: this.newPassword, old: this.oldPassword});
  }

}
