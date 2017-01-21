import * as firebase from 'firebase';

export class FirebaseService {

  constructor() {
    // Initialize Firebase
    firebase.initializeApp({
      apiKey: "AIzaSyC6faN-E-GF8OW-fO02XMkPZ_5d9dhL9-s",
      authDomain: "carparkwashingservice.firebaseapp.com",
      databaseURL: "https://carparkwashingservice.firebaseio.com",
      storageBucket: "carparkwashingservice.appspot.com",
      messagingSenderId: "1015391130954"
    });
  }
}
