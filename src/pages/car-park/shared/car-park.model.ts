import { SubscriptionModel } from '../../shared/subscription/subscription.model';
import { Region } from '../car-park-filter/region.enum';

export class CarParkModel {

  id: string;
  userUid: string;
  subscriptions: Array<SubscriptionModel>;

  name: string;
  code: string;
  picture: string;
  address: string;
  region: Region;
  area: string;
  // if unlocked: client can book his selectedCar for a wash
  // unlocked contains the date of unlock
  unlocked: number;
  // Not used yet
  //parkPlaces: Array<ParkPlaceModel>;
  //nbPlaces: number;
  //nbFreePlaces: number;

  constructor() {
    this.name = '';
    this.code = '';
    this.picture = '';
    this.address = '';
    this.area = '';
    //this.region = undefined;
    // if unlocked: client can subscribe his selectedCar for a wash
    this.unlocked = 0;
    //this.parkPlaces = new Array<ParkPlaceModel>();
    this.subscriptions = new Array<SubscriptionModel>();
    //this.nbPlaces = 0;
    //this.nbFreePlaces = 0;
  }
}
