import { SubscriptionModel } from '../subscription/subscription.model';
import { CarColourType } from './car-colour.enum';
import { CarType } from './car-silhouette.enum';

export class CarModel {

  id: string;
  licencePlateNumber: string;
  type: CarType;
  brand: string;
  model: string;
  colour: CarColourType;
  userUid: string;
  picture: string;

  /**
   * Not saved in database
   */
  subscription: SubscriptionModel;

  constructor() {
    this.licencePlateNumber = '';
    this.brand = '';
    this.model = '';
    // this.colour = '';
    this.picture = 'assets/picture/add-item.png';
  }
}
