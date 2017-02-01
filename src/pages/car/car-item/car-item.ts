import { Component, Input, Output, EventEmitter, AfterContentInit } from '@angular/core';
import { CarModel } from '../shared/car.model';
import { CarService } from '../shared/car.service';
import { UserService } from '../../user/user.service';
import { UserModel } from '../../user/user.model';
import { ProfileEnum } from '../../shared/profile.enum';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { WashStateEnum } from '../../shared/subscription/wash-state.enum';
import { AbstractPage } from '../../shared/abstract.page';
import {
  ToastController, LoadingController, LoadingOptions, NavController, AlertController, ModalController
} from 'ionic-angular';
import { CarParkListPage } from '../../car-park/car-park-list/car-park-list';
import { EditCarPage } from '../edit-car/edit-car';

@Component({
  selector: 'app-car-item',
  templateUrl: 'car-item.html',
})
export class CarItemComponent extends AbstractPage implements AfterContentInit {

  currentUser: UserModel;
  carParkSubscribed: CarParkModel;
  carParkSubscribedIsUnlocked: boolean;
  dayIndex: number;
  profileEnum = ProfileEnum;
  washStateEnum = WashStateEnum;
  initDone: boolean = true;
  @Input() car: CarModel;
  @Input() subscription: SubscriptionModel;
  @Input() isSelected: boolean;
  @Output() removed = new EventEmitter<boolean>();

  private loadingOptions: LoadingOptions;

  constructor(public carService: CarService, public userService: UserService, public carParkService: CarParkService, public modalCtrl: ModalController, public subscriberService: SubscriberService, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public navCtrl: NavController, private alertCtrl: AlertController) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    // this.currentUser = this.userService.getIfSet();
    // if (!this.currentUser) {
      this.userService.getCurrent()
        .then(user => this.currentUser = user)
        .catch(err => {
          console.error(err);
          this.showToast('Fatal Error, please contact admin', 'toastError');
        });
    // }
  }

  ngAfterContentInit() {
    if (this.subscription) {
      this.initDone = false;
      this.car = this.subscription.car;
      this.carParkService.getBySubscription(this.subscription).then(carPark => {
        this.carParkSubscribed = carPark;
        this.setIsSubscribedCarParkUnlocked();
        this.initDone = true;
      });
    } else if (this.car.subscription) {
      this.initDone = false;
      this.subscription = this.car.subscription;
      this.carParkService.getBySubscription(this.car.subscription).then(carPark => {
        this.carParkSubscribed = carPark;
        this.setIsSubscribedCarParkUnlocked();
        this.initDone = true;
      });
    }
    if (this.subscription) {
      this.dayIndex = Math.round((new Date().getTime() - this.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
    }
  }

  selectToSubscribe() {
    this.carService.selectedCar = this.car;
    this.navCtrl.push(CarParkListPage);
  }

  selectToWash() {
    let prompt = this.alertCtrl.create({
      title: 'Select To be washed', message: 'Enter the Car Park LOT Number', inputs: [{
        name: 'carParkLotNumber', placeholder: 'Car Park Lot Number'
      },], buttons: [{
        text: 'Cancel'
      }, {
        text: 'Select', handler: data => {
          // car lot number is a number
          if (data.carParkLotNumber.length > 0) {
            this.subscriberService.selectToBeWashed(this.subscription, data.carParkLotNumber)
              .then(() => this.showToast(`The car ${this.car.licencePlateNumber} is to be washed`, 'toastInfo'))
              .catch(err => {
                console.error(err);
                this.showToast('Fatal Error, please contact admin', 'toastError');
              });
          } else {
            this.showToast('Car Lot Number cannot be empty', 'toastError');
            this.selectToWash();
          }
        }
      }]
    });
    prompt.present();
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
            this.showToast(`${this.car.licencePlateNumber} successfully updated`, 'toastError');
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
      title: 'CONFIRM DELETION',
      message: `Are you sure you would like to delete ${this.car.licencePlateNumber} ?`,
      buttons: [{
        text: 'Cancel'
      }, {
        text: 'OK', handler: () => {
          let loading = this.loadingCtrl.create(this.loadingOptions);
          loading.present();
          this.carService.remove(this.car).then(data => {
            loading.dismissAll();
            this.removed.emit(true);
            console.log(data);
            this.showToast(`The car ${this.car.licencePlateNumber} was removed successfully`, 'toastError');
          }).catch(err => {
            loading.dismissAll();
            console.log(err);
            this.showToast(`Could not remove the car ${this.car.licencePlateNumber}, please contact admin`,
              'toastError');
          });
        }
      }]
    }).present();
  }

  private setIsSubscribedCarParkUnlocked() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);
    this.carParkSubscribedIsUnlocked = this.carParkSubscribed && this.carParkSubscribed.unlocked === today.getTime();
  }
}
