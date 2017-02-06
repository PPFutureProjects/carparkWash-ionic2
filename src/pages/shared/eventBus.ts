import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class EventBus {

  private carUpdated = new Subject<boolean>();

  public carUpdated$ = this.carUpdated.asObservable();

  updateCarItem(ok: boolean) {
    this.carUpdated.next(ok);
  }

}

