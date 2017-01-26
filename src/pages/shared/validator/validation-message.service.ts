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
  public maxLengthBrandModel = 20;
  public minLengthLicencePlateNumber = 3;
  public maxLengthLicencePlateNumber = 10;
  public maxLengthCarColour = 20;
  public minLengthCarParkName = 3;
  public maxLengthCarParkName = 20;

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
    'region': {
      'required': this.required('Region'),
    },
    'area': {
      'required': this.required('Area'),
      'minlength': this.minLength('Area', this.minLengthCarParkName),
      'maxlength': this.maxLength('Area', this.maxLengthCarParkName)
    },
    'phoneNumber': {
      'required': this.required('Phone Number'),
      'pattern': this.required('Phone Number') + '\nOr\n' + this.incorrectFormat('Phone Number')
    },
    'profile': {
      'required': this.required('Profile'),
    },
    'licencePlateNumber': {
      'required': this.required('Licence Plate Number'),
      'minlength': this.minLength('Licence Plate Number', this.minLengthLicencePlateNumber),
      'maxlength': this.maxLength('Licence Plate Number', this.maxLengthLicencePlateNumber)
    },
    'brandModel': {
      'maxlength': this.maxLength('Brand & Model', this.maxLengthBrandModel)
    },
    'colour': {
      'maxlength': this.maxLength('Car Colour', this.maxLengthCarColour)
    },
    'nbPlaces': {
      'pattern': this.required('Number of parks') + '\nOr\n' + this.incorrectFormat('Number of parks')
    },
    'carParkName': {
      'required': this.required('Car park name'),
      'minlength': this.minLength('Car park name', this.minLengthCarParkName),
      'maxlength': this.maxLength('Car park name', this.maxLengthCarParkName)
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
