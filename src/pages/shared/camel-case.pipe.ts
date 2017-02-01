import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'camelCase', pure: false})
export class CamelCasePipe implements PipeTransform {

  transform(input: string, ...args: any[]): string {
    //return input.length > 0 ? input.replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1).toLowerCase() )) : '';
    return input.length > 0 ? input
        .replace(/[A-Z]/g,(caracter => ' ' + caracter))
        .replace(/\w\S*/g, (txt => txt[0].toUpperCase() + txt.substr(1) )) : '';
  }

}
