import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { JobStateEnum } from '../../shared/job/job-state.enum';
import { CarModel } from '../shared/car.model';
import { CarParkModel } from '../../car-park/shared/car-park.model';

@Component({
  selector: 'page-respond-to-job',
  templateUrl: './respond-to-job.html'
})
export class RespondToJobPage {

  // TODO print to job info
  carToWash: CarModel;
  carParkSubscribed: CarParkModel;

  constructor(public params: NavParams, public viewCtrl: ViewController) {
    this.carToWash = this.params.get('carToWash');
    this.carParkSubscribed = this.params.get('carParkSubscribed');
  }

  answerLater() {
    this.viewCtrl.dismiss(JobStateEnum.notAnswered);
  }

  acceptJob() {
    this.viewCtrl.dismiss(JobStateEnum.accepted);
  }

  declineJob() {
    this.viewCtrl.dismiss(JobStateEnum.declined);
  }

}
