import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, MenuController } from 'ionic-angular';
import { StatusBar, Splashscreen, AppRate } from 'ionic-native';
import { ProfilePage } from '../pages/profile/profile';
import { AddUserPage } from '../pages/user/add-user';
import { FirebaseService } from '../pages/shared/firebase-service';
import { UserService } from '../pages/user/shared/user.service';
import { ProfileEnum, ProfileType } from '../pages/user/shared/profile.enum';
import { UserReady } from '../pages/user/shared/user-notifier';
import { HistoryPage } from '../pages/history/history';
import { WelcomPage } from '../pages/auth/welcom/welcom';
import { SupportPage } from '../pages/support/support';
import { PageModel } from './page.model';
import { PushNotificationService } from '../pages/shared/push-notification.service';
import { AddEditCarPage } from '../pages/car/add-edit/add-edit-cars';
import { UserModel } from '../pages/user/shared/user.model';

declare var cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild(Nav) nav: Nav;

  currentUser: UserModel;
  rootPage: any = WelcomPage;
  pages: Array<PageModel>;
  profileTypeEnum = ProfileEnum;
  ICON_PATH = 'assets/icon/colored/';

  constructor(public platform: Platform, public firebaseService: FirebaseService,
              public pushNotificationService: PushNotificationService, public menuController: MenuController,
              public userService: UserService, public userReady: UserReady) {

    this.initializeApp();

    this.initPagesMenu();

    this.userReady.notifySource$.subscribe(() => {
      this.userService.getCurrent().then(user => {
        if (user) {
          this.currentUser = user;
          this.initPagesMenu(user.profile);
        }
      });

      //TODO put ios/android app id
      AppRate.preferences.storeAppURL = {
        ios: '<my_app_id>',
        android: 'market://details?id=<package_name>',
      };
      // windows: 'ms-windows-store://review/?ProductId=<Store_ID>'
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
      this.pushNotificationService.init();
    });
  }

  goPreviousPage() {
    this.menuController.close();
    if (this.nav.canGoBack()) {
      this.nav.pop();
    }
  }

  openPage(page: PageModel) {
    this.menuController.close();
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.id === 'GetCarParkInfo') {
      cordova.InAppBrowser.open('https://services2.hdb.gov.sg/webapp/BN22CpkVcncy/BN22CpkInfoSearch.jsp', '_blank',
        'location=yes');
    } else if (page.id === 'Invites') {
      (<any>window).plugins.socialsharing.share(`Hey install this app, it's awesome`, 'The best app of the year', '', '<app link to store>')
        .then(() => {
          console.log('share success');
        })
        .catch(() => {
          console.log('share error');
        });
    } else if (page.id === 'RateUs') {
      AppRate.promptForRating(true);
    } else if (page.id === 'LogOut') {
      this.userService.logOut().then(() => this.nav.setRoot(page.component));
    } else {
      this.nav.push(page.component);
    }
  }

  initPagesMenu(profile?: ProfileType) {
    // {icon: '', title: 'Setting', component: SettingPage},
    this.pages = [
      // {icon: ICON_PATH + '/Home-32.png', title: 'Home', component: HomePage, param: {edit: false}},
      {id: 'EditProfile', icon: this.ICON_PATH + 'edit_property-48.png', title: 'Edit Profile', component: ProfilePage}
      ];
    if (profile && profile === ProfileEnum.client) {
      this.pages.push({
        id: 'AddEditVehicle',
        icon:this.ICON_PATH + 'CarRental-48.png',
        title: 'Add/Edit Vehicle',
        component: AddEditCarPage
      });
    }

    this.pages.push({
      id: 'GetCarParkInfo',
      icon: this.ICON_PATH + 'parking-48.png',
      title: 'Get Car Park Info',
      component: null
    });
    this.pages.push({
      id: 'Support',
      icon: this.ICON_PATH + 'customer_support-48.png',
      title: 'Support',
      component: SupportPage
    });
    this.pages.push({
      id: 'Invites',
      icon: this.ICON_PATH + 'Invite-48.png',
      title: 'Invites',
      component: null
    });
    this.pages.push({
      id: 'RateUs',
      icon: this.ICON_PATH + 'Rating-48.png',
      title: 'Rate us',
      component: null
    });

    if (profile && profile === ProfileEnum.manager) {
      this.pages.push({
        id: 'AddManagerCleaner',
        icon: this.ICON_PATH + 'Manager-32.png',
        title: 'Add Supervisor/Washer',
        component: AddUserPage
      });
      this.pages.push({
        id: 'Logs',
        icon: this.ICON_PATH + 'hourglass_sand_top-48.png',
        title: 'Logs Subscriptions',
        component: HistoryPage
      });
    }
    this.pages.push({id: 'LogOut', icon: this.ICON_PATH + 'exit-48.png', title: 'Log out', component: WelcomPage});
  }
}
