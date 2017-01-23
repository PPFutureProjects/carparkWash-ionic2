import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';

import { UserModel } from './user.model';
import { UserReady } from './user-notifier';
import { CarModel } from '../car/car.model';
import { CarParkModel } from '../car-park/car-park.model';
import { ProfileTypeEnum } from '../shared/profile-type.enum';
import { ServiceUtils } from '../shared/service.utils';
import { Facebook } from 'ionic-native';
import { LoadingController } from 'ionic-angular';


@Injectable()
export class UserService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;
  private refStorageUsers: firebase.storage.Reference;

  private currentUser: UserModel;

  constructor(public userReady: UserReady, public loadingCtrl: LoadingController) {
    super();
    this.refDatabase = firebase.database().ref();
    this.refStorageUsers = firebase.storage().ref('users');
  }

  getCurrent(cache: boolean = true, userFb?: UserModel): Promise<UserModel> {
    if (cache && this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return new Promise((resolve, reject) => {
        return firebase.auth().onAuthStateChanged(resolve, reject)
      }).then((user: firebase.User) => {
        if (!user) {
          return null;
          //throw {code: 'auth/user-not-found', message: 'Incorrect email or password'};
        }
        return this.refDatabase.child('users').child(user.uid).once('value').then(snapshot => {
          this.currentUser = snapshot.val();
          if (this.currentUser === null) {
            return this.createUserModel(userFb);
          } else {
            if (this.currentUser.provider) {

            }
            this.currentUser.cars = this.arrayFromObject(this.currentUser.cars);
            this.currentUser.carParks = this.arrayFromObject(this.currentUser.carParks);
            this.userReady.notify(true);
            return this.currentUser;
          }
        }).catch(error => {
          console.log(error);
          throw error;
        });
      });
    }
  }

  login(userModel: UserModel, password: string) {
    return firebase.auth().signInWithEmailAndPassword(userModel.email, password).then(userAuth => {
      return this.getCurrent()
    }).catch((err: firebase.FirebaseError) => {
      console.error(err);
      let errMsg: string = 'Log in Fail';
      switch (err.code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errMsg = 'Incorrect email or password';
          break;
        case 'auth/unverified-email':
          errMsg = 'Email not verified';
          break;
      }
      throw {code: err.code, message: errMsg};
    });
  }

  /**
   * if userModel is undefined => a client login, else admin creating a user(Manager/Cleaner)
   *
   * @param userModel
   * @returns {firebase.Thenable<any>}
   */
  facebookLogin(userModel?: UserModel, carParkModel?: CarParkModel) {
    return Facebook.login(['public_profile', 'email', 'user_birthday', 'user_location']).then(userDataFb => {
      let loading = this.loadingCtrl.create({
        content: 'Loading',
        spinner: 'crescent',
        showBackdrop: false
      });
      loading.present();
      console.log("fb native auth success: ", userDataFb);
      let facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(userDataFb.authResponse.accessToken);
      return firebase.auth().signInWithCredential(facebookCredential).then(result => {
        console.log("firebase auth success: ", result);
        loading.dismissAll();

        let userFb = new UserModel();
        userFb.uid = result.uid;
        userFb.provider = 'facebook';
        userFb.name = result.displayName;
        userFb.email = result.email;
        userFb.address = result.location ? result.location : '';
        if (userModel) {
          userFb.address ? '' : userFb.address = userModel.address;
          userFb.phoneNumber = userModel.phoneNumber;
          userFb.profile = userModel.profile;
          return this.createUserModel(userFb, carParkModel);
        } else {
          // client login/sign up with facebook
          userFb.profile = ProfileTypeEnum.client;
          return this.getCurrent(false, userFb);
        }
      }, err => {
        loading.dismissAll();
        // Handle Errors here.
        //let errorCode = err.code;
        //let errorMessage = err.message;
        // The email of the user's account used.
        //let email = err.email;
        // The firebase.auth.AuthCredential type that was used.
        //let credential = err.credential;
        throw err;
      });
    });
  }

  create(user: UserModel, password: string, carPark?: CarParkModel, car?: CarModel) {
    return firebase.auth().createUserWithEmailAndPassword(user.email, password).then(() => {
      user.uid = firebase.auth().currentUser.uid;
      user.provider = 'email';
      return this.createUserModel(user, carPark, car)
        .then(() => this.sentEmailVerification())
        .catch((err: any) => {
          if (err.code === 'auth/email-already-in-use' && firebase.auth().currentUser && !firebase.auth().currentUser.emailVerified) {
            throw {
              code: 'auth/email-already-in-use-but-not-verified',
              message: ['email already in use but not yet verified,', 'Re-sent verification email ?']
            };
          }
          throw err;
        });
    });
  }

  sentEmailVerification() {
    return firebase.auth().currentUser.sendEmailVerification().then(() => {
      console.log("sendEmailVerification success");
    });
  }

  private createUserModel(user: UserModel, carPark?: CarParkModel, car?: CarModel) {
    let updates = {};
    // Creation user login with facebook is always a client without a car
    //if (user.profile === undefined) {}
    if (user.profile === ProfileTypeEnum.client && car) {
      let newCarId = this.refDatabase.child('cars').push().key;
      car.userUid = user.uid;
      car.id = newCarId;
      updates['cars/' + newCarId] = car;
      updates['users/' + user.uid + '/cars/' + newCarId] = car;
    } else if (user.profile === ProfileTypeEnum.manager) {
      let newCarParkId = this.refDatabase.child('carParks').push().key;
      carPark.userUid = user.uid;
      carPark.id = newCarParkId;
      //carPark.nbFreePlaces = carPark.nbPlaces;
      updates['carParks/' + carPark.cardinalPart + '/' + carPark.area.toLowerCase() + '/' + newCarParkId] = carPark;
      updates['areas/' + carPark.cardinalPart + '/' + carPark.area.toLowerCase()] = true;
      updates['users/' + user.uid + '/carParks/' + newCarParkId] = carPark;
    }

    return this.refDatabase.child('users').child(user.uid).set(user).then(() => {
      return this.refDatabase.update(updates).then(() => {
        car ? user.cars = [car] : '';
        carPark ? user.carParks = [carPark] : '';
        if (!this.currentUser || this.currentUser.profile !== ProfileTypeEnum.admin) {
          this.currentUser = user;
          this.userReady.notify(true);
        }
        return this.currentUser;
      });
    });
  }

  isAuth(): Promise<boolean> {
    return this.currentUser ? Promise.resolve(true) : new Promise((resolve, reject) =>
      firebase.auth().onAuthStateChanged(resolve, reject)).then((user: firebase.User) => {
      this.userReady.notify(Boolean(user));
      return Boolean(user);
    });
  }

  logOut() {
    this.currentUser = undefined;
    return firebase.auth().signOut();
  }

  updatePassword(newPassword: string) {
    return firebase.auth().currentUser.updatePassword(newPassword);
  }

  /**
   * Update the user informations
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  updateUserInfo(user: UserModel) {
    let userInfo = {};
    for (let att in user) {
      if (user.hasOwnProperty(att) && user[att] !== Object(user[att])) {
        userInfo[att] = user[att];
      }
    }
    //userInfo.email = user.email;
    //userInfo.name = user.name;
    //userInfo.phoneNumber = user.phoneNumber;
    //userInfo.address = user.address;
    return this.refDatabase.child('users').child(user.uid).update(userInfo)
      .then(() => this.currentUser = user);
  }

  /**
   * Send email to the user to reset his password
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  resetPassword(user: UserModel) {
    return firebase.auth().sendPasswordResetEmail(user.email);
  }

  /**
   * Update user auth email if changed then user info
   *
   * @param user
   * @returns {firebase.Promise<any>}
   */
  private updateUserAuthEmail(user: UserModel) {
    if (firebase.auth().currentUser.email !== user.email) {
      return firebase.auth().currentUser.updateEmail(user.email)
        .then(() => this.updateUserInfo(user));
    } else {
      return this.updateUserInfo(user);
    }
  }
}
