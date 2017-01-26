import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from '../../user/user.model';
import { CarParkModel } from './car-park.model';
import { ServiceUtils } from '../../shared/service.utils';
import { CarParkFilterModel } from '../car-park-filter/car-park-filter.model';
import { SubscriptionModel } from '../../shared/subscription/subscription.model';
import { Region } from '../car-park-filter/region.enum';

@Injectable()
export class CarParkService extends ServiceUtils {

  private _selectedCarPark: CarParkModel;
  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  remove(carPark: CarParkModel) {
    let updates = {};
    updates['users/' + carPark.userUid + '/carParks/' + carPark.id] = null;
    updates['carParks/' + carPark.region + '/' + carPark.area.toLowerCase() + '/' + carPark.id] = null;
    return this.refDatabase.update(updates);
  }

  add(user: UserModel, newCarPark: CarParkModel) {
    user.carParks.push(newCarPark);
    newCarPark.id = this.refDatabase.child('carParks').push().key;

    let updates = {};
    updates['users/' + newCarPark.userUid + '/carParks/' + newCarPark.id] = newCarPark;
    updates['carParks/' + newCarPark.region + '/' + newCarPark.area.toLowerCase() + '/' + newCarPark.id] = newCarPark;
    updates['areas/' + newCarPark.region + '/' + newCarPark.area.toLowerCase()] = true;
    return this.refDatabase.update(updates);
  }

  update(updateCarPark: CarParkModel) {
    let updates = {};
    updates['users/' + updateCarPark.userUid + '/carParks/' + updateCarPark.id] = updateCarPark;
    // Only admin can change region or area from firebase console
    updates['carParks/' + updateCarPark.region + '/' + updateCarPark.area.toLowerCase() + '/' + updateCarPark.id] = updateCarPark;
    updates['areas/' + updateCarPark.region + '/' + updateCarPark.area.toLowerCase()] = true;
    return this.refDatabase.update(updates);
  }

  getAll(): firebase.Promise<Array<CarParkModel>> {
    return this.refDatabase.child('carParks').once('value')
      .then(snapshot => {
        return this.arrayFromObject(snapshot.val())
          .map(carparcsTreeByRegion=>
            this.arrayFromObject(carparcsTreeByRegion)
              .reduce((result, value) => result.concat(value), []))
          .reduce((result, value) => result.concat(value), [])
          .map((carparcObject: CarParkModel) => this.arrayFromObject(carparcObject)[0]);
      });
  }

  getBySubscription(subscriptionModel: SubscriptionModel): firebase.Promise<CarParkModel> {
    return this.refDatabase.child('carParks').child(subscriptionModel.carParkRegion)
      .child(subscriptionModel.carParkArea).child(subscriptionModel.carParkId).once('value')
      .then(snapshot => snapshot.val());
  }

  getByAreas(areaOrRegion: CarParkFilterModel): firebase.Promise<Array<CarParkModel>> {
    console.log(areaOrRegion);
    if (areaOrRegion.area) {
      return this.refDatabase.child('carParks').child(areaOrRegion.region).child(areaOrRegion.area).once('value')
        .then(snapshot => this.arrayFromObject(snapshot.val()));
    } else {
      return this.refDatabase.child('carParks').child(areaOrRegion.region).once('value')
        .then(snapshot => {
          return this.arrayFromObject(snapshot.val())
            .map(carParkRegion => this.arrayFromObject(carParkRegion))
            .reduce((result, value) => result.concat(value), [])
        });
    }
  }

  getAreasByRegion(region: Region) {
    return this.refDatabase.child('areas').child(region).once('value')
      .then(snapshot => Object.keys(snapshot.val() ? snapshot.val() : []));
  }

  get selectedCarPark(): CarParkModel {
    return this._selectedCarPark;
  }

  set selectedCarPark(value: CarParkModel) {
    this._selectedCarPark = value;
  }

}
