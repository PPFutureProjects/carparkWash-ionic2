import { CarModel } from '../../car/shared/car.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { ProfileType } from './profile.enum';
import { JobModel } from '../../shared/job/job.model';

export class UserModel {

  uid: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
  sex: string;
  picture: string;
  nricNo: string;
  race: string;
  age: string;
  dateOfBirth: string;
  bankAccountDetails: string;
  accountNumber: string;
  provider: string;
  profile: ProfileType;

  carIds: {[id: string]: true};
  carParkIds: {[id: string]: true};
  jobs: Array<JobModel>;
  isOnVacation: boolean;
  workingCarPark: CarParkModel;


  // these are not saved here in the database
  cars: Array<CarModel>;
  carParks: Array<CarParkModel>;

  constructor() {
    this.uid = '';
    this.name = '';
    this.email = '';
    this.address = '';
    this.phoneNumber = '';
    this.sex = 's';
    this.nricNo = '';
    this.age = '';
    this.race = '';
    this.bankAccountDetails = '';
    this.accountNumber = '';
    this.carIds = {};
    this.carParkIds = {};

    this.cars = new Array<CarModel>();
    this.carParks = new Array<CarParkModel>();
  }

}

export type Provider = 'email' | 'facebook';

export const ProviderEnum = {
  email: 'email' as Provider,
  facebook: 'facebook' as Provider,
};

