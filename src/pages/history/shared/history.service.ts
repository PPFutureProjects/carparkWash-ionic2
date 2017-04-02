import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { UserModel } from '../../user/shared/user.model';
import { ServiceUtils } from '../../shared/utils.service';
import { HistoryModel } from './history.model';

@Injectable()
export class HistoryService extends ServiceUtils {

  private clientNamesRef: firebase.database.Reference;
  private historySubscriptionRef: firebase.database.Reference;
  private historyUnlockRef: firebase.database.Reference;

  constructor() {
    super();
    this.clientNamesRef = firebase.database().ref('clientNames');
    this.historySubscriptionRef = firebase.database().ref('historySubscription');
    this.historyUnlockRef = firebase.database().ref('historyUnlock');
  }

  getClients(): firebase.Promise<Array<UserModel>> {
    return this.clientNamesRef.once('value').then(snapshot => {
      return this.initUserList(snapshot);
    });
  }

  getCarParksHistory() {
    return this.historyUnlockRef.once('value').then(snapshot => {
      return this.arrayFromObject(snapshot.val())
        .map(carPark => {
          carPark.unlockedDates = Object.keys(carPark.unlockedDates ? carPark.unlockedDates : []);
          return carPark;
        });
    });
  }

  // getManagers(): firebase.Promise<Array<UserModel>> {
  //   return this.managerNamesRef.once('value').then(snapshot => {
  //     return this.initUserList(snapshot);
  //   });
  // }

  getHistory(user: UserModel): firebase.Promise<Array<HistoryModel>> {
    return this.historySubscriptionRef.child(user.uid).once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }

  private initUserList(snapshot) {
    let managerNames = snapshot.val();
    return Object.keys(managerNames ? managerNames : {}).map(uid => {
      let user = new UserModel();
      user.uid = uid;
      user.name = managerNames[uid];
      return user;
    });
  }

}
