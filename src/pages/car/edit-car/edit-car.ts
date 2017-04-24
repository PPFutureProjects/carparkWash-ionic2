import { Component } from '@angular/core';
import {
  ViewController,
  NavParams,
  ToastController,
  ModalController,
  ActionSheetController,
  LoadingController,
  LoadingOptions
} from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from 'ionic-native';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarModel } from '../shared/car.model';
import { UtilsPage } from '../../shared/utils.page';
import { CarColourType } from '../shared/car-colour.enum';
import { CarTypeEnum, CarType } from '../shared/car-silhouette.enum';
import { TypeSelectPage } from './type-select/type-select';
import { ColourSelectPage } from './colour-select/colour-select';
import { SubscriptionPage } from '../subscription/subscription';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { SubscriberService } from '../subscription/subscriber.service';
import { UserService } from '../../user/shared/user.service';
import { UserModel } from '../../user/shared/user.model';
import { CarService } from '../shared/car.service';

@Component({
  selector: 'page-edit-car',
  templateUrl: 'edit-car.html',
})
export class EditCarPage extends UtilsPage {

  title: string;
  carToEdit: CarModel;
  carToEditTemp: CarModel;
  selectedColour: CarColourType;
  selectedType: CarType;
  selectedPicture: string;
  isPictureLoading = false;

  silhouetteEnum = CarTypeEnum;
  carForm: FormGroup;
  formErrors = {
    licencePlateNumber: '',
    brand: '',
    model: '',
  };
  private loadingOptions: LoadingOptions;
  private subscribeAndAdd: boolean;
  private user: UserModel;

  constructor(public formBuilder: FormBuilder, public viewCtrl: ViewController, public toastCtrl: ToastController,
              public messageService: ValidationMessageService, public params: NavParams,
              public modalCtrl: ModalController, public actionSheetCtrl: ActionSheetController,
              public subscriberService: SubscriberService, public userService: UserService,
              public loadingCtrl: LoadingController, public carService: CarService) {

    super(toastCtrl);
    this.loadingOptions = {
      content: 'Loading',
      spinner: 'crescent',
      showBackdrop: false
    };
    userService.getCurrent().then(user => this.user = user)
      .catch(err => console.log(err));
    this.carToEdit = params.get('carToEdit') ? params.get('carToEdit') : new CarModel();
    if (this.carToEdit.licencePlateNumber) {
      this.title = 'Edit Vehicle';
      this.subscribeAndAdd = false;
    } else {
      this.title = 'Add Vehicle';
      this.subscribeAndAdd = true;
    }
    this.buildForm(this.carToEdit);
  }

  ionViewWillEnter() {
    this.buildForm(this.carToEdit);
  }

  selectSilhouette() {
    this.saveCarToEditTemp();
    let carTypeSelectPage = this.modalCtrl.create(TypeSelectPage,
      {'carToEdit': this.carToEditTemp});
    carTypeSelectPage.onDidDismiss((carToEdit: CarModel) => {
      this.buildForm(carToEdit);
    });
    carTypeSelectPage.present();
  }

  selectColour(carColour: CarColourType) {
    this.saveCarToEditTemp();
    let carColourSelectPage = this.modalCtrl.create(ColourSelectPage,
      {'carToEdit': this.carToEditTemp});
    carColourSelectPage.onDidDismiss((carToEdit: CarModel) => {
      this.buildForm(carToEdit);
    });
    carColourSelectPage.present();
  }

  startPickPicture() {
    this.actionSheetCtrl.create({
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
            });
          }
        },{
          text: 'Gallery',
          handler: () => {
            this.pickPicture(Camera.PictureSourceType.PHOTOLIBRARY).then((imageData) => {
              this.selectedPicture = "data:image/jpeg;base64," + imageData;
            }, (err) => {
              console.log(err);
              this.showToast('Fail to get picture', 'toastError');
            });
          }
        },{
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    }).present();
  }

  cancel() {
    this.viewCtrl.dismiss(false);
  }

  save() {
    this.carToEdit.licencePlateNumber = this.carForm.value.licencePlateNumber;
    this.carToEdit.brand = this.carForm.value.brand;
    this.carToEdit.model = this.carForm.value.model;
    this.carToEdit.colour = this.selectedColour;
    this.carToEdit.type = this.selectedType;
    this.carToEdit.picture = this.selectedPicture;
    this.carToEdit.userUid = this.user.uid;
    if (this.subscribeAndAdd) {
      this.subscribe();
    } else {
      this.viewCtrl.dismiss(this.carToEdit);
    }
  }

  private subscribe() {
    let subscriptionPage = this.modalCtrl.create(SubscriptionPage,
      {carToSubscribe: this.carToEdit, isActifSubscription: false});
    subscriptionPage.onDidDismiss((result: {carPark: CarParkModel, lotNumber: string}) => {
      console.log(result.carPark);
      if (result.carPark) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carService.add(this.user, this.carToEdit).then(() => {
          this.subscriberService.subscribe(result.carPark, this.carToEdit)
            .then(() => {
              loading.dismissAll();
              this.viewCtrl.dismiss();
              this.showToast(`the car ${this.carToEdit.licencePlateNumber}
                  is subscribed to the car park ${result.carPark.address}`, 'toastInfo');
            })
            .catch(err => {
              loading.dismissAll();
              console.error(err);
              this.showToast('Fatal Error, please contact admin', 'toastError');
            });
        }).catch(err => {
          loading.dismissAll();
          console.error(err);
          this.showToast(`Fail to add ${this.carToEdit.licencePlateNumber}`, 'toastError');
        });
      }
    });
    subscriptionPage.present();
  }

  private buildForm(carToEdit: CarModel) {
    this.selectedPicture = carToEdit.picture;
    this.selectedColour = carToEdit.colour;
    this.selectedType = carToEdit.type;
    this.carForm = this.formBuilder.group({
      licencePlateNumber: [carToEdit.licencePlateNumber, Validators.required],
      brand: [carToEdit.brand],
      model: [carToEdit.model],
    });
    this.carForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carForm, this.formErrors));
    this.messageService.onValueChanged(this.carForm, this.formErrors);
  }

  saveCarToEditTemp() {
    this.carToEditTemp = new CarModel();
    this.carToEditTemp.licencePlateNumber = this.carForm.value.licencePlateNumber;
    this.carToEditTemp.brand = this.carForm.value.brand;
    this.carToEditTemp.model = this.carForm.value.model;
    this.carToEditTemp.colour = this.selectedColour;
    this.carToEditTemp.type = this.selectedType;
    this.carToEditTemp.picture = this.selectedPicture;
  }

}
