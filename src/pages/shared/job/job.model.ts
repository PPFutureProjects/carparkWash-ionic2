import { JobState } from './job-state.enum';

export class JobModel {
  id: string;
  cleanerUid: string;
  carId: string;
  dayIndex: number;
  jobState: JobState;
  assignmentDate: number;
  answerDate: number;
}
