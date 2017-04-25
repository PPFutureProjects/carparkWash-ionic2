import { Component } from '@angular/core';
import {
  NavController,
  LoadingOptions,
  ToastController,
  AlertController,
  LoadingController,
  MenuController,
  ActionSheetController
} from 'ionic-angular';
import { UserModel } from '../../user/shared/user.model';
import { ProfileEnum } from '../../user/shared/profile.enum';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../user/shared/user.service';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { UtilsPage } from '../../shared/utils.page';
import { HomePage } from '../../home/home';
import { GlobalValidator } from '../../shared/validator/global.validator';
import { Camera } from 'ionic-native';

@Component({
  selector: 'page-sign-up',
  templateUrl: 'sign-up.html'
})
export class SignUpPage extends UtilsPage {

  userModel = new UserModel();
  password: string = '';
  confirmPassword: string = '';
  selectedPicture: string = 'assets/picture/cam.png';
  isPictureLoading = false;

  signUpForm: FormGroup;
  signUpFormErrors = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
    profile: '',
  };

  private loadingOptions: LoadingOptions;

  constructor(public userService: UserService, public messageService: ValidationMessageService,
              public formBuilder: FormBuilder, public menuCtr: MenuController,
              public navCtrl: NavController, public loadingCtrl: LoadingController,
              public toastCtrl: ToastController, public alertCtrl: AlertController,
              public actionSheetCtrl: ActionSheetController) {

    super(toastCtrl);
    this.userModel = new UserModel();
    this.userModel.profile = ProfileEnum.client;
    this.buildSignUpForm();
    this.menuCtr.enable(false);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
  }

  ionViewWillEnter() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
    this.userService.isAuth()
      .then(isAuth => {
        loading.dismissAll();
        if (isAuth) {
          this.menuCtr.enable(true);
          this.navCtrl.setRoot(HomePage);
        } else {
          this.buildSignUpForm();
        }
      })
      .catch(err => {
        loading.dismissAll();
        console.error(err);
      });
  }

  ionViewWillLeave() {
    GlobalValidator.endSamePassword(this.signUpForm, 'signUp');
  }

  startPickPicture() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Picture Source',
      buttons: [
        {
          text: 'Camera',
          handler: () => {
            this.pickPicture(Camera.PictureSourceType.CAMERA).then((imageData) => {
              this.selectedPicture = "data:image/jpeg;base64," + imageData;
            }, (err) => {
              console.log(err);
              this.showToast('Fail to get picture', 'toastError');
            });;
          }
        },{
          text: 'Gallery',
          handler: () => {
            this.pickPicture(Camera.PictureSourceType.PHOTOLIBRARY).then((imageData) => {
              this.selectedPicture = "data:image/jpeg;base64," + imageData;
            }, (err) => {
              console.log(err);
              this.showToast('Fail to get picture', 'toastError');
            });;
          }
        },{
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    });
    actionSheet.present();
  }

  backToLoginPage() {
    this.navCtrl.pop();
  }

  signUp() {
    let loading = this.loadingCtrl.create(this.loadingOptions);
    loading.present();
  // , this.carModel
    this.userModel.picture = this.selectedPicture;
    this.userService.create(this.userModel, this.password, true).then(() => {
      loading.dismissAll();
      this.navCtrl.setRoot(HomePage);
      this.menuCtr.enable(true);
      this.showToast('Sign Up Success', 'toastInfo');
    }).catch((err: firebase.FirebaseError) => {
      loading.dismissAll();
      console.error(err);
      let errMsg = 'Sign Up Fail';

      switch (err.code) {
        case 'auth/email-already-in-use-but-not-verified':
          let alert = this.alertCtrl.create({
            title: err.message[0],
            message: err.message[1],
            buttons: [
              {
                text: 'Re-sent',
                handler: () => {
                  let loading = this.loadingCtrl.create(this.loadingOptions);
                  loading.present();
                  this.userService.sentEmailVerification().then(() => {
                    loading.dismissAll();
                    this.showToast('Verification email sent', 'toastInfo');
                  }).catch(err => {
                    loading.dismissAll();
                    console.log(err);
                    this.showToast(
                      'Error Sending Verification email, please contact admin',
                      'toastError');
                  });
                }
              },
              {
                text: 'Cancel',
                role: 'cancel'
              }
            ]
          });
          alert.present();
          break;
        case 'auth/email-already-in-use':
          errMsg = err.message;
          break;
        case 'auth/network-request-failed':
          errMsg = 'No Internet Connection';
          break;
      }

      this.showToast(errMsg, 'toastError');
    });
  }

  private buildSignUpForm() {
    this.signUpForm = this.formBuilder.group({
      email: ['', Validators.compose([Validators.required,
        GlobalValidator.mailFormat,
        Validators.maxLength(this.messageService.maxLengthEmail)])],
      name: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthName),
        Validators.maxLength(this.messageService.maxLengthName)])],
      password: ['', Validators.compose(
        [Validators.required, Validators.minLength(this.messageService.minLengthPassword),
          Validators.maxLength(this.messageService.maxLengthPassword)])],
      confirmPassword: ['', Validators.required],
      address: ['', Validators.compose([Validators.required,
        Validators.minLength(this.messageService.minLengthAddress),
        Validators.maxLength(this.messageService.maxLengthAddress)])],
      phoneNumber: ['', Validators.compose([Validators.required,
        Validators.pattern(/\(?([0-9]{3})?\)?([ .-]?)([0-9]{3})\2([0-9]{4})/)])]
    });
    this.signUpForm.valueChanges.subscribe(data => {
      this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    });
    this.messageService.onValueChanged(this.signUpForm, this.signUpFormErrors);
    setTimeout(GlobalValidator.samePassword(this.signUpForm, 'signUp'), 2000);
  }

}

