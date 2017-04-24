import { Component } from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ViewController, ToastController, MenuController, NavParams } from 'ionic-angular';
import { UserNamesEnum } from '../../user/shared/user-names.enum';
import { UserModel } from '../../user/shared/user.model';
import { UtilsPage } from '../../shared/utils.page';
import { UserService } from '../../user/shared/user.service';
import { CarModel } from '../shared/car.model';

@Component({
  selector: 'page-select-cleaner',
  templateUrl: './select-cleaner.html'
})
export class SelectCleanerPage extends UtilsPage {

  cleaners: Array<UserModel>;
  selectedCleaner = new UserModel();
  carToWash: CarModel;

  constructor(public viewCtrl: ViewController, public domSanitizer: DomSanitizer,
              public toastCtrl: ToastController, public userService: UserService, public params: NavParams) {

    super(toastCtrl);
    this.cleaners = new Array<UserModel>();
    this.carToWash = params.get('carToWash') ? params.get('carToWash') : new CarModel();
    let dayIndex = params.get('dayIndex');
    if (this.carToWash.subscription.days[dayIndex].cleanerName) {
      this.selectedCleaner.name = this.carToWash.subscription.days[dayIndex].cleanerName;
      this.selectedCleaner.uid = this.carToWash.subscription.days[dayIndex].cleanerUid;
    }
  }

  ngOnInit() {
    this.userService.getUserNames(UserNamesEnum.washerNames, this.carToWash.subscription.carParkId)
      .then(cleaners => this.cleaners = cleaners)
      .catch(err => {
        console.log(err);
        this.showToast('Fail to get cleaners list', 'toastError');
      });
  }

  getCleanerName = (cleaner: UserModel): SafeHtml => {
    let html = `<span>${cleaner.name}</span>`;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  };

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  select() {
    this.viewCtrl.dismiss(this.selectedCleaner);
  }

}
