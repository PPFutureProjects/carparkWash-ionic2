import { DayCleanerModel } from './day-cleaner.model';

export class SubscriptionModel {

  id: string;
  carId: string;
  clientUid: string;
  managerUid: string;
  carParkId: string;
  carParkCode: string;
  dateSubscription: number;
  // days contains 30 days
  days: Array<DayCleanerModel>;

  constructor() {
    this.dateSubscription = new Date().getTime();
    this.days = new Array<DayCleanerModel>();
    for (let i = 0; i < 30; i++) {
      this.days.push(new DayCleanerModel(i));
    }
  }
}
