import { WashStateEnum, WashState } from '../../shared/wash-state.enum';
import { JobModel } from '../../shared/job/job.model';

export class DayCleanerModel {

  id: number;
  washDate: number;
  washRequestDate: number;
  carNotFoundDate: number;
  cleanerUid: string;
  cleanerName: string;
  carParkLotNumber: string;
  washStatus: WashState;

  // theses are not saved here in the database, saved only for history
  job: JobModel;

  constructor(id: number) {
    this.id = id;
    this.washStatus = WashStateEnum.washNotRequested;
  }

}
