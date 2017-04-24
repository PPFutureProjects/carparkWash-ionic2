import { SubscriptionModel } from '../../car/subscription/subscription.model';

export class CarParkModel {

  id: string;
  supervisorUid: string;
  supervisorName: string;
  code: string;
  picture: string;
  address: string;
  x: string;
  y: string;
  subscriptionIds: {[carId: string]: true};

  /**
   * Not saved in database
   */
  subscriptions: Array<SubscriptionModel>;


  constructor() {
    this.code = '';
    this.picture = '';
    this.address = '';
    this.subscriptions = new Array<SubscriptionModel>();
    this.subscriptionIds = {};
  }
}

