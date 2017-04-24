
export class CarParkSgApiModel {

  _id: number;
  car_park_no: string;
  address: string;
  x_coord: string;
  y_coord: string;

  constructor() {
    this._id = 0;
    this.car_park_no = '';
    this.address = '';
    this.x_coord = '';
    this.y_coord = '';
  }

}
