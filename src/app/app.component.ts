import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { AddUserPage } from '../pages/user/add-user';
import { FirebaseService } from '../pages/shared/firebase-service';
import { UserService } from '../pages/user/user.service';
import { ProfileEnum } from '../pages/shared/profile.enum';
import { UserReady } from '../pages/user/user-notifier';
import { SettingPage } from '../pages/setting/setting';
import { HomePage } from '../pages/home/home';
import { UserListPage } from "../pages/history/user-list";
declare var cordova: any;

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public firebaseService: FirebaseService,
              public userService: UserService, public userReady: UserReady) {

    this.initializeApp();

    this.initPagesMenu();
    this.userReady.notifySource$.subscribe(() => {
      this.userService.getCurrent().then(user => {
        if (user) {
          this.initPagesMenu(user.profile === ProfileEnum.admin);
        }
      });
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
      Splashscreen.hide();
    });
  }

  openPage(page: {title: string, component: any}) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.component === null) {
      cordova.InAppBrowser.open('https://services2.hdb.gov.sg/webapp/BN22CpkVcncy/BN22CpkInfoSearch.jsp', '_blank', 'location=yes');
    } else if (page.title == this.pages[this.pages.length - 1].title) {
      this.userService.logOut().then(() => this.nav.setRoot(page.component));
    } else {
      this.nav.setRoot(page.component);
    }
  }

  initPagesMenu(isAdmin: boolean = false) {
    this.pages = [
      {title: 'Home', component: HomePage},
      {title: 'Profile', component: ProfilePage},
      {title: 'Setting', component: SettingPage},
      {title: 'Get Car Park Info', component: null}
    ];
    if (isAdmin) {
      this.pages.push({title: 'Add Manager/Cleaner', component: AddUserPage});
      this.pages.push({title: 'History Subscriptions', component: UserListPage});
    }
    this.pages.push({title: 'Disconnect', component: LoginPage});
  }
}
