import { Injectable } from '@angular/core';
import { Push } from 'ionic-native';

@Injectable()
export class PushNotificationService {

  init() {
    let push = Push.init({
      android: {
        senderID: "1015391130954"
      },
      ios: {
        alert: "true",
        badge: "true",
        sound: "true"
      },
      windows: {}
    });

    if(!push ) {
      return;
    }
  //
  //   push.on('registration', function(data) {
  //     // data.registrationId
  //     console.log('registration');
  //     console.log(data);
  //   });
  //
  //   push.on('notification', function(data) {
  //     console.log('notification');
  //     console.log(data);
  //     // data.message,
  //     // data.title,
  //     // data.count,
  //     // data.sound,
  //     // data.image,
  //     // data.additionalData
  //   });
  //
  //   push.on('error', function(e) {
  //     console.log('error');
  //     console.log(e);
  //     // e.message
  //   });
  }
}
