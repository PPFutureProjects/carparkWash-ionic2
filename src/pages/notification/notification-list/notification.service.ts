import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

import { UserModel } from '../../user/shared/user.model';
import { ServiceUtils } from '../../shared/utils.service';
import { NotificationModel } from './notification.model';

@Injectable()
export class NotificationService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;

  constructor() {
    super();
    this.refDatabase = firebase.database().ref();
  }

  getForUser(currentUser: UserModel): firebase.Promise<Array<NotificationModel>>  {
    return this.refDatabase.child('notifications').child(currentUser.uid).once('value')
      .then(snapshot => this.arrayFromObject(snapshot.val()));
  }
}
