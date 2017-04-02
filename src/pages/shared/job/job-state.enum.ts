
export type JobState = 'accepted' | 'declined' | 'notAnswered';

export const JobStateEnum = {
  accepted: 'accepted' as JobState,
  declined: 'declined' as JobState,
  notAnswered: 'notAnswered' as JobState
};

