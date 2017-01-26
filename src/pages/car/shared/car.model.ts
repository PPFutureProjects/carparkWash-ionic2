import { SubscriptionModel } from '../../shared/subscription/subscription.model';
export class CarModel {

  id: string;
  subscription: SubscriptionModel;
  licencePlateNumber: string;
  silhouettePicture: SilhouettePictureType;
  brandModel: string;
  colour: string;
  userUid: string;

  constructor() {
    this.licencePlateNumber = '';
    this.brandModel = '';
    this.colour = '';
  }
}

export type SilhouettePictureType = 'SEDAN' | 'SUV';

export const SilhouettePictureEnum = {
  SEDAN: 'SEDAN' as SilhouettePictureType,
  SUV: 'SUV' as SilhouettePictureType,
};

