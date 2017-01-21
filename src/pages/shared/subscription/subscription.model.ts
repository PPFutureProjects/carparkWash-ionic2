import { WashStateEnum, WashState } from './wash-state.enum';
import { CarModel } from '../../car/car.model';

export class DayCleanerModel {

  id: number;
  washDate: number;
  cleanerUid: string;
  cleanerName: string;
  washStatus: WashState;

  constructor(id: number) {
    this.id = id;
    this.washStatus = WashStateEnum.washNotRequested;
  }

}

export class SubscriptionModel {

  carId: string;
  car:CarModel;
  clientUid: string;
  managerUid: string;
  carParkId: string;
  carParkCardinalPart: string;
  carParkArea: string;
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
