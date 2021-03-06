import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable()
export class ValidationMessageService {

  public maxLengthEmail = 40;
  public minLengthName = 2;
  public maxLengthName = 20;
  public minLengthPassword = 6;
  public maxLengthPassword = 20;
  public minLengthAddress = 5;
  public maxLengthAddress = 50;
  public maxLengthBrand = 20;
  public maxLengthModel = 20;
  public minLengthLicencePlateNumber = 3;
  public maxLengthLicencePlateNumber = 10;
  public maxLengthCarColour = 20;
  public maxLengthCarParkCode = 10;
  public maxLengthCarParkLotNumber = 15;

  validationMessages = {
    'email': {
      'required': this.required('Email'),
      'maxlength': this.maxLength('Email', this.maxLengthEmail),
      'incorrectMailFormat': this.incorrectFormat('Email')
    },
    'name': {
      'required': this.required('Name'),
      'minlength': this.minLength('Name', this.minLengthName),
      'maxlength': this.maxLength('Name', this.maxLengthName)
    },
    'password': {
      'required': this.required('Password'),
      'minlength': this.minLength('Password', this.minLengthPassword),
      'maxlength': this.maxLength('Password', this.maxLengthPassword)
    },
    'newPassword': {
      'required': this.required('New Password'),
      'minlength': this.minLength('New Password', this.minLengthPassword),
      'maxlength': this.maxLength('New Password', this.maxLengthPassword)
    },
    'oldPassword': {
      'required': this.required('Old Password'),
      'minlength': this.minLength('Old Password', this.minLengthPassword),
      'maxlength': this.maxLength('Old Password', this.maxLengthPassword)
    },
    'confirmPassword': {
      'required': this.required('Confirm Password'),
      'notMatch': this.match('Confirm Password', 'Password')
    },
    'address': {
      'required': this.required('Address'),
      'minlength': this.minLength('Address', this.minLengthAddress),
      'maxlength': this.maxLength('Address', this.maxLengthAddress)
    },
    'phoneNumber': {
      'required': this.required('Phone Number'),
      'pattern': this.incorrectFormat('Phone Number')
    },
    'profile': {
      'required': this.required('Profile'),
    },
    'licencePlateNumber': {
      'required': this.required('Licence Plate Number'),
      'minlength': this.minLength('Licence Plate Number', this.minLengthLicencePlateNumber),
      'maxlength': this.maxLength('Licence Plate Number', this.maxLengthLicencePlateNumber)
    },
    'brand': {
      'required': this.required('Brand'),
      'maxlength': this.maxLength('Brand', this.maxLengthBrand)
    },
    'model': {
      'required': this.required('Model'),
      'maxlength': this.maxLength('Model', this.maxLengthModel)
    },
    'colour': {
      'required': this.required('Car Colour'),
      'maxlength': this.maxLength('Car Colour', this.maxLengthCarColour)
    },
    'carParkCode': {
      'required': this.required('Car park code'),
      'maxlength': this.maxLength('Car park code', this.maxLengthCarParkCode)
    },
    'carParkLotNumber': {
      'required': this.required('Car park Lot Number'),
      'maxlength': this.maxLength('Car park Lot Number', this.maxLengthCarParkLotNumber)
    },
    'sex': {
      'required': this.required('Sex'),
    },
    'dateOfBirth': {
      'required': this.required('Date Of Birth'),
    },
    'nricNo': {
      'required': this.required('Nric No.'),
    },
    'race': {
      'required': this.required('Race'),
    },
    'bankAccountDetails': {
      'required': this.required('Bank Account Details'),
    },
    'accountNumber': {
      'required': this.required('Account Number'),
    },

  };

  onValueChanged(currentForm: FormGroup, formErrors: any) {
    if (!currentForm) {
      return;
    }
    for (const field in formErrors) {
      // clear previous error messageService (if any)
      formErrors[field] = '';
      const control = currentForm.get(field);
      if (control && control.dirty && !control.valid) {
        const messages = this.validationMessages[field];
        for (const key in control.errors) {
          formErrors[field] += messages[key] + '\n';
        }
      }
    }
  }

  private minLength(field, minLength): string {
    return `The ${field} must be at least ${minLength} characters long.`;
  }

  private maxLength(field: string, maxLength: number): string {
    return `The ${field} cannot be more than ${maxLength} characters long.`;
  }

  private required(field: string): string {
    return `The ${field} is required.`;
  }

  private match(field1: string, field2: string) {
    return `${field1} doesn\'t match ${field2}.`;
  }

  private incorrectFormat(field: string) {
    return `The ${field} format is not correct.`
  }
}
