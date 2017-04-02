
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

  /**
   * Merge array of arrays
   *
   * @param results
   * @returns {Array<Object>}
   */
  protected mergeResults(results: Array<Array<Object>>) {
    return results.reduce((merged, result) => merged.concat(result), []);
  }

  /**
   * Create a simple object of an object, to be saved in the database
   *
   * @param object
   * @param letArrayObjects
   * @param letPrimitiveMap
   * @returns {any}
   */
  protected getSimpleObject(object: Object, letArrayObjects: boolean = false, letPrimitiveMap: boolean = false) {
    let simpleObject = {};
    for (let att in object) {
      if (this.isFieldToSave(object, att, letArrayObjects, letPrimitiveMap) && !this.isUndefined(object[att])) {
        simpleObject[att] = object[att];
      }
    }
    return simpleObject;
  }

  /**
   * Return true if value is undefined or null
   *
   * @param value
   * @returns {boolean}
   */
  private isUndefined(value: any) {
    return value === undefined || value === null;
  }

  /**
   * Vérify fields by type, to save them on database or not
   *
   * @param object
   * @param att
   * @param letArrayObjects
   * @returns {boolean}
   */
  private isFieldToSave(object: Object, att: string | number, letArrayObjects: boolean, letObjectPrimitives: boolean) {
    let isPrimitive = this.isPrimitive(object[att]);
    let isArrayPrimitives = object[att] instanceof Array && object[att].length > 0 && this.isPrimitive(object[att][0]);
    let hasPrimitiveValueObject = this.hasPrimitiveValueObject(object[att]);
    return object.hasOwnProperty(att)
      && (isPrimitive || isArrayPrimitives
      || (letArrayObjects && !isArrayPrimitives)
      || (letObjectPrimitives && hasPrimitiveValueObject));
  }

  private isPrimitive(value) {
    return value !== Object(value);
  }

  private hasPrimitiveValueObject(value) {
    for (let att in value) {
      if (value.hasOwnProperty(att)) {
        if (!this.isPrimitive(value[att])) {
          return false;
        }
      }
    }
    return true;
  }

}
