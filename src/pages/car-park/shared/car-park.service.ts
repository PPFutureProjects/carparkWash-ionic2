import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from '../../user/shared/user.model';
import { CarParkModel } from './car-park.model';
import { ServiceUtils } from '../../shared/utils.service';
import { CarParkFilterModel } from '../car-park-filter/car-park-filter.model';
import { Http } from '@angular/http';

@Injectable()
export class CarParkService extends ServiceUtils {

  private _selectedCarPark: CarParkModel;
  private refDatabase: firebase.database.Reference;
  private autocompletionMax = 20;
  private singaporeCarParksApiUrl = `https://data.gov.sg/api/action/datastore_search`
    + `?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c&limit=${this.autocompletionMax}`;
  private allSingaporeCarParks: any[];

  constructor(public http: Http) {
    super();
    this.refDatabase = firebase.database().ref();
  }

  remove(carPark: CarParkModel) {
    let updates = {};
    updates['users/' + carPark.managerUid + '/carParkIds/' + carPark.id] = null;
    updates['carParks/' + carPark.id] = null;
    //TODO delete subscription or job ???
    return this.refDatabase.update(updates);
  }

  add(newCarPark: {carPark: CarParkModel, manager: UserModel}) {
    // car parks are stored with singapore api id
    // newCarPark.carPark.id = this.refDatabase.child('carParks').push().key;
    return this.update(newCarPark)
      .then(() => {
        if (!newCarPark.manager.carParks) {
          newCarPark.manager.carParkIds = {};
        }
        newCarPark.manager.carParkIds[newCarPark.carPark.id] = true;
        if (!newCarPark.manager.carParks) {
          newCarPark.manager.carParks = new Array<CarParkModel>();
        }
        newCarPark.manager.carParks.push(newCarPark.carPark);
      });
  }

  update(updatedCarPark: {carPark: CarParkModel, manager: UserModel}) {
    let updates = {};
    let oldManagerUid = updatedCarPark.carPark.managerUid;
    // update carPark's manager (action made by admin or manager)
    if (updatedCarPark.manager.uid) {
      updatedCarPark.carPark.managerUid = updatedCarPark.manager.uid;
      updatedCarPark.carPark.managerName = updatedCarPark.manager.name;

      if (oldManagerUid) {
        updates['users/' + oldManagerUid + '/carParkIds' + updatedCarPark.carPark.id] = null;
      }
      updates['users/' + updatedCarPark.manager.uid + '/carParkIds/' + updatedCarPark.carPark.id] = true;
    }
    updates['carParks/' + updatedCarPark.carPark.id] = this.getSimpleObject(updatedCarPark.carPark);
    return this.refDatabase.update(updates)
  }

  getAll(): firebase.Promise<Array<CarParkModel>> {
    return this.refDatabase.child('carParks').once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }

  getById(carParkId: string): firebase.Promise<CarParkModel> {
    return this.refDatabase.child('carParks').child(carParkId).once('value')
      .then(snapshot => snapshot.val());
  }

  getFiltered(carParkFilterModel: CarParkFilterModel): firebase.Promise<Array<CarParkModel>> {
    return this.refDatabase.child('carParks')
      .orderByChild('code').startAt(carParkFilterModel.code).once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }

  getByCodeAutocompletion(selectedCarPark: string | {car_park_no: string}) {
    let carParkCodeQuery = this.isString(selectedCarPark) ? selectedCarPark : (<any>selectedCarPark).car_park_no;
    return this.http.get(this.singaporeCarParksApiUrl + `&q=${carParkCodeQuery}`)
      .map(data => data.json().result.records);
  }

  getByAddressAutocompletion(selectedCarPark: string) {
    // let carParkCodeQuery = this.isString(selectedCarPark) ? selectedCarPark : (<any>selectedCarPark).address;
    console.log('search with ==' + selectedCarPark);
    return this.http.get(this.singaporeCarParksApiUrl + `&q=${selectedCarPark}`)
      .map(data => {
        console.log('got :');
        console.log(data.json().result.records);
        return data.json().result.records;
      });
    // return Observable.fromPromise(<any>this.refDatabase.child('allCarParks')
    //   .orderByChild('address').limitToFirst(20).startAt(selectedCarPark).once('value')
    //   .then(snapshot => {
    //     return this.arrayFromObject(snapshot.val());
    //   }));
  }

  private isString(selectedCarPark: string | {car_park_no: string} | {address: string}) {
    return typeof selectedCarPark == 'string' || selectedCarPark instanceof String;
  }

  get selectedCarPark(): CarParkModel {
    return this._selectedCarPark;
  }

  set selectedCarPark(value: CarParkModel) {
    this._selectedCarPark = value;
  }
}
