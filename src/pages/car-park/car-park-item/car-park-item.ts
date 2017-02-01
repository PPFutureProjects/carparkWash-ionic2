import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  ToastController,
  NavController,
  ModalController,
  LoadingOptions,
  LoadingController,
  AlertController
} from 'ionic-angular';
import { CarParkModel } from '../shared/car-park.model';
import { CarParkService } from '../shared/car-park.service';
import { UserService } from '../../user/user.service';
import { UserModel } from '../../user/user.model';
import { SubscriberService } from '../../shared/subscription/subscriber.service';
import { CarService } from '../../car/shared/car.service';
import { ProfileEnum } from '../../shared/profile.enum';
import { AbstractPage } from '../../shared/abstract.page';
import { CarListPage } from '../../car/car-list/car-list';
import { EditCarParkPage } from '../edit-car-park/edit-car-park';
import { Region } from '../car-park-filter/region.enum';

@Component({
  selector: 'app-car-park-item',
  templateUrl: 'car-park-item.html',
})
export class CarParkItemComponent extends AbstractPage {

  currentUser: UserModel;
  isCarParkUnlocked: boolean;
  profileTypeEnum = ProfileEnum;
  @Input() carPark: CarParkModel;
  @Input() isSelected: boolean;
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

  ngAfterContentInit() {
    //  if (!this.carPark) {
    //    this.router.navigate(['']);
    //  }
    this.setIsCarParlUnlocked();
  }

  select() {
    this.carParkService.selectedCarPark = this.carPark;
    this.navCtrl.push(CarListPage);
  }

  subscribeWashService() {
    if (this.carService.selectedCar) {
      this.subscriberService.subscribe(this.carPark, this.carService.selectedCar)
        .then(() => {
          this.navCtrl.pop();
          this.showToast(`the car ${this.carService.selectedCar.licencePlateNumber}
                  is subscribed to the car park ${this.carPark.name}`, 'toastInfo');
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

  unlock() {
    this.subscriberService.unlock(this.carPark)
      .then(() => {
        this.setIsCarParlUnlocked();
        this.showToast(`the car park ${this.carPark.name} is unlocked`, 'toastInfo')
      })
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
  }

  edit() {
    let editCarParkPage = this.modalCtrl.create(EditCarParkPage, {'carParkToEdit': this.carPark});
    editCarParkPage.onDidDismiss((carParkToUpdate: {carpark: CarParkModel, region: Region, area: string}) => {
      if (carParkToUpdate && carParkToUpdate.carpark) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carParkService.update(carParkToUpdate.carpark, carParkToUpdate.region, carParkToUpdate.area)
          .then(() => {
            this.carPark = carParkToUpdate.carpark;
            loading.dismissAll();
            this.showToast(`The car ${this.carPark.name} was updated successfully`, 'toastInfo');
          })
          .catch(err => {
            loading.dismissAll();
            console.error(err);
            this.showToast(`Fail to update ${this.carPark.name}`, 'toastError');
          });
      }
    });
    editCarParkPage.present();
  }

  remove() {
    this.alertCtrl.create({
      title: 'CONFIRM DELETION',
      message: `Are you sure you would like to delete ${this.carPark.name} ?`,
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
              this.showToast(`The carpark ${this.carPark.name} was removed successfully`, 'toastInfo');
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

  private setIsCarParlUnlocked() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setDate(today.getDate() + 1);
    this.isCarParkUnlocked = this.carPark.unlocked === today.getTime();
  }

}
