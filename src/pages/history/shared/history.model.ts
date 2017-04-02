import { CarModel } from '../../car/shared/car.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { SubscriptionModel } from '../../car/subscription/subscription.model';
import { JobModel } from '../../shared/job/job.model';

export class HistoryModel {

  car: CarModel;

  carPark: CarParkModel;

  subscription: SubscriptionModel;

  job: JobModel;
}
