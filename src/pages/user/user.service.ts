import { Injectable } from '@angular/core';
import { Facebook } from 'ionic-native';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';
import { UserModel, ProviderEnum } from './user.model';
import { UserReady } from './user-notifier';
import { CarModel } from '../car/shared/car.model';
import { CarParkModel } from '../car-park/shared/car-park.model';
import { ProfileEnum } from '../shared/profile.enum';
import { ServiceUtils } from '../shared/service.utils';


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
      }).then((userAuth: firebase.User) => {
        if (!userAuth) {
          //FIXME is this good ?
          return null;
          //throw {code: 'auth/user-not-found', message: 'Incorrect email or password'};
        }
        return this.refDatabase.child('users').child(userAuth.uid).once('value').then(snapshot => {
          this.currentUser = snapshot.val();
          if (this.currentUser === null) {
            return this.createUserModel(userFb);
          } else {
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
      //TODO redo this for prod
      // if (!userAuth.emailVerified) {
      //   throw {code: 'auth/unverified-email'};
      // }
      return this.getCurrent()
    }).catch((err: firebase.FirebaseError) => {
      console.error(err);
      let errMsg: string = 'Log in Fail';
      switch (err.code) {
        case 'auth/network-request-failed':
          errMsg = 'No Internet Connection';
          break;
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
        userFb.provider = ProviderEnum.facebook;
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
          userFb.profile = ProfileEnum.client;
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
    return firebase.auth().createUserWithEmailAndPassword(user.email, password)
      .then(() => {
        user.uid = firebase.auth().currentUser.uid;
        user.provider = ProviderEnum.email;
        return this.createUserModel(user, carPark, car)
          .then(() => this.sentEmailVerification());
      })
      .catch((err: any) => {
        if (err.code === 'auth/email-already-in-use' && firebase.auth().currentUser && !firebase.auth().currentUser.emailVerified) {
          throw {
            code: 'auth/email-already-in-use-but-not-verified',
            message: ['email already in use but not yet verified,', 'Re-send verification email ?']
          };
        }
        throw err;
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
    if (user.profile === ProfileEnum.client && car) {
      let newCarId = this.refDatabase.child('cars').push().key;
      car.userUid = user.uid;
      car.id = newCarId;
      updates['cars/' + newCarId] = car;
      updates['users/' + user.uid + '/cars/' + newCarId] = car;
    } else if (user.profile === ProfileEnum.manager) {
      let newCarParkId = this.refDatabase.child('carParks').push().key;
      carPark.userUid = user.uid;
      carPark.id = newCarParkId;
      //carPark.nbFreePlaces = carPark.nbPlaces;
      updates['carParks/' + carPark.region + '/' + carPark.area.toLowerCase() + '/' + newCarParkId] = carPark;
      updates['areas/' + carPark.region + '/' + carPark.area.toLowerCase()] = true;
      updates['users/' + user.uid + '/carParks/' + newCarParkId] = carPark;
    }

    if (user.profile === ProfileEnum.client) {
      updates['clientNames/' + user.uid] = user.name;
    }

    return this.refDatabase.child('users').child(user.uid).set(user).then(() => {
      return this.refDatabase.update(updates).then(() => {
        car ? user.cars = [car] : '';
        carPark ? user.carParks = [carPark] : '';
        if (!this.currentUser || this.currentUser.profile !== ProfileEnum.admin) {
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

  updatePassword(updatePassword: {new: string, old: string}) {
    return this.login(this.currentUser, updatePassword.old)
      .then(() => firebase.auth().currentUser.updatePassword(updatePassword.new));
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
      .then(() => this.updateUserAuthEmail(user))
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
      return firebase.auth().currentUser.updateEmail(user.email);
    } else {
      return Promise.resolve(user);
    }
  }
}
