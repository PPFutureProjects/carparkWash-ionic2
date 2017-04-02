import { Component } from '@angular/core';
import {
  LoadingOptions, ToastController, ModalController, LoadingController, NavParams, Loading,
  MenuController
} from 'ionic-angular';
import { UserModel } from '../../user/shared/user.model';
import { UserService } from '../../user/shared/user.service';
import { CarService } from '../../car/shared/car.service';
import { UtilsPage } from '../../shared/utils.page';
import { EditCarPage } from '../../car/edit-car/edit-car';
import { CarModel } from '../../car/shared/car.model';

@Component({
  selector: 'page-add-edit-cars',
  templateUrl: 'add-edit-cars.html'
})
export class AddEditCarPage extends UtilsPage {

  currentUser: UserModel;

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public carService: CarService,
              public loadingCtrl: LoadingController, public params: NavParams,
              public toastCtrl: ToastController, public modalCtrl: ModalController,
              public menuCtrl: MenuController) {

    super(toastCtrl);
    this.currentUser = new UserModel();
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    //TODO test if this is OK
    this.userService.getCurrent(false).then(user => {
      this.currentUser = user;
      loading.dismissAll();
    }).catch(err => {
      console.error(err);
      loading.dismissAll();
      this.showToast('Fail to get user data', 'toastError');
    });
    // this.userService.getCurrent(false).then(user => {
    //   if (!this.user.email) {
    //     this.user = user;
    //   }
    //   if (this.carService.selectedCar) {
    //     for (let car of this.user.cars) {
    //       if (car.id === this.carService.selectedCar.id) {
    //         car.subscription = this.carService.selectedCar.subscription;
    //         break;
    //       }
    //     }
    //     this.eventBus.updateCarItem(true);
    //   }
    //   this.carService.selectedCar = undefined;
    //   loading.dismiss();
    // }).catch(err => {
    //   console.error(err);
    //   loading.dismiss();
    //   this.showToast('Fail to get user data', 'toastError');
    // });
  }

  toggleMenu() {
    this.menuCtrl.toggle();
  }

  removeCar(car) {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.carService.remove(car)
      .then(() => {
        this.updateUserFromDatabase(`The car ${car.licencePlateNumber} was removed successfully`, loading);
      })
      .catch(err => {
        console.log(err);
        loading.dismissAll();
        this.showToast(`Could not remove the car ${car.licencePlateNumber}, please contact admin`, 'toastError');
      });
  }

  /**
   * Called after car or carpark is deleted
   */
  private updateUserFromDatabase(toastMsg: string, loading: Loading) {
    this.userService.getCurrent(false).then(user => {
      this.currentUser = user;
      loading.dismissAll();
      this.showToast(toastMsg, 'toastInfo');
    }).catch(err => {
      loading.dismissAll();
      console.log(err);
      this.showToast(`Fatal Error, please contact admin`, 'toastError');
    });
  }

  addCar() {
    let editCarPage = this.modalCtrl.create(EditCarPage);
    // editCarPage.onDidDismiss((newCar: CarModel) => {
      // if (newCar) {
      //   let loading = this.loadingCtrl.create(this.loadingOptions);
      //   loading.present();
      //   this.carService.add(this.currentUser, newCar).then(() => {
      //     loading.dismissAll();
      //     this.showToast(`The car ${newCar.licencePlateNumber} added successfully`, 'toastInfo');
      //   }).catch(err => {
      //     loading.dismissAll();
      //     console.error(err);
      //     this.showToast(`Fail to add ${newCar.licencePlateNumber}`, 'toastError');
      //   });
      // }
    // });
    editCarPage.present();
  }

}
