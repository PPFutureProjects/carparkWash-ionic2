import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CarParkModel } from '../../car-park/car-park.model';
import { ServiceUtils } from '../service.utils';
import { SubscriptionModel } from './subscription.model';
import { CarModel } from '../../car/car.model';
import { WashStateEnum } from './wash-state.enum';
import { UserModel } from '../../user/user.model';

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
        description: `Subscribe ${car.licencePlateNumber} in ${carPark.name}`,
        amount: 3000
      });
    }).then(token => {
      // You can access the token ID with `token.id`.
      // Get the token ID to your server-side code for use.
      console.log(token);
      //TODO test on real card
      console.log('test if transaction is ok');
      let subscriptionModel = new SubscriptionModel();
      subscriptionModel.clientUid = car.userUid;
      subscriptionModel.managerUid = carPark.userUid;
      subscriptionModel.carParkId = carPark.id;
      subscriptionModel.carParkCardinalPart = carPark.cardinalPart;
      subscriptionModel.carParkArea = carPark.area;
      subscriptionModel.carId = car.id;
      subscriptionModel.car = car;

      let updates = {};
      let subCarPath = 'cars/' + car.id + '/subscription';
      updates['users/' + car.userUid + '/' + subCarPath] = subscriptionModel;
      updates[subCarPath] = subscriptionModel;

      let subCarParkPath = carPark.id + '/subscriptions/' + car.id;
      updates['users/carParks/' + carPark.userUid + '/' + subCarParkPath] = subscriptionModel;
      updates['carParks/' + carPark.cardinalPart + '/' + carPark.area + '/' + subCarParkPath] = subscriptionModel;

      return this.refDatabase.update(updates)
        .then(() => {
          //TODO to test
          car.subscription = subscriptionModel;
          if (carPark.subscriptions) {
            carPark.subscriptions.push(subscriptionModel);
          } else {
            carPark.subscriptions = [subscriptionModel];
          }
        });
    });
  }

  unlock(carPark: CarParkModel) {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    carPark.unlocked = tomorrow.getTime();
    let updates = {};
    updates['users/' + carPark.userUid + '/carParks/' + carPark.id] = carPark;
    updates['carParks/' + carPark.cardinalPart + '/' + carPark.area + '/' + carPark.id] = carPark;
    return this.refDatabase.update(updates);
  }

  selectToBeWashed(subscription: SubscriptionModel) {
    let dayIndex = Math.round((new Date().getTime() - subscription.dateSubscription) / (1000 * 60 * 60 * 24));
    let dayCleanerModel = subscription.days[dayIndex];
    dayCleanerModel.washStatus = WashStateEnum.toWash;
    let updates = {};
    let subCarPath = 'cars/' + subscription.car.id + '/subscription/days/' + dayIndex;
    updates['users/' + subscription.clientUid + '/' + subCarPath] = dayCleanerModel;
    updates[subCarPath] = dayCleanerModel;

    let subDayPath = subscription.carParkId + '/subscriptions/' + subscription.car.id + '/days/' + dayIndex;
    updates['users/' + subscription.managerUid + '/carParks/' + '/' + subDayPath] = dayCleanerModel;
    updates['carParks/' + subscription.carParkCardinalPart + '/' + subscription.carParkArea + '/' + subDayPath] = dayCleanerModel;
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
    let subCarPath = 'cars/' + subscription.car.id + '/subscription/days/' + dayIndex;
    updates['users/' + subscription.clientUid + '/' + subCarPath] = dayCleanerModel;
    updates[subCarPath] = dayCleanerModel;

    let subDayPath = subscription.carParkId + '/subscriptions/' + subscription.car.id + '/days/' + dayIndex;
    updates['users/' + subscription.managerUid + '/carParks/' + subDayPath] = dayCleanerModel;
    updates['carParks/' + subscription.carParkCardinalPart + '/' + subscription.carParkArea + '/' + subDayPath] = dayCleanerModel;
    return this.refDatabase.update(updates);
  }
}
