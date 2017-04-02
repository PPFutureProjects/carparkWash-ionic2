import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { SwiperModule } from 'angular2-useful-swiper';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { MyApp } from './app.component';
import { LoginPage } from '../pages/auth/login/login';
import { ProfilePage } from '../pages/profile/profile';
import { CarItemComponent } from '../pages/car/car-item/car-item';
import { CarParkItemComponent } from '../pages/car-park/car-park-item/car-park-item';
import { CarParkFilterComponent } from '../pages/car-park/car-park-filter/car-park-filter';
import { CamelCasePipe } from '../pages/shared/camel-case.pipe';
import { ValidationMessageService } from '../pages/shared/validator/validation-message.service';
import { FirebaseService } from '../pages/shared/firebase-service';
import { UserReady } from '../pages/user/shared/user-notifier';
import { SubscriberService } from '../pages/car/subscription/subscriber.service';
import { CarParkService } from '../pages/car-park/shared/car-park.service';
import { CarService } from '../pages/car/shared/car.service';
import { UserService } from '../pages/user/shared/user.service';
import { ChangePasswordPage } from '../pages/profile/change-password/change-password';
import { EditCarParkPage } from '../pages/car-park/edit-car-park/edit-car-park';
import { EditCarPage } from '../pages/car/edit-car/edit-car';
import { CarListPage } from '../pages/car/car-list/car-list';
import { CarParkListPage } from '../pages/car-park/car-park-list/car-park-list';
import { AddUserPage } from '../pages/user/add-user';
import { SettingPage } from '../pages/setting/setting';
import { HomePage } from '../pages/home/home';
import { HistoryPage } from '../pages/history/history';
import { HistoryService } from '../pages/history/shared/history.service';
import { EventBus } from '../pages/shared/eventBus';
import { WelcomPage } from '../pages/auth/welcom/welcom';
import { SignUpPage } from '../pages/auth/sign-up/sign-up';
import { ColourSelectPage } from '../pages/car/edit-car/colour-select/colour-select';
import { TypeSelectPage } from '../pages/car/edit-car/type-select/type-select';
import { SupportPage } from '../pages/support/support';
import { SupportService } from '../pages/support/support-service';
import { ConfirmSentPage } from '../pages/support/confirm-sent/confirm-sent';
import { HistoryClientComponent } from '../pages/history/client/history-client';
import { HistoryCarParkComponent } from '../pages/history/car-park/history-car-park';
import { SelectCleanerPage } from '../pages/car/select-cleaner/select-cleaner';
import { RespondToJobPage } from '../pages/car/respond-to-job/respond-to-job';
import { PushNotificationService } from '../pages/shared/push-notification.service';
import { AddEditCarPage } from '../pages/car/add-edit/add-edit-cars';
import { SubscriptionPage } from '../pages/car/subscription/subscription';
import { JobItemComponent } from '../pages/car/job/job-item';

// firebase-import --database_url https://carparkwashingservice.firebaseio.com --path /allCarParks --json data.json

@NgModule({
  declarations: [
    MyApp,

    WelcomPage,
    SignUpPage,
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
    HistoryPage,
    TypeSelectPage,
    SupportPage,
    ConfirmSentPage,
    SelectCleanerPage,
    RespondToJobPage,
    AddEditCarPage,
    SubscriptionPage,
    ColourSelectPage,

    CarItemComponent,
    CarParkItemComponent,
    CarParkFilterComponent,
    HistoryClientComponent,
    HistoryCarParkComponent,
    JobItemComponent,

    CamelCasePipe
  ],
  imports: [
    IonicModule.forRoot(MyApp),
    SwiperModule,
    Ng2AutoCompleteModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,

    WelcomPage,
    SignUpPage,
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
    HistoryPage,
    TypeSelectPage,
    SupportPage,
    ConfirmSentPage,
    SelectCleanerPage,
    RespondToJobPage,
    AddEditCarPage,
    SubscriptionPage,
    ColourSelectPage
  ],
  providers: [
    UserService,
    CarService,
    CarParkService,
    SubscriberService,
    UserReady,
    FirebaseService,
    ValidationMessageService,
    HistoryService,
    SupportService,
    EventBus,
    PushNotificationService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
}
