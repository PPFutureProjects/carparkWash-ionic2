import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CarModel } from '../car.model';
import { CarService } from '../car.service';
import { UserService } from '../../user/user.service';
import { UserModel } from '../../user/user.model';
import { ProfileTypeEnum } from '../../shared/profile-type.enum';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';
import { CarParkModel } from '../../car-park/car-park.model';
import { CarParkService } from '../../car-park/car-park.service';
import { WashStateEnum } from '../../shared/subscription/wash-state.enum';
import { AbstractPage } from '../../shared/abstract.page';
import {
  ToastController,
  LoadingController,
  LoadingOptions,
  NavController,
  AlertController,
  ModalController
} from 'ionic-angular';
import { CarParkListPage } from '../../car-park/car-park-list/car-park-list';
import { EditCarPage } from '../edit-car/edit-car';

@Component({
  selector: 'app-car-item',
  templateUrl: 'car-item.html',
})
export class CarItemComponent extends AbstractPage {

  currentUser: UserModel;
  carParkSubscribed: CarParkModel;
  dayIndex: number;
  profileTypeEnum = ProfileTypeEnum;
  washStateEnum = WashStateEnum;
  @Input() car: CarModel;
  @Input() subscription: SubscriptionModel;
  @Input() isSelected: boolean;
  @Output() removed = new EventEmitter<boolean>();

  private loadingOptions: LoadingOptions;

  constructor(public carService: CarService, public userService: UserService, public carParkService: CarParkService,
              public subscriberService: SubscriberService, public toastCtrl: ToastController, public modalCtrl: ModalController,
              public loadingCtrl: LoadingController, public navCtrl: NavController, public alertCtrl: AlertController) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.userService.getCurrent()
      .then(user => this.currentUser = user)
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
  }

  ionViewWillEnter() {
    //if (!this.car && !this.subscription) {
    //  this.router.navigate(['']);
    //} else {
    if (this.subscription) {
      this.car = this.subscription.car;
      this.carParkService.getBySubscription(this.subscription)
        .then(carPark => this.carParkSubscribed = carPark);
    } else if (this.car.subscription) {
      this.subscription = this.car.subscription;
      this.carParkService.getBySubscription(this.car.subscription)
        .then(carPark => this.carParkSubscribed = carPark);
    }
    if (this.subscription) {
      this.dayIndex = Math.round((new Date().getTime() - this.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
    }
    //}
  }

  isUnlocked() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);
    return this.carParkSubscribed && this.carParkSubscribed.unlocked === today.getTime();
  }

  selectToSubscribe() {
    this.carService.selectedCar = this.car;
    this.navCtrl.push(CarParkListPage);
  }

  selectToWash() {
    this.subscriberService.selectToBeWashed(this.subscription)
      .then(() => this.showToast(`The car ${this.car.licencePlateNumber} is to be washed`, 'toastInfo'))
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });

  }

  selectAsWashed() {
    this.subscriberService.setToWashed(this.subscription, this.currentUser)
      .then(() => this.showToast('The selected car is washed', 'toastInfo'))
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
  }

  edit() {
    let editCarPage = this.modalCtrl.create(EditCarPage, {'carToEdit': this.car});
    editCarPage.onDidDismiss((updatedCar: CarModel) => {
      if (updatedCar) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carService.update(updatedCar)
          .then(() => {
            this.car = updatedCar;
            loading.dismissAll();
            this.showToast(`Updating ${this.car.licencePlateNumber} success`, 'toastError');
          })
          .catch(err => {
            loading.dismissAll();
            console.error(err);
            this.showToast(`Fail to update ${this.car.licencePlateNumber}`, 'toastError');
          });
      }
    });
    editCarPage.present();
  }

  remove() {
    this.alertCtrl.create({
      title: 'Confirmation of deletion',
      message: `Are you sure to remove this ${this.car.licencePlateNumber} ?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'OK',
          handler: () => {
            let loading = this.loadingCtrl.create(this.loadingOptions);
            loading.present();
            this.carService.remove(this.car)
              .then(data => {
                loading.dismissAll();
                this.removed.emit(true);
                console.log(data);
                this.showToast(`The car ${this.car.licencePlateNumber} was removed successfully`, 'toastError');
              })
              .catch(err => {
                loading.dismissAll();
                console.log(err);
                this.showToast(`Could not remove the car ${this.car.licencePlateNumber}, please contact admin`,
                  'toastError');
              });
          }
        }
      ]
    }).present();
  }

}
