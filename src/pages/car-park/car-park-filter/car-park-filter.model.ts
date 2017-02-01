import { Region } from './region.enum';

export class CarParkFilterModel {

  code: string;
  region: Region;
  area: string;

  constructor() {
    this.code = '';
  }
}

export type FilterBy = 'code' | 'area';

export const FilterByEnum = {
  code: 'code' as FilterBy,
  area: 'area' as FilterBy
};
