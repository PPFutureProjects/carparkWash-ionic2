import { Component, Input, Output, EventEmitter, AfterContentInit, ViewChild, ElementRef } from '@angular/core';
import { CarModel } from '../shared/car.model';
import { CarService } from '../shared/car.service';
import { UserService } from '../../user/shared/user.service';
import { UserModel } from '../../user/shared/user.model';
import { ProfileEnum } from '../../user/shared/profile.enum';
import { SubscriberService } from '../subscription/subscriber.service';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { WashStateEnum } from '../../shared/wash-state.enum';
import { UtilsPage } from '../../shared/utils.page';
import {
  ToastController,
  LoadingController,
  LoadingOptions,
  NavController,
  AlertController,
  ModalController
} from 'ionic-angular';
import { EditCarPage } from '../edit-car/edit-car';
import { EventBus } from '../../shared/eventBus';
import { JobStateEnum } from '../../shared/job/job-state.enum';
import { SelectCleanerPage } from '../select-cleaner/select-cleaner';
import { SubscriptionPage } from '../subscription/subscription';
import { SubscriptionModel } from '../subscription/subscription.model';

@Component({
  selector: 'app-car-item',
  templateUrl: 'car-item.html'
})
export class CarItemComponent extends UtilsPage implements AfterContentInit {

  currentUser: UserModel;
  dayIndex: number;
  initDone: boolean = true;

  @ViewChild('carThumb') carThumb: ElementRef;

  @Input() car: CarModel;
  @Input() carParkSubscribed: CarParkModel;
  @Input() isSelected: boolean;
  @Input() isEdit: boolean = false;
  @Output() toRemove = new EventEmitter<CarModel>();

  jobStateEnum = JobStateEnum;
  profileEnum = ProfileEnum;
  washStateEnum = WashStateEnum;

  private loadingOptions: LoadingOptions;

  constructor(public carService: CarService, public userService: UserService, public carParkService: CarParkService,
              public modalCtrl: ModalController, public subscriberService: SubscriberService,
              public toastCtrl: ToastController, public loadingCtrl: LoadingController,
              public navCtrl: NavController, private alertCtrl: AlertController, public eventBus: EventBus) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    this.eventBus.carUpdated$.subscribe(() => {
      if (this.car.subscription) {
        this.initDone = false;
        //TODO this will be removed may be ?
        this.carParkService.getById(this.car.subscription.carParkId).then(carPark => {
          this.carParkSubscribed = carPark;
          this.initDone = true;
        });
        this.dayIndex = Math.round((new Date().getTime() - this.car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
      }
    });

    this.userService.getCurrent()
      .then(user => this.currentUser = user)
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
  }

  ngAfterContentInit() {
    if (!this.car) {
      // this.router.navigate(['']);
    } else {
      this.initDone = false;
      if (this.carParkSubscribed) {
        this.dayIndex = Math.round((new Date().getTime() - this.car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
        this.initDone = true;
        this.initThumbCss();
      } else if (this.car.subscription && !this.carParkSubscribed) {
        this.carParkService.getById(this.car.subscription.carParkId).then(carPark => {
          this.carParkSubscribed = carPark;
          this.initDone = true;
          this.initThumbCss();
        }).catch(err => {
          this.initDone = true;
          this.initThumbCss();
          console.log(err);
        });
        this.dayIndex = Math.round((new Date().getTime() - this.car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
      } else {
        this.initDone = true;
        this.initThumbCss();
      }
    }
  }

  initThumbCss() {
    setTimeout(() => {
      if (!this.carThumb) {
        this.initThumbCss();
      } else if (this.carThumb.nativeElement.width < this.carThumb.nativeElement.height) {
        this.carThumb.nativeElement.className += ' portrait';
      }
    }, 100);
  }

  selectToWash() {
    if (this.currentUser.profile === ProfileEnum.client) {
      let isActifSubscription = true;
      // 30 days === 2592000000 milliseconds
      if (new Date().getTime() - this.car.subscription.dateSubscription >= 2592000000) {
        isActifSubscription = false;
        // TODO alert: your subscription is expired do you want to resubscribe ?
        console.log('alert: your subscription is expired do you want to resubscribe');
        this.alertCtrl.create({
          title: 'Subscription Expired',
          message: `Do you want to renew your subscription for the car ${this.car.licencePlateNumber} ?`,
          buttons: [{
            text: 'Cancel'
          }, {
            text: 'OK', handler: () => {
              this.subscribe();
            }
          }]
        }).present();
      }

      let subscriptionPage = this.modalCtrl.create(SubscriptionPage, {
        carToSubscribe: this.car,
        carParkSubscribed: this.carParkSubscribed,
        isActifSubscription: isActifSubscription
      });
      subscriptionPage.onDidDismiss((result: {carPark: CarParkModel, lotNumber: string}) => {
        console.log(result.lotNumber);
        if (result.lotNumber) {
          this.subscriberService.selectToBeWashed(this.car.subscription, result.lotNumber)
            .then(() => this.showToast(`The car ${this.car.licencePlateNumber} is to be washed`, 'toastInfo'))
            .catch(err => {
              console.error(err);
              this.showToast('Fatal Error, please contact admin', 'toastError');
            });
        }
      });
      subscriptionPage.present();
    }
  }

  selectCleaner() {
    let dialogRef = this.modalCtrl.create(SelectCleanerPage, {carToWash: this.car, dayIndex: this.dayIndex});
    dialogRef.onDidDismiss((cleaner: UserModel) => {
      if (cleaner) {
        this.subscriberService.createJob(this.car, cleaner, this.dayIndex)
          .then(() => this.showToast(`A job is created for the cleaner ${cleaner.name}`, 'toastInfo'))
          .catch(err => {
            console.error(err);
            this.showToast('Fatal Error, please contact admin', 'toastError');
          });
      }
    });
    dialogRef.present();
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
            this.showToast(`${this.car.licencePlateNumber} successfully updated`, 'toastInfo');
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
          this.toRemove.emit(this.car);
        }
      }]
    }).present();
  }

  private subscribe() {
    let subscriptionPage = this.modalCtrl.create(SubscriptionPage,
      {carToSubscribe: this.car, isActifSubscription: false});
    subscriptionPage.onDidDismiss((result: {carPark: CarParkModel, lotNumber: string}) => {
      console.log(result.carPark);
      if (result.carPark) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.subscriberService.subscribe(result.carPark, this.car).then(() => {
          loading.dismissAll();
          this.showToast(`the car ${this.car.licencePlateNumber}
                is subscribed to the car park ${result.carPark.address}`, 'toastInfo');
        }).catch(err => {
          loading.dismissAll();
          console.error(err);
          this.showToast('Fatal Error, please contact admin', 'toastError');
        });
      }
    });
    subscriptionPage.present();
  }

  private isActifSubscription(subscription: SubscriptionModel) {
    if (subscription) {
      let today = new Date();
      let priorBefaure30Days = new Date(new Date().setDate(today.getDate() - 30));
      if (priorBefaure30Days < new Date(subscription.dateSubscription)) {
        return true;
      }
    }
    return false;
  }
}
