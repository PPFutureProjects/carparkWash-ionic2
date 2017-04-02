import { Injectable } from '@angular/core';
import { Facebook } from 'ionic-native';
import { LoadingController } from 'ionic-angular';
import 'rxjs/add/operator/map';
import * as firebase from 'firebase';
import { UserModel, ProviderEnum } from './user.model';
import { UserReady } from './user-notifier';
import { CarModel } from '../../car/shared/car.model';
import { ProfileEnum } from './profile.enum';
import { ServiceUtils } from '../../shared/utils.service';
import { CarService } from '../../car/shared/car.service';
import { CarParkService } from '../../car-park/shared/car-park.service';
import { Observable } from 'rxjs';
import { FirebaseService } from '../../shared/firebase-service';
import { UserNamesType } from './user-names.enum';


@Injectable()
export class UserService extends ServiceUtils {

  private refDatabase: firebase.database.Reference;
  private refStorageUsers: firebase.storage.Reference;

  private currentUser: UserModel;

  constructor(public firebaseService: FirebaseService, public loadingCtrl: LoadingController, public userReady: UserReady,
              public carParkService: CarParkService, public carService: CarService) {
    super();
    this.refDatabase = firebase.database().ref();
    this.refStorageUsers = firebase.storage().ref('users');
  }

  /**
   * Get current user<br>
   * if login user is not found in database, it's a sign up with facebook, then create it.
   *
   * @param cache
   * @param userFb
   * @returns {any}
   */
  getCurrent(cache: boolean = true, userFb?: UserModel): Promise<UserModel> {
    if (cache && this.currentUser) {
      return Promise.resolve(this.currentUser);
    } else {
      return new Promise((resolve, reject) => {
        return firebase.auth().onAuthStateChanged(resolve, reject)
      }).then((userAuth: firebase.User) => {
        if (!userAuth) {
          return null;
        }
        return this.refDatabase.child('users').child(userAuth.uid).once('value').then(snapshot => {
          this.currentUser = snapshot.val();
          if (this.currentUser === null) {
            return this.createUserModel(userFb);
          } else {
            return this.getUserModel();
          }
        }).catch(error => {
          console.log(error);
          throw error;
        });
      });
    }
  }

  /**
   * Prepare UserModel
   *
   * @returns {Promise<T>|Promise<UserModel>|Promise<TResult2|UserModel>}
   */
  private getUserModel() {
    let itemsPromises = new Array();
    if (this.currentUser.profile === ProfileEnum.client) {
      for (let carId in this.currentUser.carIds) {
        itemsPromises.push(this.carService.getById(carId));
      }
    } else if (this.currentUser.profile === ProfileEnum.manager) {
      for (let carParkId in this.currentUser.carParkIds) {
        itemsPromises.push(this.carParkService.getById(carParkId));
      }
    } else if (this.currentUser.profile === ProfileEnum.cleaner) {
      for (let carId in this.currentUser.jobs) {
        itemsPromises.push(this.carService.getById(carId));
      }
    }
    return Observable.forkJoin(itemsPromises).toPromise()
      .then((results: any) => {
        if (this.currentUser.profile === ProfileEnum.client) {
          this.currentUser.cars = results;
          if (!this.currentUser.cars) {
            this.currentUser.cars = [];
          }
        } else if (this.currentUser.profile === ProfileEnum.manager) {
          this.currentUser.carParks = results;
          if (!this.currentUser.carParks) {
            this.currentUser.carParks = [];
          }
        } else if (this.currentUser.profile === ProfileEnum.cleaner) {
          this.currentUser.cars = results;
          if (!this.currentUser.cars) {
            this.currentUser.cars = [];
          }
          this.currentUser.cars.map(car => {
            let dayIndex = Math.round((new Date().getTime() - car.subscription.dateSubscription) / (1000 * 60 * 60 * 24));
            car.subscription.days[dayIndex].job = this.currentUser.jobs[car.id];
            return car;
          });
        }
        this.userReady.notify(true);
        return this.currentUser;
      });
  }

  /**
   * User login with email/password
   *
   * @param userModel
   * @param password
   * @returns {firebase.Thenable<any>}
   */
  login(userModel: UserModel, password: string) {
    return firebase.auth().signInWithEmailAndPassword(userModel.email, password).then(userAuth => {
      if (!userAuth.emailVerified) {
      //TODO redo this for prod
      //   throw {code: 'auth/unverified-email'};
      }
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
  facebookLogin(userModel?: UserModel) {
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
          userFb.address = userFb.address ? userModel.address : '';
          userFb.phoneNumber = userModel.phoneNumber;
          userFb.profile = userModel.profile;
          return this.createUserModel(userFb);
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

  /**
   * if userModel is undefined => a client login, else admin creating a user(Manager/Cleaner)
   *
   * @param userModel
   * @returns {firebase.Thenable<any>}
   */
  loginGooglePlus(userModel?: UserModel) {
    //TODO change this with google plus
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
          userFb.address = userFb.address ? userModel.address : '';
          userFb.phoneNumber = userModel.phoneNumber;
          userFb.profile = userModel.profile;
          return this.createUserModel(userFb);
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

  /**
   * Create client user when sign up, or when admin adds clients and managers
   *
   * @param user
   * @param password
   * @param stayConnected
   * @param car
   * @returns {Promise<U>|any|Promise<R>|Promise<TResult|T>|webdriver.promise.Promise<R>|firebase.Promise<any>}
   */
  create(user: UserModel, password: string, stayConnected: boolean, car?: CarModel) {
    let authApp = stayConnected ? firebase.auth() : this.firebaseService.initAnotherAppAuth();
    return authApp.createUserWithEmailAndPassword(user.email, password)
      .then(() => {
        user.uid = authApp.currentUser.uid;
        user.provider = ProviderEnum.email;
        return this.createUserModel(user, car)
          .then(() => this.sentEmailVerification());
      })
      .catch((err: any) => {
        if (err.code === 'auth/email-already-in-use' && authApp.currentUser && !authApp.currentUser.emailVerified) {
          return Promise.reject({
            code: 'auth/email-already-in-use-but-not-verified',
            message: ['email already in use but not yet verified,', 'Re-send verification email ?']
          });
        }
        return Promise.reject(err);
      });
  }

  /**
   * Send email verification
   *
   * @returns {firebase.Promise<any>}
   */
  sentEmailVerification() {
    return firebase.auth().currentUser.sendEmailVerification().then(() => {
      console.log("send Email Verification success");
    });
  }

  /**
   * Create user Model
   *
   * @param user
   * @param car
   * @returns {firebase.Promise<any>}
   */
  private createUserModel(user: UserModel, car?: CarModel) {
    let updates = {};
    if (user.profile === ProfileEnum.client && car) {
      let newCarId = this.refDatabase.child('cars').push().key;
      car.id = newCarId;
      car.userUid = user.uid;
      updates['cars/' + newCarId] = car;
      user.carIds = {newCarId: true};
    }
    if (user.profile === ProfileEnum.manager) {
      updates['managerNames/' + user.uid] = user.name;
    } else if (user.profile === ProfileEnum.client) {
      updates['clientNames/' + user.uid] = user.name;
    } else if (user.profile === ProfileEnum.cleaner) {
      updates['cleanerNames/' + user.uid] = user.name;
    }
    updates['users/' + user.uid] = user;
    return this.refDatabase.child('users').child(user.uid).set(user).then(() => {
      return this.refDatabase.update(updates).then(() => {
        car ? user.cars = [car] : '';
        if (!this.currentUser || this.currentUser.profile !== ProfileEnum.admin) {
          this.currentUser = user;
          this.userReady.notify(true);
        }
        return this.currentUser;
      });
    });
  }

  /**
   * See if user is connected
   *
   * @returns {Promise<boolean>}
   */
  isAuth(): Promise<boolean> {
    return this.currentUser ? Promise.resolve(true) : new Promise((resolve, reject) =>
        firebase.auth().onAuthStateChanged(resolve, reject)).then((user: firebase.User) => {
        this.userReady.notify(Boolean(user));
        return Boolean(user);
      });
  }

  /**
   * Log out current user
   *
   * @returns {firebase.Promise<any>}
   */
  logOut() {
    this.currentUser = undefined;
    return firebase.auth().signOut();
  }

  /**
   * Update user password
   *
   * @param updatePassword
   * @returns {firebase.Promise<any>}
   */
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
    return this.refDatabase.child('users').child(user.uid).update(this.getSimpleObject(user))
      .then(() => this.updateUserAuthEmail(user))
      .then(() => this.currentUser = user);
  }

  /**
   * typeUserNames: managerNames | clientNames | cleanerNames
   *
   * @param typeUserNames
   * @returns {firebase.Promise<any>}
   */
  getUserNames(typeUserNames: UserNamesType): firebase.Promise<Array<UserModel>> {
    return this.refDatabase.child(typeUserNames).once('value')
      .then(snapshot => {
        let managerNames = snapshot.val();
        return Object.keys(managerNames ? managerNames : []).map(managerUid => {
          let user = new UserModel();
          user.uid = managerUid;
          user.name = managerNames[managerUid];
          return user;
        });
      });
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
