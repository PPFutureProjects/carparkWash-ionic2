import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
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

  update(updatedCarPark: CarParkModel, region: Region, area: string) {
    let updates = {};
    updates['users/' + updatedCarPark.userUid + '/carParks/' + updatedCarPark.id] = updatedCarPark;
    // Only admin can change region or area from firebase console
    updates['carParks/' + region + '/' + area.toLowerCase() + '/' + updatedCarPark.id] = updatedCarPark;
    updates['areas/' + region + '/' + area.toLowerCase()] = true;

    let oldRegion = updatedCarPark.region;
    let oldArea = updatedCarPark.area.toLowerCase();
    if (oldRegion && oldRegion !== region && oldArea && oldArea !== area.toLowerCase()) {
      updates['carParks/' + oldRegion + '/' + oldArea + '/' + updatedCarPark.id] = null;
    } else if (oldRegion && oldRegion !== region) {
      updates['carParks/' + oldRegion + '/' + area.toLowerCase() + '/' + updatedCarPark.id] = null;
    } else if (oldArea && oldArea !== area.toLowerCase()) {
      updates['carParks/' + region + '/' + oldArea + '/' + updatedCarPark.id] = null;
    }

    updatedCarPark.region = region;
    updatedCarPark.area = area;
    return this.refDatabase.update(updates)
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
      })
      .then((carParks: Array<CarParkModel>) => this.subscriptionToArray(carParks));
  }

  getBySubscription(subscriptionModel: SubscriptionModel): firebase.Promise<CarParkModel> {
    return this.refDatabase.child('carParks').child(subscriptionModel.carParkRegion)
      .child(subscriptionModel.carParkArea.toLowerCase()).child(subscriptionModel.carParkId).once('value')
      .then(snapshot => {
        let carPark = snapshot.val() as CarParkModel;
        carPark.subscriptions = this.arrayFromObject(carPark.subscriptions);
        return carPark;
      })
  }

  getFiltered(carParkFilterModel: CarParkFilterModel): firebase.Promise<Array<CarParkModel>> {
    if (carParkFilterModel.code) {
      return this.refDatabase.child('areas').once('value')
        .then(snapshot => {
          let regions = snapshot.val();
          let carparksPromise = new Array();
          for (let region of Object.keys(regions)) {
            for (let area of Object.keys(regions[region])) {
              carparksPromise.push(this.refDatabase.child('carParks').child(region).child(area.toLowerCase())
                .orderByChild('code').startAt(carParkFilterModel.code).once('value')
                .then(snapshot => this.arrayFromObject(snapshot.val())
                  .map((carParks: Array<CarParkModel>) => this.subscriptionToArray(carParks))));
            }
          }
          return Observable.forkJoin(carparksPromise).toPromise()
            .then((value: Array<Array<Object>>) => {
              return this.mergeResults(value);
            });
        });
    } else if (carParkFilterModel.area) {
      return this.refDatabase.child('carParks').child(carParkFilterModel.region)
        .child(carParkFilterModel.area.toLowerCase()).once('value')
        .then(snapshot => this.arrayFromObject(snapshot.val())
          .map((carParks: Array<CarParkModel>) => this.subscriptionToArray(carParks)));
    } else {
      return this.refDatabase.child('carParks').child(carParkFilterModel.region).once('value')
        .then(snapshot => {
          return this.arrayFromObject(snapshot.val())
            .map(carParkByRegion => this.arrayFromObject(carParkByRegion))
            .reduce((result, value) => result.concat(value), [])
        })
        .then((carParks: Array<CarParkModel>) => this.subscriptionToArray(carParks));
    }
  }

  getAreasByRegion(region: Region) {
    return this.refDatabase.child('areas').child(region).once('value')
      .then(snapshot => Object.keys(snapshot.val() ? snapshot.val() : []));
  }

  private subscriptionToArray(carParks: Array<CarParkModel>) {
    return carParks.map((carPark: CarParkModel) => {
      carPark.subscriptions = this.arrayFromObject(carPark.subscriptions);
      return carPark;
    })
  }

  get selectedCarPark(): CarParkModel {
    return this._selectedCarPark;
  }

  set selectedCarPark(value: CarParkModel) {
    this._selectedCarPark = value;
  }

}
