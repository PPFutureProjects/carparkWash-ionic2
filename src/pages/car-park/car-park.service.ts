import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from '../user/user.model';
import { CarParkModel } from './car-park.model';
import { ServiceUtils } from '../shared/service.utils';
import { CardinalPart } from './car-park-filter/cardinal-part-enum';
import { CarParkFilterModel } from './car-park-filter/car-park-filter.model';
import { SubscriptionModel } from '../shared/subscription/subscription.model';

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
    updates['carParks/' + carPark.cardinalPart + '/' + carPark.area.toLowerCase() + '/' + carPark.id] = null;
    return this.refDatabase.update(updates);
  }

  add(user: UserModel, newCarPark: CarParkModel) {
    user.carParks.push(newCarPark);
    newCarPark.id = this.refDatabase.child('carParks').push().key;

    let updates = {};
    updates['users/' + newCarPark.userUid + '/carParks/' + newCarPark.id] = newCarPark;
    updates['carParks/' + newCarPark.cardinalPart + '/' + newCarPark.area.toLowerCase() + '/' + newCarPark.id] = newCarPark;
    updates['areas/' + newCarPark.cardinalPart + '/' + newCarPark.area.toLowerCase()] = true;
    return this.refDatabase.update(updates);
  }

  update(updateCarPark: CarParkModel) {
    let updates = {};
    updates['users/' + updateCarPark.userUid + '/carParks/' + updateCarPark.id] = updateCarPark;
    // Only admin can change cardinalPart or area from firebase console
    updates['carParks/' + updateCarPark.cardinalPart + '/' + updateCarPark.area.toLowerCase() + '/' + updateCarPark.id] = updateCarPark;
    updates['areas/' + updateCarPark.cardinalPart + '/' + updateCarPark.area.toLowerCase()] = true;
    return this.refDatabase.update(updates);
  }

  getAll(): firebase.Promise<Array<CarParkModel>> {
    return this.refDatabase.child('carParks').once('value')
      .then(snapshot => {
        return this.arrayFromObject(snapshot.val())
          .map(carparcsTreeByCardinal =>
            this.arrayFromObject(carparcsTreeByCardinal)
              .reduce((result, value) => result.concat(value), []))
          .reduce((result, value) => result.concat(value), [])
          .map((carparcObject: CarParkModel) => this.arrayFromObject(carparcObject)[0]);
      });
  }

  getBySubscription(subscriptionModel: SubscriptionModel): firebase.Promise<CarParkModel> {
    return this.refDatabase.child('carParks').child(subscriptionModel.carParkCardinalPart)
      .child(subscriptionModel.carParkArea).child(subscriptionModel.carParkId).once('value')
      .then(snapshot => snapshot.val());
  }

  getByAreas(areaOrCardinalPart: CarParkFilterModel): firebase.Promise<Array<CarParkModel>> {
    console.log(areaOrCardinalPart);
    if (areaOrCardinalPart.area) {
      return this.refDatabase.child('carParks').child(areaOrCardinalPart.cardinalPart).child(areaOrCardinalPart.area).once('value')
        .then(snapshot => this.arrayFromObject(snapshot.val()));
    } else {
      return this.refDatabase.child('carParks').child(areaOrCardinalPart.cardinalPart).once('value')
        .then(snapshot => {
          return this.arrayFromObject(snapshot.val())
            .map(carParkCardinalPart => this.arrayFromObject(carParkCardinalPart))
            .reduce((result, value) => result.concat(value), [])
        });
    }
  }

  getAreasByCardinalPart(cardinalPart: CardinalPart) {
    return this.refDatabase.child('areas').child(cardinalPart).once('value')
      .then(snapshot => Object.keys(snapshot.val() ? snapshot.val() : []));
  }

  get selectedCarPark(): CarParkModel {
    return this._selectedCarPark;
  }

  set selectedCarPark(value: CarParkModel) {
    this._selectedCarPark = value;
  }

}
