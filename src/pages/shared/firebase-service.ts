import * as firebase from 'firebase';

export class FirebaseService {

  private firebaseConf = {
    apiKey: "AIzaSyC6faN-E-GF8OW-fO02XMkPZ_5d9dhL9-s",
    authDomain: "carparkwashingservice.firebaseapp.com",
    databaseURL: "https://carparkwashingservice.firebaseio.com",
    storageBucket: "carparkwashingservice.appspot.com",
    messagingSenderId: "1015391130954"
  };

  signUpAuthApp: firebase.auth.Auth;

  constructor() {
    // Initialize Firebase
    firebase.initializeApp(this.firebaseConf);
  }

  initAnotherApp(appName: string): firebase.app.App {
    return firebase.initializeApp(this.firebaseConf, appName);
  }

  initAnotherAppAuth() {
    if (!this.signUpAuthApp) {
      this.signUpAuthApp = this.initAnotherApp('signUp').auth();
    }
    return this.signUpAuthApp;
  }
}
