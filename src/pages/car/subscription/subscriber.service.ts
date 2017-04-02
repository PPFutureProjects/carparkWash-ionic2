import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { ServiceUtils } from '../../shared/utils.service';
import { SubscriptionModel } from './subscription.model';
import { CarModel } from '../shared/car.model';
import { WashStateEnum } from '../../shared/wash-state.enum';
import { UserModel } from '../../user/shared/user.model';
import { JobModel } from '../../shared/job/job.model';
import { JobStateEnum, JobState } from '../../shared/job/job-state.enum';
import { HistoryModel } from '../../history/shared/history.model';
import { LocalNotifications } from 'ionic-native';

@Injectable()
export class SubscriberService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  subscribe(carPark: CarParkModel, car: CarModel) {
    return new Promise((resolve, reject) => {
      //TODO put the right stripe key
      (<any>window).StripeCheckout.configure({
        key: 'pk_test_oi0sKPJYLGjdvOXOM8tE8cMa',
        locale: 'auto',
        token: resolve
      }).open({
        name: '30 day Car Wash',
        description: `Subscribe ${car.licencePlateNumber} in ${carPark.address}`,
        amount: 3000
      });
    }).then(token => {
      // You can access the token ID with `token.id`.
      // Get the token ID to your server-side code for use.
      console.log(token);
      //TODO test on real card
      console.log('test on real card if transaction is done');
      let subscription = new SubscriptionModel();
      subscription.id = this.refDatabase.child('historySubscription').child(car.userUid).push().key;
      subscription.clientUid = car.userUid;
      if (carPark.managerUid) {
        subscription.managerUid = carPark.managerUid;
      }
      subscription.carParkId = carPark.id;
      subscription.carParkCode = carPark.code;
      subscription.carId = car.id;

      let updates = {};
      updates['cars/' + car.id + '/subscription'] = this.getSimpleObject(subscription, true);
      updates['carParks/' + carPark.id + '/subscriptionIds/' + car.id] = true;

      let historyModel = new HistoryModel();
      //TODO do not save all the objet, use utils.service functions
      historyModel.car = car;
      historyModel.carPark = carPark;
      historyModel.subscription = subscription;
      updates['historySubscription/' + car.userUid + '/' + subscription.id] = historyModel;
      return this.refDatabase.update(updates)
        .then(() => {
          car.subscription = subscription;
          if (!carPark.subscriptions) {
            carPark.subscriptions = new Array<SubscriptionModel>();
          }
          carPark.subscriptions.push(subscription);
        });
    });
  }

  selectToBeWashed(subscription: SubscriptionModel, carLotNumber: string) {
    let dayIndex = Math.round((new Date().getTime() - subscription.dateSubscription) / (1000 * 60 * 60 * 24));
    let dayCleanerModel = subscription.days[dayIndex];
    dayCleanerModel.washRequestDate = new Date().getTime();
    dayCleanerModel.washStatus = WashStateEnum.toWash;
    dayCleanerModel.carParkLotNumber = carLotNumber;

    let updates = {};
    updates['cars/' + subscription.carId + '/subscription/days/' + dayIndex] = this.getSimpleObject(dayCleanerModel);
    let dayHistoryPath = 'historySubscription/' + subscription.clientUid + '/' + subscription.id + '/subscription/days/' + dayIndex;
    updates[dayHistoryPath] = this.getSimpleObject(dayCleanerModel);
    return this.refDatabase.update(updates);
  }

  setToWashed(subscription: SubscriptionModel, cleaner: UserModel) {
    let dayIndex = Math.round((new Date().getTime() - subscription.dateSubscription) / (1000 * 60 * 60 * 24));
    let dayCleanerModel = subscription.days[dayIndex];
    dayCleanerModel.washDate = new Date().getTime();
    dayCleanerModel.washStatus = WashStateEnum.washed;
    dayCleanerModel.cleanerUid = cleaner.uid;
    dayCleanerModel.cleanerName = cleaner.name;
    let updates = {};
    updates['cars/' + subscription.carId + '/subscription/days/' + dayIndex] = this.getSimpleObject(dayCleanerModel);
    let dayHistoryPath = 'historySubscription/' + subscription.clientUid + '/' + subscription.id + '/subscription/days/' + dayIndex;
    updates[dayHistoryPath] = this.getSimpleObject(dayCleanerModel);
    return this.refDatabase.update(updates);
  }

  createJob(car: CarModel, cleaner: UserModel, dayIndex: number) {
    let job = new JobModel();
    job.carId = car.id;
    job.cleanerUid = cleaner.uid;
    job.jobState = JobStateEnum.notAnswered;
    job.dayIndex = dayIndex;
    job.assignmentDate = new Date().getTime();

    let updates = {};
    if (car.subscription.days[dayIndex].cleanerUid) {
      updates['users/' + car.subscription.days[dayIndex].cleanerUid + '/jobs/' + car.id] = null;
    }

    car.subscription.days[dayIndex].cleanerUid = cleaner.uid;
    car.subscription.days[dayIndex].cleanerName = cleaner.name;

    updates['users/' + cleaner.uid + '/jobs/' + car.id] = job;
    updates['cars/' + car.id + '/subscription/days/' + dayIndex] = this.getSimpleObject(car.subscription.days[dayIndex]);
    let jobHistoryPath = 'historySubscription/' + car.userUid + '/' + car.subscription.id + '/subscription/days/' + dayIndex + '/job';
    updates[jobHistoryPath] = job;
    return this.refDatabase.update(updates);
  }

  respondToJob(cleaner: UserModel, car: CarModel, dayIndex: number, jobStateEnum: JobState) {
    let answerDate = new Date().getTime();
    let updates = {};
    updates['users/' + cleaner.uid + '/jobs/' + car.id + '/jobState'] = jobStateEnum;
    updates['users/' + cleaner.uid + '/jobs/' + car.id + '/answerDate'] = answerDate;
    let jobHistoryPath = 'historySubscription/' + car.userUid + '/' + car.subscription.id + '/subscription/days/' + dayIndex + '/job';
    updates[jobHistoryPath + '/jobState'] = jobStateEnum;
    updates[jobHistoryPath + '/answerDate'] = answerDate;
    return this.refDatabase.update(updates)
      .then(() => {
        car.subscription.days[dayIndex].job.answerDate = answerDate;
        car.subscription.days[dayIndex].job.jobState = jobStateEnum;
      });
  }

  notifyCarNotFound(car: CarModel, dayIndex: number) {

    LocalNotifications.schedule({
      id: 1,
      text: 'Single ILocalNotification',
      sound: 'file://sound.mp3',
      led: 'FF0000',
      data: { secret: 'coool' }
    });

    // LocalNotifications.on('trigger', (d1, d2, d3) => {
    //   console.log('on trigger');
    //   console.log(d1);
    //   console.log(d2);
    //   console.log(d3);
    // });
    //
    // LocalNotifications.on('click', (d1, d2, d3) => {
    //   console.log('on click');
    //   console.log(d1);
    //   console.log(d2);
    //   console.log(d3);
    // });

    let notFoundDate = new Date().getTime();
    let updates = {};
    let jobHistoryPath = 'historySubscription/' + car.userUid + '/' + car.subscription.id + '/subscription/days/' + dayIndex + '/job';
    updates[jobHistoryPath + '/notFoundDate'] = notFoundDate;
    updates['carNotFound/' + car.userUid + '/' + car.id] = notFoundDate;
    return this.refDatabase.update(updates);
  }
}
