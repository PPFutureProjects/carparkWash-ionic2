import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class UserReady {

  private notifySource = new Subject<boolean>();

  notifySource$: Observable<boolean> = this.notifySource.asObservable();

  notify(notify: boolean) {
    this.notifySource.next(notify);
  }

}
