import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SwiperModule } from 'angular2-useful-swiper';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { CarItemComponent } from '../pages/car/car-item/car-item';
import { CarParkItemComponent } from '../pages/car-park/car-park-item/car-park-item';
import { CarParkFilterComponent } from '../pages/car-park/car-park-filter/car-park-filter';
import { CamelCasePipe } from '../pages/shared/camel-case.pipe';
import { ValidationMessageService } from '../pages/shared/validator/validation-message.service';
import { FirebaseService } from '../pages/shared/firebase-service';
import { UserReady } from '../pages/user/user-notifier';
import { SubscriberService } from '../pages/shared/subscription/subscriber.service';
import { CarParkService } from '../pages/car-park/shared/car-park.service';
import { CarService } from '../pages/car/shared/car.service';
import { UserService } from '../pages/user/user.service';
import { ChangePasswordPage } from '../pages/setting/change-password/change-password';
import { EditCarParkPage } from '../pages/car-park/edit-car-park/edit-car-park';
import { EditCarPage } from '../pages/car/edit-car/edit-car';
import { CarListPage } from '../pages/car/car-list/car-list';
import { CarParkListPage } from '../pages/car-park/car-park-list/car-park-list';
import { AddUserPage } from '../pages/user/add-user';
import { SettingPage } from '../pages/setting/setting';
import { HomePage } from '../pages/home/home';

@NgModule({
  declarations: [
    MyApp,

    LoginPage,
    ProfilePage,
    AddUserPage,
    CarParkListPage,
    CarListPage,
    EditCarPage,
    ChangePasswordPage,
    EditCarParkPage,
    SettingPage,
    HomePage,

    CarItemComponent,
    CarParkItemComponent,
    CarParkFilterComponent,

    CamelCasePipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    SwiperModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,

    LoginPage,
    ProfilePage,
    AddUserPage,
    CarParkListPage,
    CarListPage,
    EditCarPage,
    EditCarParkPage,
    ChangePasswordPage,
    SettingPage,
    HomePage,
  ],
  providers: [
    UserService,
    CarService,
    CarParkService,
    SubscriberService,
    UserReady,
    FirebaseService,
    ValidationMessageService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
}
