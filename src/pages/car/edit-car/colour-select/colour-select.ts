import { Component } from '@angular/core';
import { CarColourType, CarColourEnum } from '../../shared/car-colour.enum';
import { ViewController, NavParams } from 'ionic-angular';
import { CarModel } from '../../shared/car.model';

@Component({
  selector: 'colour-select',
  templateUrl: 'colour-select.html'
})
export class ColourSelectPage {

  private carToEdit: CarModel;
  colours: Array<CarColourType>;

  constructor(public viewCtrl: ViewController, public params: NavParams) {
    this.carToEdit = params.get('carToEdit');
    this.colours = new Array<CarColourType>();
    for (let i in CarColourEnum) {
      this.colours.push(CarColourEnum[i]);
    }
  }

  selectColour(colour: CarColourType) {
    this.carToEdit.colour = colour;
    this.viewCtrl.dismiss(this.carToEdit);
  }

}

// openSelectColour() {
//   let alert = this.alertCtrl.create({
//     title: 'Select the Car Colour',
//     message: `Type the colour name if it's not in the palette`,
//     inputs: [
//       {
//         name: 'colourName',
//         placeholder: 'Colour Name'
//       }
//     ],
//     buttons: [
//       {
//         text: 'Select',
//         cssClass: 'specialColor',
//         handler: data => {
//           this.value = data.colourName;
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'White',
//         cssClass: 'white',
//         handler: data => {
//           this.value = 'white';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Black',
//         cssClass: 'black',
//         handler: data => {
//           this.value = 'black';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'yellow',
//         cssClass: 'yellow',
//         handler: data => {
//           this.value = 'yellow';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Red',
//         cssClass: 'red',
//         handler: data => {
//           this.value = 'red';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Green',
//         cssClass: 'green',
//         handler: data => {
//           this.value = 'green';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Orange',
//         cssClass: 'orange',
//         handler: data => {
//           this.value = 'orange';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Purple',
//         cssClass: 'purple',
//         handler: data => {
//           this.value = 'purple';
//           this.valueChanged();
//         },
//       },
//       // {
//       //   text: 'Pink',
//       //   cssClass: 'pink',
//       //   handler: data => {
//       //     this.value = 'pink';
//       //     this.valueChanged();
//       //   },
//       // },
//       {
//         text: 'Blue',
//         cssClass: 'blue',
//         handler: data => {
//           this.value = 'blue';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Brown',
//         cssClass: 'brown',
//         handler: data => {
//           this.value = 'brown';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Grey',
//         cssClass: 'grey',
//         handler: data => {
//           this.value = 'grey';
//           this.valueChanged();
//         },
//       },
//       {
//         text: 'Light Grey',
//         cssClass: 'lightgrey',
//         handler: data => {
//           this.value = 'lightgrey';
//           this.valueChanged();
//         },
//       }
//     ]
//   });
//   alert.present();
// }

