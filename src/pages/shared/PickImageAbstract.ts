
export class PickImageAbstract {

  protected loadImage(event) {
    return new Promise((resolve, reject) => {
      if (event.srcElement.files && event.srcElement.files[0]) {
        var reader = new FileReader();
        reader.onload = resolve;
        reader.onerror = reject;
        reader.readAsDataURL(event.srcElement.files[0]);
      } else {
        reject();
      }
    });
  }

}
