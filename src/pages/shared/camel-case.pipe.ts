
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'camelCase', pure: false})
export class CamelCasePipe implements PipeTransform {

  transform(input: any, ...args: any[]): any {
    return input.length > 0 ? input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase() )) : '';
  }

}
