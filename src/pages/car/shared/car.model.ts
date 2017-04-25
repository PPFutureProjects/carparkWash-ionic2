import { SubscriptionModel } from '../subscription/subscription.model';
import { CarColourType } from './car-colour.enum';

export class CarModel {

  id: string;
  licencePlateNumber: string;
  brand: string;
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
    // this.colour = '';
    this.picture = 'assets/picture/add-item.png';
  }
}
