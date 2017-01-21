import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CarParkModel } from '../car-park.model';
import { CarParkService } from '../car-park.service';
import { UserService } from '../../user/user.service';
import { UserModel } from '../../user/user.model';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { CarService } from '../../car/car.service';
import { ProfileTypeEnum } from '../../shared/profile-type.enum';
import { AbstractPage } from '../../shared/abstract.page';
import {
  ToastController,
  NavController,
  ModalController,
  LoadingOptions,
  LoadingController,
  AlertController
} from 'ionic-angular';
import { CarListPage } from '../../car/car-list/car-list';
import { EditCarParkPage } from '../edit-car-park/edit-car-park';

@Component({
  selector: 'app-car-park-item',
  templateUrl: 'car-park-item.html',
})
export class CarParkItemComponent extends AbstractPage {

  currentUser: UserModel;
  profileTypeEnum = ProfileTypeEnum;
  @Input() carPark: CarParkModel;
  @Output() removed = new EventEmitter<boolean>();

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

  //ngOnInit() {
  //  if (!this.carPark) {
  //    this.router.navigate(['']);
  //  }
  //}

  select() {
    this.carParkService.selectedCarPark = this.carPark;
    this.navCtrl.push(CarListPage);
  }

  subscribeWashService() {
    if (this.carService.selectedCar) {
      this.subscriberService.subscribe(this.carPark, this.carService.selectedCar)
        .then(() => {
          this.navCtrl.pop();
          this.showToast(`the selected car is subscribed to the carpark ${this.carPark.name}`, 'toastInfo');
        })
        .catch(err => {
          console.error(err);
          this.showToast('Fatal Error, please contact admin', 'toastError');
        });
    } else {
      console.error('can\'t subscribe to an undefined car');
      this.showToast('Fatal Error, please contact admin', 'toastError');
    }
  }

  isUnlocked() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);
    return this.carPark.unlocked === today.getTime();
  }

  unlock() {
    this.subscriberService.unlock(this.carPark)
      .then(() => this.showToast(`the car park ${this.carPark.name} is unlocked`, 'toastInfo'))
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
  }

  edit() {
    let editCarParkPage = this.modalCtrl.create(EditCarParkPage, {'carParkToEdit': this.carPark});
    editCarParkPage.onDidDismiss((updatedCarPark: CarParkModel) => {
      if (updatedCarPark) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carParkService.update(updatedCarPark)
          .then(() => {
            this.carPark = updatedCarPark;
            loading.dismissAll();
            this.showToast('Updating selected carpark success', 'toastInfo');
          })
          .catch(err => {
            loading.dismissAll();
            console.error(err);
            this.showToast('Fail to update carpark', 'toastError');
          });
      }
    });
    editCarParkPage.present();
  }

  remove() {
    this.alertCtrl.create({
      title: 'Confirmation of deletion',
      message: `Are you sure to remove this ${this.carPark.name} ?`,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'OK',
          handler: () => {
            let loading = this.loadingCtrl.create(this.loadingOptions);
            loading.present();
            this.carParkService.remove(this.carPark).then(data => {
              this.removed.emit(true);
              loading.dismissAll();
              console.log(data);
              this.showToast(`The Carpark ${this.carPark.name} was removed successfully`, 'toastInfo');
            }).catch(err => {
              loading.dismissAll();
              console.log(err);
              this.showToast(`Could not remove the carpark ${this.carPark.name}, please contact admin`,
                'toastError');
            });
          }
        }
      ]
    }).present();
  }

}
