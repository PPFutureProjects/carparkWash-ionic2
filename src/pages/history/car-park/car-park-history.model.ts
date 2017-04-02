import { CarParkModel } from '../../car-park/shared/car-park.model';

export class CarParkHistoryModel extends CarParkModel{

  // saved like this
  // unlockedDates: {[date: string]: boolean};

  // transformed like this
  unlockedDates: Array<String>;

}
