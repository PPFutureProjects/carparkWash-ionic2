
export type WashState = 'washNotRequested' | 'toWash' | 'washed';

export const WashStateEnum = {
  washNotRequested: 'washNotRequested' as WashState,
  toWash: 'toWash' as WashState,
  washed: 'washed' as WashState
};
