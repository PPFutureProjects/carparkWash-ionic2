import { Component, Input } from '@angular/core';

import { UtilsPage } from '../../shared/utils.page';
import { UserModel } from '../../user/shared/user.model';
import { ToastController } from 'ionic-angular';

@Component({
  selector: 'profile-information',
  templateUrl: './information.html'
})
export class InformationComponent extends UtilsPage {

  @Input() currentUser: UserModel;

  constructor(public toastCtrl: ToastController) {
    super(toastCtrl);
  }
}
