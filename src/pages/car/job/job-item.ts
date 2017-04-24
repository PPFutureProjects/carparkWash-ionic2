import { Component, Input } from '@angular/core';
import { CarModel } from '../shared/car.model';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { JobStateEnum, JobState } from '../../shared/job/job-state.enum';
import { SubscriberService } from '../subscription/subscriber.service';
import { UtilsPage } from '../../shared/utils.page';
import { ToastController, AlertController, LoadingController, ModalController, LoadingOptions } from 'ionic-angular';
import { UserService } from '../../user/shared/user.service';
import { UserModel } from '../../user/shared/user.model';
import { WashStateEnum } from '../../shared/wash-state.enum';

@Component({
  selector: 'job-item',
  templateUrl: 'job-item.html'
})
export class JobItemComponent extends UtilsPage {

  washStateEnum = WashStateEnum;
  jobStateEnum = JobStateEnum;

  @Input() car: CarModel;

  private currentUser: UserModel;
  private carParkSubscribed: CarParkModel;
  private dayIndex: number;
  private loadingOptions: LoadingOptions;


  constructor(public carParkService: CarParkService, public subscriberService: SubscriberService, public userService: UserService,
              public modalCtrl: ModalController, public toastCtrl: ToastController, public alertCtrl: AlertController,
              public loadingCtrl: LoadingController) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
  }

  ngAfterContentInit() {
    this.userService.getCurrent()
      .then(user => this.currentUser = user)
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });

    this.carParkService.getById(this.car.subscription.carParkId).then(carPark => {
      this.carParkSubscribed = carPark;
    });
    this.dayIndex = Math.round((new Date().getTime() - this.car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
  }

  accept() {
    this.acceptRejectJob(JobStateEnum.accepted);
  }

  reject() {
    this.acceptRejectJob(JobStateEnum.rejected);
  }

  private acceptRejectJob(jobStateEnum: JobState) {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.subscriberService.respondToJob(this.currentUser, this.car, this.dayIndex, jobStateEnum).then(() => {
      loading.dismissAll();
      this.showToast(`The job is ${jobStateEnum}`, 'toastInfo');
    }).catch(err => {
      loading.dismissAll();
      console.error(err);
      this.showToast(`Fail to ${jobStateEnum} the job`, 'toastError');
    });
  }

  selectAsWashed() {
    this.subscriberService.setToWashed(this.car.subscription, this.currentUser)
      .then(() => this.showToast('The selected car is washed', 'toastInfo'))
      .catch(err => {
        console.error(err);
        this.showToast('Fatal Error, please contact admin', 'toastError');
      });
  }

  notifyNotFound() {
    this.alertCtrl.create({
      title: 'CONFIRMATION',
      message: `Are you sure you didn't found the car ${this.car.licencePlateNumber} ?`,
      buttons: [{
        text: 'Cancel'
      }, {
        text: 'Yes', handler: () => {
          let loading = this.loadingCtrl.create(this.loadingOptions);
          loading.present();
          this.subscriberService.notifyCarNotFound(this.car, this.dayIndex)
            .then(() => {
              loading.dismissAll();
              this.showToast(`The car owner is notified`, 'toastInfo');
            })
            .catch(err => {
              loading.dismissAll();
              console.error(err);
              this.showToast(`Fail to notify the car owner`, 'toastError');
            });
        }
      }]
    }).present();
  }

}
