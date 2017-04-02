import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { CarModel } from './car.model';
import { UserModel } from '../../user/shared/user.model';
import { ServiceUtils } from '../../shared/utils.service';
import { Observable } from 'rxjs';

@Injectable()
export class CarService extends ServiceUtils {

  private _selectedCar: CarModel;

  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  remove(car: CarModel) {
    let updates = {};
    updates['users/' + car.userUid + '/carIds/' + car.id] = null;
    updates['cars/' + car.id] = null;
    //TODO delete subscription or job ???
    return this.refDatabase.update(updates);
  }

  add(user: UserModel, newCar: CarModel) {
    newCar.id = this.refDatabase.child('cars').push().key;
    let updates = {};
    updates['users/' + newCar.userUid + '/carIds/' + newCar.id] = true;
    updates['cars/' + newCar.id] = newCar;
    return this.refDatabase.update(updates)
      .then(() => {
        if (!user.carIds) {
          user.carIds = {};
        }
        user.carIds[newCar.id] = true;
        if (!user.cars) {
          user.cars = new Array<CarModel>();
        }
        user.cars.push(newCar);
      });
  }

  update(updatingCar: CarModel) {
    let updates = {};
    updates['cars/' + updatingCar.id] = updatingCar;
    return this.refDatabase.update(updates);
  }

  getById(carId: string): firebase.Promise<CarModel> {
    return this.refDatabase.child('cars').child(carId).once('value')
      .then(snapshot => snapshot.val());
  }

  getByIds(carIds: Array<string>): firebase.Promise<Array<CarModel>> {
    let getCarsPromise = new Array();
    for (let carId of carIds) {
      getCarsPromise.push(this.getById(carId));
    }
    return Observable.forkJoin(getCarsPromise).toPromise();
  }

  get selectedCar(): CarModel {
    return this._selectedCar;
  }

  set selectedCar(value: CarModel) {
    this._selectedCar = value;
  }

}
