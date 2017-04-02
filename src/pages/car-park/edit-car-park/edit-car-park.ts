import { Component } from '@angular/core';
import { ToastController, ViewController, NavParams, ActionSheetController, MenuController } from 'ionic-angular';
import { Camera } from 'ionic-native';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarParkModel } from '../shared/car-park.model';
import { UtilsPage } from '../../shared/utils.page';
import { UserModel } from '../../user/shared/user.model';
import { ProfileEnum } from '../../user/shared/profile.enum';
import { UserService } from '../../user/shared/user.service';
import { UserNames } from '../../user/shared/user-names.enum';
import { CarParkService } from '../shared/car-park.service';

@Component({
  selector: 'page-add-car',
  templateUrl: 'edit-car-park.html',
})
export class EditCarParkPage extends UtilsPage {

  carParkToEdit: CarParkModel;

  selectedCarPark: string | {car_park_no: string, address: string} = <any>{};
  selectedPicture: string;
  selectedAddress: string;
  selectedManager = new UserModel();

  currentUser: UserModel;
  isPictureLoading = false;
  managers: Array<UserModel>;

  profileEnum = ProfileEnum;

  constructor(public viewCtrl: ViewController, public params: NavParams, public domSanitizer: DomSanitizer,
              private carParkService: CarParkService, public userService: UserService,
              public messageService: ValidationMessageService, public toastCtrl: ToastController,
              public actionSheetCtrl: ActionSheetController) {

    super(toastCtrl);
    this.managers = new Array<UserModel>();
    this.carParkToEdit = params.get('carParkToEdit') ? params.get('carParkToEdit') : new CarParkModel();

    this.userService.getCurrent()
      .then(currentUser => {
        this.currentUser = currentUser;
        this.buildForm();
      })
      .catch(err => {
        console.log(err);
        this.showToast('Fail to get user info', 'toastError');
      });
    this.userService.getUserNames(UserNames.managerNames)
      .then(managers => this.managers = managers)
      .catch(err => {
        console.log(err);
        this.showToast('Fail to get managers list', 'toastError');
      });
  }

  getManagerName = (manager: UserModel): SafeHtml => {
    let html = `<span>${manager.name}</span>`;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  };

  getCarParkCode = (carPark: any): SafeHtml => {
    let html = `<span>${carPark.car_park_no}</span>`;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  };

  getCarParkCodes() {
    return this.carParkService.getByCodeAutocompletion(this.selectedCarPark);
  }

  carParkAddressSelected() {
    this.selectedAddress = (<any>this.selectedCarPark).address;
  }

  startPickPicture() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Picture Source',
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.pickPicture(Camera.PictureSourceType.CAMERA).then((imageData) => {
              this.selectedPicture = "data:image/jpeg;base64," + imageData;
            }, (err) => {
              console.log(err);
              this.showToast('Fail to get picture', 'toastError');
            });
          }
        },{
          text: 'Gallery',
          handler: () => {
            this.pickPicture(Camera.PictureSourceType.PHOTOLIBRARY).then((imageData) => {
              this.selectedPicture = "data:image/jpeg;base64," + imageData;
            }, (err) => {
              console.log(err);
              this.showToast('Fail to get picture', 'toastError');
            });
          }
        },{
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    actionSheet.present();
  }

  cancel() {
    this.viewCtrl.dismiss(false)
  }

  save() {
    if ((<any>this.selectedCarPark).car_park_no) {
      this.carParkToEdit.id = (<any>this.selectedCarPark)._id;
      this.carParkToEdit.code = (<any>this.selectedCarPark).car_park_no;
      this.carParkToEdit.x = (<any>this.selectedCarPark).x_coord;
      this.carParkToEdit.y = (<any>this.selectedCarPark).y_coord;
    }
    if (this.selectedAddress) {
      this.carParkToEdit.address = this.selectedAddress;
    }
    if (this.selectedPicture) {
      this.carParkToEdit.picture = this.selectedPicture;
    }
    this.viewCtrl.dismiss({carPark: this.carParkToEdit, manager: this.selectedManager});
  }

  private buildForm() {
    if (this.currentUser.profile === ProfileEnum.admin && this.carParkToEdit.managerUid) {
      this.selectedManager.uid = this.carParkToEdit.managerUid;
      this.selectedManager.name = this.carParkToEdit.managerName;
    } else if (this.currentUser.profile === ProfileEnum.manager) {
      this.selectedManager.uid = this.currentUser.uid;
      this.selectedManager.name = this.currentUser.name;
    }

    if (this.carParkToEdit.code) {
      this.selectedCarPark = this.carParkToEdit.code;
    }
    if (this.carParkToEdit.address) {
      this.selectedAddress = this.carParkToEdit.address;
    }
    if (!this.carParkToEdit.address && !this.carParkToEdit.code) {
      this.selectedCarPark = '';
    }

    if (this.carParkToEdit.picture) {
      this.selectedPicture = this.carParkToEdit.picture;
    }
  }

}
