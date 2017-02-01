import * as firebase from 'firebase';
import { ServiceUtils } from './service.utils';

export class AnnouncementService extends ServiceUtils {

  private announcementRef: firebase.database.Reference;

  constructor() {
    super();
    this.announcementRef = firebase.database().ref('announcement');
  }

  get() {
    return this.announcementRef.once('value').then(snapshot => snapshot.val() ? snapshot.val() : '');
  }

  set(announcement: string) {
    return this.announcementRef.set(announcement);
  }

}
