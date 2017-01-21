export class ServiceUtils {

  /**
   * Transform object of objects into array of objects
   *
   * @param objects
   * @returns {any[]}
   */
  protected arrayFromObject(objects) {
    return Object.keys(objects ? objects : []).map(key => objects[key]);
  }
}
