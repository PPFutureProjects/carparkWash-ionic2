import { CarModel } from '../car/car.model';
import { ProfileType } from '../shared/profile-type.enum';
import { CarParkModel } from '../car-park/car-park.model';

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
