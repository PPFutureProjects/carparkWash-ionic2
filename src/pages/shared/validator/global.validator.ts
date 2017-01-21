import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

export class GlobalValidator {

  static samePasswordValidation = {};
  private static password;
  private static confirmPassword;

  static samePassword(currentForm, currentComponent) {
    const passwordValueChanges$ = currentForm.controls["password"].valueChanges;
    const confirmPasswordValueChanges$ = currentForm.controls["confirmPassword"].valueChanges;

    let passwordChangesSub = passwordValueChanges$.subscribe(password => {
      this.password = password;
      if (password === this.confirmPassword) {
        currentForm.controls["confirmPassword"].setErrors(null);
      } else {
        currentForm.controls["confirmPassword"].setErrors({"notMatch": true});
      }
    });

    let confirmPasswordChangesSub = confirmPasswordValueChanges$.subscribe(confirmPassword => {
      this.confirmPassword = confirmPassword;
      if (confirmPassword === this.password) {
        currentForm.controls["confirmPassword"].setErrors(null);
      } else {
        currentForm.controls["confirmPassword"].setErrors({"notMatch": true});
      }
    });
    this.samePasswordValidation[currentComponent] = [passwordChangesSub, confirmPasswordChangesSub];
  }

  static endSamePassword(currentForm, currentComponent) {
    this.samePasswordValidation[currentComponent]
      .map((valueChanges: Subscription) => valueChanges.unsubscribe());
  }

  static mailFormat(control: FormControl): ValidationResult {

    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

    if (control && control.value && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
      return {"incorrectMailFormat": true};
    }
    return null;
  }

}

export interface ValidationResult {
  [key: string]: boolean;
}
