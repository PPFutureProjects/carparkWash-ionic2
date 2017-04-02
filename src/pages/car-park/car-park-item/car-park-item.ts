import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  ToastController,
  NavController,
  ModalController,
  LoadingOptions,
  LoadingController,
  AlertController, MenuController
} from 'ionic-angular';
import { CarParkModel } from '../shared/car-park.model';
import { CarParkService } from '../shared/car-park.service';
import { UserService } from '../../user/shared/user.service';
import { UserModel } from '../../user/shared/user.model';
import { SubscriberService } from '../../car/subscription/subscriber.service';
import { CarService } from '../../car/shared/car.service';
import { ProfileEnum } from '../../user/shared/profile.enum';
import { UtilsPage } from '../../shared/utils.page';
import { CarListPage } from '../../car/car-list/car-list';
import { EditCarParkPage } from '../edit-car-park/edit-car-park';

@Component({
  selector: 'app-car-park-item',
  templateUrl: 'car-park-item.html',
})
export class CarParkItemComponent extends UtilsPage {

  currentUser: UserModel;

  profileTypeEnum = ProfileEnum;

  @Input() carPark: CarParkModel;
  @Input() isSelected: boolean;
  @Output() toRremove = new EventEmitter<CarParkModel>();

  private loadingOptions: LoadingOptions;

  constructor(public carParkService: CarParkService, public userService: UserService,
              public subscriberService: SubscriberService, public carService: CarService,
              public toastCtrl: ToastController, public navCtrl: NavController,
              public modalCtrl: ModalController, public loadingCtrl: LoadingController,
              public alertCtrl: AlertController) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.currentUser = new UserModel();
    this.userService.getCurrent().then(user => this.currentUser = user)
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
  }

  getCarsSubscribed() {
    this.carParkService.selectedCarPark = this.carPark;
    this.navCtrl.push(CarListPage);
  }

  // no more used
  subscribeWashService() {
    if (this.carService.selectedCar) {
      this.subscriberService.subscribe(this.carPark, this.carService.selectedCar)
        .then(() => {
          this.navCtrl.pop();
          this.showToast(`the car ${this.carService.selectedCar.licencePlateNumber}
                  is subscribed to the car park ${this.carPark.code}`, 'toastInfo');
        })
        .catch(err => {
          console.error(err);
          this.showToast('Fatal Error, please contact admin', 'toastError');
        });
    } else {
      console.error('Can\'t subscribe to an undefined car');
      this.showToast('Fatal Error, please contact admin', 'toastError');
    }
  }

  edit() {
    let editCarParkPage = this.modalCtrl.create(EditCarParkPage, {'carParkToEdit': this.carPark});
    editCarParkPage.onDidDismiss((carParkToUpdate: {carPark: CarParkModel, manager: UserModel}) => {
      if (carParkToUpdate) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carParkService.update(carParkToUpdate)
          .then(() => {
            this.carPark = carParkToUpdate.carPark;
            loading.dismissAll();
            this.showToast(`The car park ${this.carPark.code} was updated successfully`, 'toastInfo');
          })
          .catch(err => {
            loading.dismissAll();
            console.error(err);
            this.showToast(`Fail to update ${this.carPark.code}`, 'toastError');
          });
      }
    });
    editCarParkPage.present();
  }

  remove() {
    this.alertCtrl.create({
      title: 'CONFIRM DELETION',
      message: `Are you sure you would like to delete ${this.carPark.code} ?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'OK',
          handler: () => {
            this.toRremove.emit(this.carPark);
          }
        }
      ]
    }).present();
  }

}

