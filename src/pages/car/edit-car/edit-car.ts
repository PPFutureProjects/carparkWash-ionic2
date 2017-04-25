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
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera } from 'ionic-native';
import { ValidationMessageService } from '../../shared/validator/validation-message.service';
import { CarModel } from '../shared/car.model';
import { UtilsPage } from '../../shared/utils.page';
import { CarColourType } from '../shared/car-colour.enum';
import { ColourSelectPage } from './colour-select/colour-select';
import { CarParkModel } from '../../car-park/shared/car-park.model';
import { SubscriberService } from '../subscription/subscriber.service';
import { UserService } from '../../user/shared/user.service';
import { UserModel } from '../../user/shared/user.model';
import { CarService } from '../shared/car.service';
import { CarParkSgApiModel } from '../../car-park/shared/car-park-sg-api.model';
import { CarParkService } from '../../car-park/shared/car-park.service';

@Component({
  selector: 'page-edit-car',
  templateUrl: 'edit-car.html',
})
export class EditCarPage extends UtilsPage {

  action: {title: string, button: string};
  searchCarPark: string | CarParkSgApiModel = <any>{address: ''};
  carParkToSubscribe: CarParkModel;
  carToEdit: CarModel;
  carToEditTemp: CarModel;
  selectedColour: CarColourType;
  selectedPicture: string;
  isPictureLoading = false;

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
              public loadingCtrl: LoadingController, public carService: CarService,
              public domSanitizer: DomSanitizer, public carParkService: CarParkService) {

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
      this.action = {title: 'Edit Vehicle', button: 'Update'};
      this.subscribeAndAdd = false;
    } else {
      this.action = {title: 'Add Vehicle', button: 'Subscribe'};
      this.subscribeAndAdd = true;
    }
    this.buildForm(this.carToEdit);
  }

  ionViewWillEnter() {
    this.buildForm(this.carToEdit);
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
    this.carParkService.getById(this.carParkToSubscribe.id)
      .then(carpark => {
        if (carpark) {
          this.carToEdit.licencePlateNumber = this.carForm.value.licencePlateNumber;
          this.carToEdit.brand = this.carForm.value.brand;
          this.carToEdit.colour = this.selectedColour;
          this.carToEdit.picture = this.selectedPicture;
          this.carToEdit.userUid = this.user.uid;
          if (this.subscribeAndAdd) {
            this.subscribe();
          } else {
            this.viewCtrl.dismiss(this.carToEdit);
          }
        } else {
          this.showToast(`The Car Park ${this.carParkToSubscribe.address} is not added yet`, 'toastError');
        }
      });
  }

  getCarParkAddress = (carPark: any): SafeHtml => {
    let html = `<span>${carPark.address}</span>`;
    return this.domSanitizer.bypassSecurityTrustHtml(html);
  };

  carParkSelected() {
    this.carParkToSubscribe = new CarParkModel();
    this.carParkToSubscribe.id = String((<CarParkSgApiModel>this.searchCarPark)._id);
    this.carParkToSubscribe.code = (<CarParkSgApiModel>this.searchCarPark).car_park_no;
    this.carParkToSubscribe.address = (<CarParkSgApiModel>this.searchCarPark).address;
    this.carParkToSubscribe.x = (<CarParkSgApiModel>this.searchCarPark).x_coord;
    this.carParkToSubscribe.y = (<CarParkSgApiModel>this.searchCarPark).y_coord;
  }

  getCarParks() {
    return this.carParkService.getByAddressAutocompletion(<string>this.searchCarPark);
  }

  private subscribe() {
      if (this.carParkToSubscribe) {
        let loading = this.loadingCtrl.create(this.loadingOptions);
        loading.present();
        this.carService.add(this.user, this.carToEdit).then(() => {
          this.subscriberService.subscribe(this.carParkToSubscribe, this.carToEdit)
            .then(() => {
              loading.dismissAll();
              this.viewCtrl.dismiss();
              this.showToast(`the car ${this.carToEdit.licencePlateNumber}
                  is subscribed to the car park ${this.carParkToSubscribe.address}`, 'toastInfo');
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
  }

  private buildForm(carToEdit: CarModel) {
    this.selectedPicture = carToEdit.picture;
    this.selectedColour = carToEdit.colour;
    this.carForm = this.formBuilder.group({
      licencePlateNumber: [carToEdit.licencePlateNumber, Validators.required],
      brand: [carToEdit.brand]
    });
    this.carForm.valueChanges
      .subscribe(data => this.messageService.onValueChanged(this.carForm, this.formErrors));
    this.messageService.onValueChanged(this.carForm, this.formErrors);
  }

  saveCarToEditTemp() {
    this.carToEditTemp = new CarModel();
    this.carToEditTemp.licencePlateNumber = this.carForm.value.licencePlateNumber;
    this.carToEditTemp.brand = this.carForm.value.brand;
    this.carToEditTemp.colour = this.selectedColour;
    this.carToEditTemp.picture = this.selectedPicture;
  }

}
