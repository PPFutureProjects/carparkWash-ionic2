import { CarModel } from '../car/shared/car.model';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { ProfileType } from '../shared/profile.enum';

export class UserModel {

  uid: string;
  email: string;
  name: string;
  address: string;
  phoneNumber: string;
  provider: string;
  profile: ProfileType;
  cars: Array<CarModel>;
  carParks: Array<CarParkModel>;

  constructor() {
    this.uid = '';
    this.name = '';
    this.email = '';
    this.address = '';
    this.phoneNumber = '';
    //this.profile = ProfileTypeEnum.client;
    this.cars = new Array<CarModel>();
    this.carParks = new Array<CarParkModel>();
  }

}

export type Provider = 'email' | 'facebook';

export const ProviderEnum = {
  email: 'email' as Provider,
  facebook: 'facebook' as Provider,
};

