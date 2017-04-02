import { Injectable } from '@angular/core';
import { UserModel } from '../user/shared/user.model';
import { UserService } from '../user/shared/user.service';
import * as firebase from 'firebase';

@Injectable()
export class SupportService {

  private refDatabase: firebase.database.Reference;

  constructor(public userSrvice: UserService) {
    this.refDatabase = firebase.database().ref();
  }

  sendMsgToAdmin(msgToAdmin: string) {
    return this.userSrvice.getCurrent().then((user: UserModel) => {
      let key = this.refDatabase.child('support').child(user.uid).push().key;
      let updates = {};
      updates['support/' + user.uid + '/' + key] = msgToAdmin;
      return this.refDatabase.update(updates);
    });
  }
}

