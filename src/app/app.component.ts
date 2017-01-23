import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar, Splashscreen } from 'ionic-native';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { AddUserPage } from '../pages/user/add-user';
import { FirebaseService } from '../pages/shared/firebase-service';
import { UserService } from '../pages/user/user.service';
import { ProfileTypeEnum } from '../pages/shared/profile-type.enum';
import { UserReady } from '../pages/user/user-notifier';

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

    this.userReady.notifySource$.subscribe(() => {
      this.userService.getCurrent().then(user => {
        if (user) {
          if (user.profile === ProfileTypeEnum.admin) {
            this.pages = [
              {title: 'Profile', component: ProfilePage},
              //{ title: 'Ssetting', component: Setting },
              {title: 'Add Manager/Cleaner', component: AddUserPage},
              {title: 'Disconnect', component: LoginPage}
            ];
          } else {
            this.pages = [
              {title: 'Profile', component: ProfilePage},
              {title: 'Disconnect', component: LoginPage}
            ];
          }
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

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    if (page.title == this.pages[this.pages.length - 1].title) {
      this.userService.logOut().then(() => this.nav.setRoot(page.component));
    } else {
      this.nav.setRoot(page.component);
    }
  }
}
